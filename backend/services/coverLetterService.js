// services/coverLetterService.js

const { generateWithLLM } = require("./llmService");

exports.generateCoverLetter = async ({ resumeText, jobDescriptionText }) => {
  const prompt = `
Write a professional, personalized cover letter.

Use:
- Candidate resume details
- Job description
- Align skills clearly
- Keep it concise and impactful

Resume:
${resumeText}

Job Description:
${jobDescriptionText}
`;

  const coverLetter = await generateWithLLM(prompt);

  return {
    coverLetter
  };
};