import OpenAI from "openai";
import { NextResponse } from "next/server";
import { PdfReader } from "pdfreader";
import mammoth from "mammoth";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({apiKey: process.env.OPEN_AI_API_KEY});


export async function POST(req) {
  try {
    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription");
    const file = formData.get("file");

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json({ error: "Job description must be at least 50 characters long" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file stream to Buffer
    const buffer = await file.arrayBuffer();
    const fileType = file.type;

    // Extract text from the PDF
    const extractedText = await extractTextFromFile(Buffer.from(buffer), fileType);

    if (!extractedText) {
      return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
    }

    // Generate interview questions using Groq
    const aiResponse = await getOpenAIChatCompletion(jobDescription, extractedText);

    let rawJsonString = aiResponse.choices[0].message.content;

    // Remove Markdown code block markers if they exist
    rawJsonString = rawJsonString.replace(/```json|```/g, "").trim();
    
    try {
        const parsedJson = JSON.parse(rawJsonString);
        return NextResponse.json({ message: "Processing complete", parsedJson }, { status: 200 });
    } catch (error) {
        console.error("JSON Parsing Error:", error);
        return NextResponse.json({ error: "Invalid JSON format received from AI response" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Too Many Request Token Limit Exit!" }, { status: 429 });
  }
}

// async function extractTextFromPDF(buffer) {
//   return new Promise((resolve, reject) => {
//     let extractedText = "";

//     new PdfReader().parseBuffer(buffer, (err, item) => {
//       if (err) {
//         console.error("Error extracting text from PDF:", err);
//         return reject(err);
//       }
//       if (!item) {
//         return resolve(extractedText.trim()); // End of file
//       }
//       if (item.text) {
//         extractedText += item.text + " ";
//         console.log('ExtractedText:', extractedText);
//       }
//     });
//   });
// }

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


async function getOpenAIChatCompletion(jobDescription, extractedText) {
  return await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `AI-Driven Interview Question Generation

        Objective:
        - Generate a structured set of interview questions based on the provided job description and candidate's resume.
        
        Methodology:
        - Utilize AI to analyze both data sources.
        - Ensure the AI considers both inputs to create highly relevant questions.
        
        Output Format:
        - Return an **array of objects** containing Two sets of interview questions.
        - Each set should include three categories: **Technical, Behavioral, Situational**.
        - Each category should contain an object with three difficulty levels: **easy, medium, hard**.
        - The structure should be as follows:

        IMPORTANT:
        TWO sets of Interview questions.

          [
    {
      "set": 1,
      "categories": [
        {
          "category": "Technical",
          "questions": {
            "easy": [
              "Can you explain the concept of a promise in JavaScript?",
              "How do you handle errors in a React application?",
              "Can you describe your experience with WebSockets?"
            ],
            "medium": [
              "Can you describe your experience with GraphQL, and how you've used it in previous projects?",
              "How do you optimize the performance of a GraphQL API?",
              "Can you explain the concept of a message queue, and how you've implemented it in a previous project?"
            ],
            "hard": [
              "Can you describe your experience with cloud computing, and how you've used it in previous projects?",
              "How do you handle security and compliance in a cloud-based architecture?",
              "Can you explain the concept of a container orchestration tool, and how you've used it in a previous project?"
            ]
          }
        },
        {
          "category": "Behavioral",
          "questions": {
            "easy": [
              "Can you tell me about a time when you had to work with a cross-functional team?",
              "How do you handle a situation where you're not sure about the technical requirements of a project?",
              "Can you describe your experience with agile development methodologies?"
            ],
            "medium": [
              "Can you tell me about a project you worked on that involved a significant amount of collaboration with other teams?",
              "How do you handle a situation where you're working on a team and a team member is not communicating effectively?",
              "Can you describe your experience with conflict resolution, and how you've handled conflicts in the past?"
            ],
            "hard": [
              "Can you tell me about a time when you had to make a difficult technical decision, and how you approached it?",
              "How do you handle a situation where you're working on a team and there are conflicting opinions on how to approach a technical problem?",
              "Can you describe your experience with technical leadership, and how you've mentored junior team members?"
            ]
          }
        },
        {
          "category": "Situational",
          "questions": {
            "easy": [
              "If you were given a new project with a tight deadline, how would you approach it?",
              "If you encountered a technical issue that you couldn't solve, what would you do?",
              "If you were working on a team and a team member was struggling with their tasks, what would you do to help?"
            ],
            "medium": [
              "If you were given a project with multiple stakeholders, how would you manage their expectations and priorities?",
              "If you encountered a conflict between two team members, how would you resolve it?",
              "If you were working on a project and realized that the requirements had changed, how would you adapt to the new requirements?"
            ],
            "hard": [
              "If you were given a project with a large and complex codebase, how would you approach it?",
              "If you encountered a technical issue that required a significant amount of time and resources to solve, how would you prioritize it?",
              "If you were working on a team and the project was at risk of failing, what would you do to turn it around?"
            ]
          }
        }
      ]
    },
    {
      "set": 2,
      "categories": [
        {
          "category": "Technical",
          "questions": {
            "easy": [...],
            "medium": [...],
            "hard": [...]
          }
        },
        {
          "category": "Behavioral",
          "questions": {
            "easy": [....],
            "medium": [...],
            "hard": [...]
          }
        },
        {
          "category": "Situational",
          "questions": {
            "easy": [...],
            "medium": [...],
            "hard": [...]
          }
        }
      ]
    }
  ]
          
        - Ensure clarity and relevance of each question to the candidate’s skills and job role.`
      },
      {
        role: "user",
        content: `Job Description: ${jobDescription}\n\nExtracted Resume Text: ${extractedText}`
      }
    ],
  });

}