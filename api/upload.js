const { GoogleGenAI } = require("@google/genai");
const pdfParse = require("pdf-parse");

// Gemini setup
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the file from the request body
    // Note: For Vercel serverless, we'll need to handle base64 encoded files
    const { file, fileName } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert base64 to buffer
    const dataBuffer = Buffer.from(file, 'base64');
    
    // Parse PDF
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    const prompt = `
    I'm a career coach and I want to provide personalized feedback on a client's resume. 
    I need you to act as my AI assistant.
    Here is the resume text:
    ${resumeText} 

    Please do the following for me:

    Summarize the candidate's professional profile in a concise paragraph.

    Identify 5 key areas for improvement. For each area, provide a specific, actionable tip that the candidate can implement to make their resume stronger. 
    Focus on tips that will increase their chances of getting an interview.

    The output should be clear, professional, and easy for me to share with my client. Please use a friendly but direct tone.

    The output should be formatted with clear headings for the summary and each tip. 
    The tips should be presented as a numbered list.
    `;

    const resumePrompt = `
    Act as a professional resume writer. I need you to create a new, improved resume for a candidate using the following information.

    Based on the provided resume text, please do the following:

    - **Professional Summary:** Draft a new, compelling 2-3 sentence summary that highlights the candidate's key qualifications and career focus.
    - **Experience:** Rewrite the job descriptions. Instead of just listing duties, use strong action verbs and quantifiable results to describe accomplishments for each role.
    - **Skills:** Create a dedicated skills section that is well-organized and easy to scan.
    - **Format:** Use a clean, modern, and professional format that is easy for recruiters to read.

    Here is the resume text:
    ${resumeText}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        systemInstruction:
          "You are a helpful AI assistant for career coaching and resume writing.",
      },
    });

    const resumeResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: resumePrompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        systemInstruction: "You are a professional resume writer.",
      },
    });

    res.json({
      summary: result.text,
      resume: resumeResult.text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing file" });
  }
};
