// services/interviewService.js

const { generateWithLLM } = require("./llmService");

exports.generateInterviewQuestions = async ({
  resumeText,
  jobDescriptionText
}) => {
  const prompt = `
Generate 10 high-quality interview questions.

Requirements:
- Mix of technical + behavioral
- Relevant to job description
- Based on candidate resume
- Clear and realistic

Return STRICTLY in JSON format:

[
  {
    "type": "technical",
    "question": "Explain event loop in Node.js"
  },
  {
    "type": "behavioral",
    "question": "Tell me about a challenging project"
  }
]

Resume:
${resumeText}

Job Description:
${jobDescriptionText}
`;

  const rawResponse = await generateWithLLM(prompt);

  let questions = [];

  try {
    const jsonMatch =
      rawResponse.match(/```json\s*(\[[\s\S]*?\])\s*```/s) ||
      rawResponse.match(/(\[[\s\S]*\])/);

    if (jsonMatch) {
      questions = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error("No JSON array found");
    }
  } catch (err) {
    console.warn("Interview JSON parse failed:", err.message);
    throw new Error("Invalid LLM response format");
  }

  return {
    questions
  };
};