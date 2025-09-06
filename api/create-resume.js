const { GoogleGenAI } = require("@google/genai");

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
    const {
      fullName,
      email,
      phone,
      location,
      professionalSummary,
      jobTitle,
      yearsOfExperience,
      skills,
      workExperience,
      education,
      certifications,
      additionalInfo
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !jobTitle) {
      return res.status(400).json({ error: 'Missing required fields: fullName, email, and jobTitle are required' });
    }

    // Create a comprehensive prompt for resume generation
    const resumePrompt = `
    Create a professional, ATS-friendly resume for the following candidate. Use a clean, modern format with clear sections and bullet points.

    **Personal Information:**
    - Name: ${fullName}
    - Email: ${email}
    ${phone ? `- Phone: ${phone}` : ''}
    ${location ? `- Location: ${location}` : ''}

    **Professional Summary:**
    ${professionalSummary || 'Please create a compelling professional summary based on the job title and experience level.'}

    **Target Position:** ${jobTitle}
    **Experience Level:** ${yearsOfExperience || 'Not specified'}

    **Skills:** ${skills || 'Please suggest relevant skills for this position.'}

    **Work Experience:**
    ${workExperience || 'Please create relevant work experience based on the job title and experience level.'}

    **Education:**
    ${education || 'Please include a standard education section.'}

    ${certifications ? `**Certifications:** ${certifications}` : ''}

    ${additionalInfo ? `**Additional Information:** ${additionalInfo}` : ''}

    **Instructions:**
    1. Format the resume in Markdown with clear headings (## for main sections)
    2. Use bullet points for achievements and responsibilities
    3. Make it ATS-friendly with standard section names
    4. Include quantifiable achievements where possible
    5. Use action verbs and professional language
    6. Keep it concise but comprehensive
    7. Ensure proper spacing and formatting
    8. If any information is missing, create realistic placeholder content that would be appropriate for the position

    **Resume Structure:**
    - Professional Summary
    - Skills
    - Work Experience (with dates and achievements)
    - Education
    - Certifications (if provided)
    - Additional Information (if provided)

    Generate a complete, professional resume that the candidate can use immediately.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: resumePrompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        systemInstruction: "You are a professional resume writer and career coach. Create high-quality, ATS-friendly resumes that help candidates land interviews. Use clear formatting, strong action verbs, and quantifiable achievements.",
      },
    });

    res.json({
      resume: result.text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating resume" });
  }
};
