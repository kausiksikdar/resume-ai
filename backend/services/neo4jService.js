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

const getDriver = () => {
  if (!driver) initDriver();
  return driver;
};

// Map lower‑case skill names to the exact case used in the graph
const skillNameMap = {
  'react': 'React',
  'node.js': 'Node.js',
  'express': 'Express',
  'mongodb': 'MongoDB',
  'docker': 'Docker',
  'perl': 'Perl',
  'python': 'Python',
  'java': 'Java',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'next.js': 'Next.js',
  'tailwind css': 'Tailwind CSS',
  'redux': 'Redux',
  'kubernetes': 'Kubernetes',
  'aws': 'AWS',
  'graphql': 'GraphQL',
  // add more as needed
};

const normalizeSkill = (skill) => {
  const lower = skill.toLowerCase();
  return skillNameMap[lower] || skill; // fallback to original if not found
};

const getRelatedSkills = async (skillName, limit = 3) => {
  const driver = initDriver();
  const session = driver.session();
  try {
    const intLimit = parseInt(limit, 10);
    const result = await session.run(
      `MATCH (s:Skill {name: $skillName})-[r:RELATED_TO]->(related)
       RETURN related.name AS skill, r.weight AS weight
       ORDER BY weight DESC
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

const updateSkillWeight = async (missingSkill, recommendedSkill, delta) => {
  const driver = initDriver();
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (a:Skill {name: $missingSkill})-[r:RELATED_TO]->(b:Skill {name: $recommendedSkill})
       SET r.weight = r.weight + $delta
       RETURN r.weight AS newWeight`,
      { missingSkill, recommendedSkill, delta }
    );
    if (result.records.length === 0) {
      await session.run(
        `MATCH (a:Skill {name: $missingSkill}), (b:Skill {name: $recommendedSkill})
         CREATE (a)-[:RELATED_TO {weight: 1.0}]->(b)`,
        { missingSkill, recommendedSkill }
      );
    }
  } finally {
    await session.close();
  }
};

const getRecommendedSkillsFromMissing = async (missingSkills, limit = 5) => {
  if (!missingSkills || missingSkills.length === 0) {
    console.log('No missing skills provided');
    return [];
  }

  console.log('Missing skills from AI:', missingSkills);
  const allRelated = new Set();

  for (const skill of missingSkills.slice(0, 3)) {
    const normalized = normalizeSkill(skill);
    console.log(`Querying Neo4j for ${skill} → ${normalized}`);
    const related = await getRelatedSkills(normalized);
    console.log(`Related skills for ${normalized}:`, related);
    related.forEach(r => allRelated.add(r));
  }

  const missingSet = new Set(missingSkills.map(s => s.toLowerCase()));
  const filtered = Array.from(allRelated).filter(
    skill => !missingSet.has(skill.toLowerCase())
  );

  console.log('Final recommended skills:', filtered);
  return filtered.slice(0, limit);
};

module.exports = { getRecommendedSkillsFromMissing, getDriver, updateSkillWeight };