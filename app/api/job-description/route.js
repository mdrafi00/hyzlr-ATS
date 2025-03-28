import OpenAI from "openai";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { PdfReader } from "pdfreader";
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

    // Send extracted text to Groq
    const aiResponse = await getOpenAIChatCompletion(jobDescription, extractedText);

    try {
      const rawJsonString = aiResponse.choices[0].message.content;
      const parsedJson = JSON.parse(rawJsonString);
    return NextResponse.json({ message: "Processing complete", parsedJson }, { status: 200 });

  } catch (error) {
      console.error("Error parsing JSON:", error);
      const aiResponses = await getOpenAIChatCompletion(jobDescription, extractedText);
      const rawJsonString = aiResponses.choices[0].message.content;
      const parsedJson = JSON.parse(rawJsonString);
    return NextResponse.json({ message: "Processing complete", parsedJson }, { status: 200 });
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
//         console.log('ExtractedText:',extractedText)
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
          content: `Analyze the candidate's resume against the job description and return a **STRICT JSON response** in the following format:
  
          {
            "candidate": {
              "about": "candidate Name",
              "skills": ["Skill 1", "Skill 2", "Skill 3"],
              "short_description": [
                "Brief summary of the candidate.",
                "Short description about the candidate",
                "Candidate special in the field and skill set"
              ],
              "other_summary": {
                "experience": "X Years",
                "preferred_location": "Candidate's location",
                "current_company": "Candidate's current company"
              },
              "evaluation": {
                "title": "Evaluation based on JD and Resume",
                "scores": {
                  "Overall": 0-10,
                  "Skill": 0-10,
                  "Experience": 0-10,
                  "Others": 0-10
                },
                "evaluation_reason": ["Reason 1", "Reason 2", "Reason 3"]
              },
              "can_we_take_this_candidate": "yes" or "no"
            }
          }
  
          **Rules:**
          - Return only valid JSON, **no extra text, explanations, or formatting**.
          - If a value is unavailable, use null or an empty string ("").
          - Keep numerical scores between 0-100.
          - "can_we_take_this_candidate" must strictly be "yes" or "no".
  
          **Examples:**
  
          **Example 1:**
          Job Description: Software Engineer (React, Node.js)
          Resume: 5 years experience, React, Node.js, MongoDB, AWS
  
          **Expected JSON Response:**
          {
            "candidate": {
              "about": "Experienced full-stack developer with expertise in React and Node.js.",
              "skills": ["React", "Node.js", "MongoDB", "AWS"],
              "short_description": ["At least 10 characters", "At least one lowercase character", "At least one special character, e.g., ! @ # ?"],
              "other_summary": {
                "experience": "5 Years",
                "preferred_location": "",
                "current_company": ""
              },
              "evaluation": {
                "title": "Evaluation based on JD and Resume",
                "scores": {
                  "Overall": 85,
                  "Skill": 90,
                  "Experience": 80,
                  "Others": 75
                },
                "evaluation_reason": ["Strong match for required skills", "Relevant industry experience"]
              },
              "can_we_take_this_candidate": "yes"
            }
          }
  
          **Example 2:**
          Job Description: Data Analyst (SQL, Python, Power BI)
          Resume: 2 years experience, Excel, Python
  
          **Expected JSON Response:**
          {
            "candidate": {
              "about": "Data analyst with experience in Python and Excel but lacking Power BI skills.",
              "skills": ["Excel", "Python"],
              "short_description": ["At least 10 characters", "At least one lowercase character", "At least one special character, e.g., ! @ # ?"],
              "other_summary": {
                "experience": "2 Years",
                "preferred_location": "",
                "current_company": ""
              },
              "evaluation": {
                "title": "Evaluation based on JD and Resume",
                "scores": {
                  "Overall": 60,
                  "Skill": 50,
                  "Experience": 40,
                  "Others": 70
                },
                "evaluation_reason": ["Missing Power BI expertise", "Limited experience compared to requirements"]
              },
              "can_we_take_this_candidate": "no"
            }
          }`
        },
        {
          role: "user",
          content: `Job Description: ${jobDescription}\n\nExtracted Resume Text: ${extractedText}`
        }
      ],
    });
  
  }
  