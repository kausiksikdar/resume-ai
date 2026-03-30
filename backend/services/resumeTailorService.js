// services/resumeTailorService.js

const { generateWithLLM } = require("./llmService");

exports.generateResumeTailoring = async ({
  resumeText,
  jobDescriptionText
}) => {
  const prompt = `
Tailor this resume for the job. Respond ONLY with JSON:

{
  "matchScore": 85,
  "tailoredResume": "Complete tailored resume text...",
  "keyChanges": ["Added keywords", "Rewrote bullets"],
  "suggestions": ["Add metrics", "ATS keywords"],
  "missingSkills": []
}

Score 0-100 (higher = better fit).

Resume:
${resumeText}

Job Description:
${jobDescriptionText}
`;

  const rawResponse = await generateWithLLM(prompt);

  // Default fallback (VERY IMPORTANT)
  let structured = {
    matchScore: 50,
    keyChanges: [],
    suggestions: [],
    missingSkills: [],
    tailoredResume: rawResponse
  };

  try {
    // Try extracting JSON safely
    const jsonMatch =
      rawResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/s) ||
      rawResponse.match(/(\{[\s\S]*\})/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);

      structured = {
        matchScore: parsed.matchScore ?? 50,
        keyChanges: parsed.keyChanges ?? [],
        suggestions: parsed.suggestions ?? [],
        missingSkills: parsed.missingSkills ?? [],
        tailoredResume: parsed.tailoredResume ?? rawResponse
      };
    }
  } catch (err) {
    console.warn("Resume tailoring JSON parse failed:", err.message);
  }

  return structured;
};