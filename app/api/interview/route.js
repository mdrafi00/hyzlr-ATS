import { NextResponse } from "next/server";
import mammoth from "mammoth";
import dotenv from "dotenv";
import { PdfReader } from "pdfreader";
import OpenAI from "openai";
// import axios from "axios";

dotenv.config(); // Load environment variables

const openai = new OpenAI({apiKey: process.env.OPEN_AI_API_KEY});

const sessions = new Map(); // Store interview sessions in memory
const MAX_QUESTIONS = 11;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription");
    const file = formData.get("file");

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Job description must be at least 50 characters long" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileType = file.type;

    // Extract text from the PDF
    const extractedText = await extractTextFromFile(Buffer.from(buffer), fileType);

    if (!extractedText) {
      return NextResponse.json(
        { error: "Failed to extract text from PDF" },
        { status: 500 }
      );
    }
  
    const sessionId = crypto.randomUUID();
    const { Question, estimatedTime, ResponseTime } = await getOpenAIChatCompletion(
      jobDescription,
      extractedText, 
      "easy",
      "technical",
      []
    );

    sessions.set(sessionId, {
      jobDescription,
      extractedText,
      questions: [{
        question: Question,
        userResponse: null,
        actualTime: estimatedTime,
        ResponseTime: ResponseTime
      }]
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ sessionId, question: Question }) + "\n"));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Too Many Request Token Limit Exit!" }, { status: 429 });
  }
}


export async function PATCH(req) {
  try {
    const { sessionId, answer } = await req.json();

    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    if (!answer || answer.trim().length < 5) {
      return NextResponse.json({ error: "Answer must be at least 5 characters long" }, { status: 400 });
    }

    const sessionData = sessions.get(sessionId);
    let { jobDescription, extractedText, questions } = sessionData;

    if (questions.length >= MAX_QUESTIONS) {
      return NextResponse.json({ message: "Interview complete", sessionId, questions }, { status: 200 });
    }

    questions[questions.length - 1].userResponse = answer;
    questions[questions.length - 1]['CandidateAnsweredTime'] = new Date().toTimeString().split(' ')[0];

    const nextDifficulty = getNextDifficulty(questions.length);
    const nextCategory = getNextCategory(questions.length);

    const { Question, estimatedTime, ResponseTime } = await getOpenAIChatCompletion(
      jobDescription,
      extractedText,
      nextDifficulty,
      nextCategory,
      questions
    );

    questions.push({
      question: Question,
      userResponse: null,
      actualTime: estimatedTime,
      ResponseTime: ResponseTime,
    });

    return NextResponse.json({ sessionId, questions });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Too Many Request Token Limit Exit!" }, { status: 429 });
  }
}

async function extractTextFromFile(buffer, fileType) {
  try {
    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const { value } = await mammoth.extractRawText({ buffer });
      return value.trim();
    } else if (fileType === "text/plain") {
      return buffer.toString("utf-8").trim();
    } else if (fileType === "application/pdf") {
      return new Promise((resolve, reject) => {
        let extractedText = "";
        new PdfReader().parseBuffer(buffer, (err, item) => {
          if (err) {
            console.error("Error extracting text from PDF:", err);
            return reject(err);
          }
          if (!item) {
            return resolve(extractedText.trim()); // End of file
          }
          if (item.text) {
            extractedText += item.text + " ";
          }
        });
      });
    } else {
      throw new Error("Unsupported file type. Only .docx, .txt, and .pdf are supported.");
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return "";
  }
}


async function getOpenAIChatCompletion(jobDescription, extractedText, difficulty, category, history) {
  const formattedHistory = history.map((q, i) => `Q${i + 1}: ${q.question}\nUser's Answer: ${q.userResponse || "(no answer)"}\n`).join("\n");

  const prompt = `
  // You are an AI interviewer generating **${difficulty} ${category} interview questions** based on the job description and candidate's resume. Ask more questions related to the skillset mentioned in the Resume/user CV, ensuring that each question covers a distinct concept.  
  
  // For example, if a question is asked about jet engine fuel injection, the next question should focus on a different aspect, such as how an engine carburetor is made. Avoid asking multiple questions about the same topic.  
  
  // Ensure that questions are technical and core concept-based rather than generic. If the candidate is from a software background, ask programming-related questions on topics such as state management, differences between useRef() and useMemo(), etc.  
  
  // **DO NOT repeat past questions and answers.**  
  
  🔹 **Job Description:**  "${jobDescription}"  
  🔹 **Candidate's Resume:**  "${extractedText}"  
  🔹 **Past Questions & Answers:**  ${formattedHistory}  
  
  ### **FORMAT:**  
  {  
      "Question": "Can you explain the difference between using "useState" and Redux for state management in React and provide scenarios where each is most appropriate?",  
      "EstimatedTime": "3 minutes"  
  }  
  
  🔴 **Rules:**  
  1️⃣ **DO NOT repeat past questions.**  
  2️⃣ **Focus on job relevance.**  
  3️⃣ **Ask only one question at a time.**  
  4️⃣ **Ensure each question covers a new concept.**  
  5️⃣ **Ignore irrelevant user responses.**  
  6️⃣ **Return only the question in the specified format:**  
  
  **Example Output:**  
  """json  
  {  
    "Question": "How does garbage collection work in JavaScript, and what are the different types of garbage collection techniques?",  
    "EstimatedTime": "2 minutes"  
  }  
  `;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: "You are a structured AI interviewer." }, { role: "user", content: prompt }],
    stream: true,
  });

  let result = "";
  for await (const chunk of stream) {
    result += chunk.choices[0]?.delta?.content || "";
  }

  result = result.replace(/```json|```/g, "").trim();
  console.log("OpenAI Response Stream Output:", result);

  try {
    const parsedResponse = JSON.parse(result);
    return {
      Question: parsedResponse.Question || "No question available.",
      estimatedTime: parsedResponse.EstimatedTime || "Unknown",
      ResponseTime: new Date().toTimeString().split(' ')[0]
    };
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error, "Raw Output:", result);
    return {
      Question: "No question available.",
      estimatedTime: "Unknown",
      ResponseTime: new Date().toTimeString().split(' ')[0]
    };
  }
}

// 📌 Determine Next Difficulty Level
function getNextDifficulty(questionCount) {
  return questionCount < 2 ? "easy" : questionCount < 4 ? "medium" : "hard";
}

// 📌 Cycle Through Question Categories
function getNextCategory(questionCount) {
  const categories = ["technical", "behavioral", "situational"];
  return categories[questionCount % 2];
}