const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const neo4j = require('neo4j-driver');

if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
  console.error('❌ Missing Neo4j environment variables. Check .env file in backend folder.');
  process.exit(1);
}

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

const skillRelations = [
  // Frontend stack
  ['HTML', 'CSS'],
  ['CSS', 'Bootstrap'],
  ['CSS', 'Tailwind CSS'],
  ['JavaScript', 'React'],
  ['JavaScript', 'Node.js'],
  ['React', 'Redux'],
  ['React', 'Next.js'],
  ['React', 'TypeScript'],
  ['React', 'Tailwind CSS'],
  ['Next.js', 'TypeScript'],
  ['Next.js', 'React'],
  ['Redux', 'TypeScript'],
  ['Redux', 'React'],
  ['Bootstrap', 'CSS'],
  ['Tailwind CSS', 'React'],

  // Backend stack
  ['Node.js', 'Express'],
  ['Node.js', 'MongoDB'],
  ['Node.js', 'TypeScript'],
  ['Express', 'REST API'],
  ['Express', 'Node.js'],
  ['MongoDB', 'Mongoose'],
  ['MongoDB', 'Express'],
  ['PostgreSQL', 'Node.js'],
  ['PostgreSQL', 'TypeScript'],
  ['Python', 'Django'],
  ['Python', 'FastAPI'],
  ['Python', 'Machine Learning'],
  ['Java', 'Spring Boot'],
  ['Spring Boot', 'Microservices'],
  ['Go', 'Concurrency'],

  // Machine Learning & AI
  ['Machine Learning', 'Deep Learning'],
  ['Machine Learning', 'PyTorch'],
  ['Machine Learning', 'TensorFlow'],
  ['Deep Learning', 'PyTorch'],
  ['NLP', 'Vector Embeddings'],
  ['NLP', 'Hugging Face'],
  ['Vector Embeddings', 'RAG'],
  ['RAG', 'LangChain'],
  ['LangChain', 'Vector Embeddings'],

  // DevOps & Cloud
  ['Docker', 'Kubernetes'],
  ['Docker', 'CI/CD'],
  ['Kubernetes', 'AWS'],
  ['AWS', 'Terraform'],
  ['AWS', 'Docker'],
  ['CI/CD', 'Jenkins'],
  ['Git', 'GitHub Actions'],

  // System Design & Architecture
  ['System Design', 'Microservices'],
  ['System Design', 'Load Balancing'],
  ['Microservices', 'Docker'],
  ['Microservices', 'Kubernetes'],
  ['Redis', 'BullMQ'],
  ['Redis', 'Node.js'],
  ['Kafka', 'Microservices'],
  ['WebSockets', 'Node.js'],

  // Testing & Quality
  ['TypeScript', 'Jest'],
  ['Jest', 'React'],
  ['Jest', 'Node.js'],
  ['Cypress', 'React'],

  // Other
  ['GraphQL', 'React'],
  ['GraphQL', 'Node.js'],
  ['Elasticsearch', 'Backend Engineer'],
  ['Elasticsearch', 'Node.js'],
];

async function seed() {
  try {
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('🗑️  Cleared existing graph');

    // Create all unique skill nodes
    const allSkills = new Set();
    skillRelations.forEach(([a, b]) => {
      allSkills.add(a);
      allSkills.add(b);
    });

    for (const skill of allSkills) {
      await session.run(`CREATE (s:Skill {name: $name})`, { name: skill });
    }
    console.log(`✅ Created ${allSkills.size} skill nodes`);

    // Create bidirectional relationships with initial weight 1.0
    for (const [a, b] of skillRelations) {
      await session.run(
        `MATCH (a:Skill {name: $a}), (b:Skill {name: $b})
         CREATE (a)-[:RELATED_TO {weight: 1.0}]->(b)`,
        { a, b }
      );
      await session.run(
        `MATCH (a:Skill {name: $a}), (b:Skill {name: $b})
         CREATE (b)-[:RELATED_TO {weight: 1.0}]->(a)`,
        { a, b }
      );
    }
    console.log('✅ Created skill relationships with weight=1.0 (bidirectional)');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();