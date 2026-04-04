const { generateWithLLM } = require("./llmService");

exports.generateResumeTailoring = async ({
  resumeText,
  jobDescriptionText
}) => {
  const prompt = `
You are an expert resume writer. Rewrite the resume to match the job description.

Rules:
1. Change wording, rephrase, add keywords from JD.
2. Do NOT add new skills to the resume. Only rephrase existing ones.
3. List missing skills (skills required by JD but absent from resume) in the "missingSkills" array. If none, return an empty array.
4. Return STRICT JSON.

{
  "matchScore": 85,
  "tailoredResume": "full rewritten resume...",
  "keyChanges": ["...", "..."],
  "suggestions": ["...", "..."],
  "missingSkills": ["Skill1", "Skill2"]   // ← MUST be filled if any missing
}

Resume:
${resumeText}

Job Description:
${jobDescriptionText}
`;

  const rawResponse = await generateWithLLM(prompt);
  console.log('Raw LLM response:', rawResponse);

  let structured = {
    matchScore: 50,
    keyChanges: [],
    suggestions: [],
    missingSkills: [],
    tailoredResume: rawResponse
  };

  try {
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

  console.log('Parsed missingSkills:', structured.missingSkills);

  // Remove any missing skills accidentally added to the resume
  for (const skill of structured.missingSkills) {
    const regex = new RegExp(`\\b${skill}\\b`, 'gi');
    structured.tailoredResume = structured.tailoredResume.replace(regex, '');
  }

  return structured;
};