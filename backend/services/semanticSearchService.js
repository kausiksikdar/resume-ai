const Resume = require("../models/resume");
const { generateBatchEmbeddings } = require("./embeddingService");
const qdrantClient = require("../config/qdrant");
const { COLLECTION_NAME } = require("./qdrantService");

exports.searchResumes = async ({ query, userId }) => {
  try {
    console.log('=== SEARCH SERVICE ===');
    console.log('Query:', query);
    console.log('User ID:', userId);
    
    if (!query || query.trim() === '') {
      throw new Error("Query is required");
    }

    if (!qdrantClient) {
      throw new Error("Qdrant client not initialized");
    }

    // Generate embedding for the query
    const vectorArray = await generateBatchEmbeddings([query]);
    const vector = vectorArray[0];

    // Search in Qdrant
    const results = await qdrantClient.search(COLLECTION_NAME, {
      vector: vector,
      limit: 20,  // Get more to ensure enough unique resumes
      filter: {
        must: [{ key: "userId", match: { value: userId } }]
      }
    });

    if (!results.length) return [];

    // Group by resumeId and keep the highest score per resume
    const bestByResume = new Map();
    for (const result of results) {
      const resumeId = result.payload.resumeId;
      const existing = bestByResume.get(resumeId);
      if (!existing || result.score > existing.score) {
        bestByResume.set(resumeId, { score: result.score, payload: result.payload });
      }
    }

    // Extract unique resume IDs and their best scores
    const resumeIds = Array.from(bestByResume.keys());
    console.log('Unique resume IDs:', resumeIds);

    // Fetch resumes from MongoDB
    const resumes = await Resume.find({
      _id: { $in: resumeIds },
      userId: userId
    });

    // Create a map for quick lookup
    const resumeMap = new Map(resumes.map(r => [r._id.toString(), r]));

    // Build the final combined results (one per resume)
    const combinedResults = [];
    for (const [resumeId, { score }] of bestByResume.entries()) {
      const resume = resumeMap.get(resumeId);
      if (resume) {
        combinedResults.push({
          id: resume._id,
          _id: resume._id,
          filename: resume.originalFileName,
          originalFileName: resume.originalFileName,
          content: resume.extractedText?.substring(0, 500),
          extractedText: resume.extractedText,
          score: score,
          cloudinaryUrl: resume.cloudinaryUrl,
          createdAt: resume.createdAt
        });
      }
    }

    // Sort by score descending
    combinedResults.sort((a, b) => b.score - a.score);

    // Limit to top N (e.g., 10)
    const limitedResults = combinedResults.slice(0, 10);

    console.log(`✅ Final results: ${limitedResults.length} unique resumes`);
    return limitedResults;

  } catch (error) {
    console.error('❌ Search service error:', error);
    throw error;
  }
};