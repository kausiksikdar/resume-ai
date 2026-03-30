const { GoogleGenerativeAI, TaskType } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ Set GEMINI_API_KEY in your environment variables!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function generateBatchEmbeddings(chunks, batchSize = 10) {
  try {
    console.log(`Generating embeddings for ${chunks.length} chunks`);
    
    if (!chunks || chunks.length === 0) {
      throw new Error("No chunks provided for embedding");
    }
    
    const embeddings = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(chunks.length / batchSize)}`);

      const batchPromises = batch.map(text => {
        if (!text || text.trim() === '') {
          console.warn('Empty text in batch');
          return null;
        }
        return genAI
          .getGenerativeModel({ model: "gemini-embedding-2-preview" })
          .embedContent({
            content: { parts: [{ text }] },
            taskType: TaskType.RETRIEVAL_DOCUMENT,
            outputDimensionality: 768,
          });
      });

      const results = await Promise.all(batchPromises.filter(p => p !== null));

      results.forEach(r => {
        if (r && r.embedding && r.embedding.values) {
          embeddings.push(r.embedding.values);
        } else {
          console.error('Invalid embedding result:', r);
        }
      });
    }
    
    console.log(`✅ Generated ${embeddings.length} embeddings`);
    return embeddings;
    
  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
    throw error;
  }
}

module.exports = { generateBatchEmbeddings };