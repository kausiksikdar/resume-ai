const Queue = require('bull');
const { redisClient, options: redisOptions } = require('../config/redis');
const { generateBatchEmbeddings } = require('../services/embeddingService');
const qdrantClient = require('../config/qdrant'); // client directly
const { COLLECTION_NAME } = require('../services/qdrantService'); // collection name from your service
const Job = require('../models/Job');
const { v4: uuidv4 } = require('uuid');

// Create Bull queue using the raw connection options
const jobEmbeddingQueue = new Queue('job embedding', {
  redis: redisOptions,
});

const DAILY_LIMIT = process.env.DAILY_EMBEDDING_LIMIT || 10;

const getTodayKey = () => `embedding_count:${new Date().toISOString().slice(0, 10)}`;

async function canGenerateEmbeddingToday() {
  const key = getTodayKey();
  const count = await redisClient.get(key);
  return !count || parseInt(count) < DAILY_LIMIT;
}

async function incrementDailyEmbeddingCount() {
  const key = getTodayKey();
  await redisClient.incr(key);
  await redisClient.expire(key, 86400);
}

jobEmbeddingQueue.process(async (job, done) => {
  const { jobId, userId } = job.data;
  try {
    const canGenerate = await canGenerateEmbeddingToday();
    if (!canGenerate) {
      throw new Error('Daily embedding limit reached');
    }

    const jobDoc = await Job.findById(jobId);
    if (!jobDoc || jobDoc.embeddingGenerated) {
      return done(null, { skipped: true });
    }

    // Generate embedding
    const vectorArray = await generateBatchEmbeddings([jobDoc.description]);
    const vector = vectorArray[0];

    // Store in Qdrant
    const pointId = uuidv4();
    await qdrantClient.upsert(COLLECTION_NAME, {
      points: [{
        id: pointId,
        vector,
        payload: {
          type: 'job',
          userId,
          jobId: jobDoc._id.toString(),
        },
      }],
    });

    // Update job record
    jobDoc.embeddingGenerated = true;
    jobDoc.qdrantPointId = pointId;
    await jobDoc.save();

    await incrementDailyEmbeddingCount();
    done(null, { success: true });
  } catch (err) {
    console.error('Job embedding error:', err);
    done(err);
  }
});

module.exports = { jobEmbeddingQueue };