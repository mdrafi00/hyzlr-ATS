import dotenv from "dotenv";
import OpenAI from "openai";
import { NextResponse } from "next/server";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

async function getOpenAIChatCompletion(userResponses) {
  const prompt = `You are an AI evaluator analyzing candidate responses based on various scoring criteria.

  🔹 **Candidate Responses:**
  ${JSON.stringify(userResponses, null, 2)}

  ### **Scoring Criteria:**
  - **Technical Acumen**: Evaluate the candidate’s technical knowledge demonstrated in their responses.
  - **Communication Skills**: Assess clarity, coherence, and effectiveness in conveying ideas.
  - **Responsiveness & Agility**: Determine how promptly and thoughtfully the candidate responds Use the difference between answered time and question asked time for delay of user.
  - **Problem-Solving & Adaptability**: Analyze ability to handle follow-up questions and clarifications.
  - **Cultural Fit & Soft Skills**: Evaluate interpersonal communication and potential fit.
  - ** The overall should be the sum of all other : "Technical",
    "Communication",
    "Responsiveness",
    "ProblemSolving"
    "SoftSkills"
    "Responded" 

  CRITICAL NOTE : THE RESPONSE SHOULD BE IN THE FOLLOWING FORMAT ONLY.

  ### **Expected JSON Output Format:**
  {
    "OverAll": number,
    "Technical": number,
    "Communication": number,
    "Responsiveness": number,
    "ProblemSolving": number,
    "SoftSkills": number,
    "Responded": number,
    "feedback": [
      { "category": "Technical Acumen", "comment": "string" }
      { "category": "Communication Skills", "comment": "string" }
      { "category": "Responsiveness & Agility", "comment": "string" }
      { "category": "Problem-Solving & Adaptability", "comment": "string" }
      { "category": "Cultural Fit & Soft Skills", "comment": "string" }
    ],
    "suggestedImprovements": ["string"]
  }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an AI interviewer and evaluator." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  try {
    return JSON.parse(response.choices[0]?.message?.content || "{}") || {};
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error);
    return {};
  }
}

export async function POST(req) {
  try {
    const { questions } = await req.json();
    console.log(questions,'questions')
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const scoreData = await getOpenAIChatCompletion(questions);

    return NextResponse.json(scoreData);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Too Many Request Token Limit Exit!" },
      { status: 429 }
    );
  }
}
