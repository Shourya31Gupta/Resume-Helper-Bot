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
      projects,
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

    ${projects ? `**Projects:** ${projects}` : ''}

    **Education:**
    ${education || 'Please include a standard education section.'}

    ${certifications ? `**Certifications:** ${certifications}` : ''}

    ${additionalInfo ? `**Additional Information:** ${additionalInfo}` : ''}

    **IMPORTANT INSTRUCTIONS:**
    1. Format the resume in Markdown with clear headings (## for main sections)
    2. Use bullet points for achievements and responsibilities
    3. Make it ATS-friendly with standard section names
    4. Include quantifiable achievements where possible
    5. Use action verbs and professional language
    6. Keep it concise but comprehensive
    7. Ensure proper spacing and formatting
    8. **ONLY include sections that have actual content provided by the user**
    9. **DO NOT create dummy or placeholder projects, work experience, or other content**
    10. **If a section is empty or not provided, either skip it entirely or create a minimal, realistic placeholder based on the job title and experience level**
    11. **For work experience: If provided, use it exactly as given. If not provided, create 1-2 realistic entries based on the job title and experience level**
    12. **For projects: Only include if the user provided project information in their input**

    **Resume Structure (only include sections with content):**
    - Professional Summary
    - Skills
    - Work Experience (only if provided or create minimal realistic entries)
    - Education (only if provided or create minimal realistic entries)
    - Projects (only if provided by user)
    - Certifications (only if provided)
    - Additional Information (only if provided)

    Generate a professional resume that the candidate can use immediately. Do not add dummy content for sections the user didn't fill out.
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
