const neo4j = require('neo4j-driver');

let driver;

const initDriver = () => {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
  }
  return driver;
};

const getRelatedSkills = async (skillName, limit = 3) => {
  const driver = initDriver();
  const session = driver.session();
  try {
    const intLimit = parseInt(limit, 10);
    const result = await session.run(
      `MATCH (s:Skill {name: $skillName})-[:RELATED_TO]-(related)
       RETURN related.name AS skill
       LIMIT toInteger($limit)`,
      { skillName, limit: intLimit }
    );
    return result.records.map(record => record.get('skill'));
  } catch (error) {
    console.error('Neo4j query error:', error);
    return [];
  } finally {
    await session.close();
  }
};

/**
 * Get recommended skills based on missing skills (from Gemini)
 * @param {string[]} missingSkills - List of skills that are missing from resume
 * @param {number} limit - Max number of recommendations
 * @returns {Promise<string[]>} - Array of recommended skills (new, not in missing list)
 */
const getRecommendedSkillsFromMissing = async (missingSkills, limit = 5) => {
  if (!missingSkills || missingSkills.length === 0) return [];

  const allRelated = new Set();
  for (const skill of missingSkills.slice(0, 3)) {
    const related = await getRelatedSkills(skill);
    related.forEach(r => allRelated.add(r));
  }

  // Remove skills that are already in the missing list (avoid duplicates)
  const missingSet = new Set(missingSkills.map(s => s.toLowerCase()));
  const filtered = Array.from(allRelated).filter(
    skill => !missingSet.has(skill.toLowerCase())
  );

  return filtered.slice(0, limit);
};

module.exports = { getRecommendedSkillsFromMissing };