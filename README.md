# AI-Powered Dynamic Interview Assistant with Candidate Profiling & Scoring

## Objective

Develop a **Next.js** web application that enables recruiters to upload both a job description and a candidate’s CV. The system will then generate personalized interview questions using an AI API, conduct a one-shot, dynamic multi-turn interview via a chat interface, and finally produce a performance evaluation that includes scoring based on answer quality and the time taken to respond.

---

## Core Tasks

### 1. Dual Data Input

#### A. Job Description Input
- **Input Form**:  
  - Create a responsive form where recruiters can enter or select a detailed job description.
  - Validate input to ensure sufficient detail (e.g., minimum character count).

#### B. Candidate CV Upload
- **CV Upload Interface**:  
  - Allow users to upload a candidate’s CV (supporting PDF, DOCX, or plain text).
  - Optionally, perform basic parsing or use the AI API to extract key candidate details.

---

### 2. AI-Driven Question Generation

- **Data Fusion for Question Generation**:  
  - Use an AI API (e.g., OpenAI) to process both the job description and the candidate’s CV.
  - **Prompt Design**: Craft prompts to ensure the AI considers both data sources to generate a tailored set of interview questions.
  - **Output**: Generate a set of questions that are contextually relevant to the role and the candidate’s background, optionally categorizing them (e.g., technical, behavioral, situational).

---

### 3. One-Shot Dynamic Interview Chat Interface

- **Chat Window Setup**:  
  - Develop a streamlined chat interface where the candidate answers the AI-generated questions in a continuous, uninterrupted session.
  - Clearly display the AI interviewer’s questions and capture candidate responses in real time.

- **Multi-Turn, Context-Aware Conversation**:  
  - **Continuous Flow**: The conversation proceeds in one shot without options to pause, review, or restart.
  - **Adaptive Follow-Up**: The AI interviewer should ask follow-up questions or request clarifications based on the candidate’s answers.
  - **Timing Metrics**: Automatically record the time taken by the candidate to answer each question. This data should be collected seamlessly as part of the interview flow.

---

### 4. Interview Scoring & Analysis

- **Scoring Trigger**:  
  - Once the interview concludes, automatically trigger the scoring process based on the entire transcript and timing metrics.

- **AI-Powered Analysis**:  
  - Use the complete conversation transcript, the original job description, the candidate’s CV, and the recorded response times to generate a detailed performance evaluation.

- **Scoring Criteria** (for example):
  - **Technical Acumen**: Evaluation of the candidate’s technical skills as evidenced in their responses.
  - **Communication Skills**: Clarity, coherence, and effectiveness in conveying ideas.
  - **Responsiveness & Agility**: Assess how promptly and thoughtfully the candidate responds. Faster, well-considered responses could be scored higher.
  - **Problem-Solving & Adaptability**: Ability to handle follow-up questions and provide relevant clarifications.
  - **Cultural Fit & Soft Skills**: Evaluation of interpersonal communication and potential fit for the company culture.

- **Score Breakdown**:  
  - Present numerical values or percentages for each category, including a specific metric for response timing.
  - Provide an overall composite score and a brief summary of the candidate’s strengths and areas for improvement.

- **Prompt Engineering**:  
  - Clearly document how the AI is instructed to evaluate both the content and the timing of responses.

---

### 5. Technical Requirements

- **Framework & UI**:  
  - Use Next.js (preferably with the App Router).
  - While UI libraries (e.g., shadcn/ui) may be utilized, the interactive chat interface should be custom-designed to avoid overly template-driven solutions.

- **AI API Integration**:  
  - Leverage the provided AI API key for both question generation and final scoring.
  - Implement robust error handling and asynchronous interactions for API calls.

- **Deployment & Testing**:  
  - Deploy the application on **Vercel** and provide a live URL.
  - Include unit tests covering:
    - Form validation for job description and CV upload.
    - AI-driven question generation.
    - The uninterrupted, one-shot chat interface.
    - Timing data capture and scoring algorithm.
  - Provide detailed setup instructions and testing documentation.

---

## Submission Guidelines

1. **Repository & Code Organization**
   - Organize your project with a clear and maintainable directory structure.
   - Include a detailed README with setup instructions, deployment details, and test running guidelines.
   - Attach a document describing your prompt design strategy and how both data sources and timing metrics are integrated into the AI evaluation.

2. **Documentation**
   - Explain your approach to parsing the job description and candidate CV.
   - Describe how the AI prompts are engineered to combine both inputs for generating context-aware questions.
   - Detail the scoring criteria, including how timing metrics influence the candidate evaluation.

3. **Deployment**
   - Ensure the application is deployed on Vercel.
   - Verify that the full flow is functional: job description/CV input → tailored question generation → uninterrupted dynamic chat interview → AI-powered scoring with timing metrics.

---

## Evaluation Criteria

1. **Functionality & Usability**
   - Does the application handle dual inputs (job description and CV) and generate relevant interview questions?
   - Is the chat interface streamlined and intuitive for a one-shot interview session?
   - Is the timing of candidate responses accurately captured and integrated into the scoring?

2. **AI Integration & Dynamic Flow**
   - How effectively does the AI API leverage both inputs to generate and adapt interview questions?
   - Does the one-shot interview process work smoothly without manual intervention?
   - Is the follow-up questioning appropriately adaptive to candidate responses?

3. **Scoring & Analysis**
   - Is the candidate’s performance evaluated on multiple dimensions, including response timing?
   - Is the score breakdown clear, detailed, and reflective of the candidate’s performance?
   - Are the AI prompts for scoring well-documented and effective?

4. **Code Quality & Documentation**
   - Is the code modular, clean, and well-documented?
   - Are unit tests provided for key functionalities?
   - Is the setup and usage documentation clear and comprehensive?

5. **Deployment & Innovation**
   - Is the application live on Vercel and fully functional?
   - Has the candidate introduced innovative touches, particularly regarding the integration of timing metrics into the scoring process?

---

## Final Notes

- **Creativity is Encouraged**: Consider any additional features that enhance the recruitment process, such as nuanced timing-based insights or a refined scoring algorithm.
- **Clarify Assumptions**: Clearly document any assumptions made during development, particularly regarding the weight of response times in scoring.
- **Time Management**: The challenge is designed to be completed within 5 days, so prioritize delivering a robust core experience with strong AI integration and clear scoring mechanisms.

Good luck, and we look forward to seeing your innovative approach to an AI-driven, dynamic interview and evaluation system!
