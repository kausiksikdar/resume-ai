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

// Expanded common skills list – include exactly the terms you use in your JD
const commonSkills = [
  'React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
  'MongoDB', 'PostgreSQL', 'Express', 'Django', 'Flask', 'Spring Boot',
  'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST', 'Tailwind CSS',
  'Next.js', 'Vue.js', 'Angular', 'C++', 'Go', 'Rust', 'Machine Learning',
  // Add the exact terms from your JD:
  'HTML', 'CSS', 'JS', 'Redux', 'Bootstrap', 'Next', 'TailWind'
];

// Alias mapping for common variations
const aliasMap = {
  'next': 'Next.js',
  'tailwind': 'Tailwind CSS',
  'redux': 'Redux',
  'js': 'JavaScript',
  'node': 'Node.js',
  'express': 'Express',
  'mongodb': 'MongoDB',
  'react': 'React'
};

const extractSkillsFromText = (text) => {
  const lowerText = text.toLowerCase();
  const found = new Set();

  // 1. Direct substring match
  for (const skill of commonSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  }

  // 2. Word‑based alias mapping (split by non‑word characters)
  const words = lowerText.split(/[\s,;:.-]+/);
  for (const word of words) {
    const canonical = aliasMap[word];
    if (canonical) {
      found.add(canonical);
    }
  }

  return Array.from(found);
};

const getGraphInsights = async (jobDescription) => {
  const jdSkills = extractSkillsFromText(jobDescription);
  console.log('🔍 Extracted skills from JD:', jdSkills);
  if (jdSkills.length === 0) return null;

  const allRelated = new Set();
  for (const skill of jdSkills.slice(0, 3)) {
    const related = await getRelatedSkills(skill);
    console.log(`📊 Related skills for ${skill}:`, related);
    related.forEach(r => allRelated.add(r));
  }

  // Remove skills already in the job description
  const sourceSkillsSet = new Set(jdSkills);
  const filteredRelated = Array.from(allRelated).filter(skill => !sourceSkillsSet.has(skill));

  // Always return an object (even if no new skills) to show the collapsible section
  return {
    relatedSkills: filteredRelated.length > 0 ? filteredRelated.slice(0, 5) : [],
    sourceSkills: jdSkills.slice(0, 3),
    isFallback: filteredRelated.length === 0
  };
};
module.exports = { getGraphInsights };