const Job = require('../models/Job');
const Resume = require('../models/resume');
const { jobEmbeddingQueue } = require('../queues/jobQueue');
const { generateBatchEmbeddings } = require('../services/embeddingService');
const qdrantClient = require('../config/qdrant');
const { COLLECTION_NAME } = require('../services/qdrantService');
const mongoose = require('mongoose');

// Save a new job
exports.saveJob = async (req, res) => {
  try {
    const { title, company, description, url, location } = req.body;
    const userId = req.user.id;

    const job = await Job.create({
      userId,
      title,
      company,
      description,
      url,
      location,
      embeddingGenerated: false,
    });

    // Queue for embedding generation
    await jobEmbeddingQueue.add({ jobId: job._id.toString(), userId });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save job' });
  }
};

// Get user's jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.qdrantPointId) {
      await qdrantClient.delete(COLLECTION_NAME, { points: [job.qdrantPointId] });
    }
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete job' });
  }
};

// Match jobs against a resume
exports.matchJobs = async (req, res) => {
  try {
    const { resumeId } = req.body;
    const userId = req.user.id;

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    // Generate embedding for the resume text
    const vectorArray = await generateBatchEmbeddings([resume.extractedText]);
    const vector = vectorArray[0];

    // Search Qdrant for job points belonging to this user
    const searchResults = await qdrantClient.search(COLLECTION_NAME, {
      vector,
      limit: 20,
      filter: {
        must: [
          { key: 'type', match: { value: 'job' } },
          { key: 'userId', match: { value: userId } },
        ],
      },
    });

    const jobIds = searchResults.map(r => r.payload.jobId);
    const jobs = await Job.find({ _id: { $in: jobIds }, userId });

    // Combine scores
    const matches = searchResults.map(r => {
      const job = jobs.find(j => j._id.toString() === r.payload.jobId);
      return job ? { ...job.toObject(), score: r.score } : null;
    }).filter(Boolean);

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Matching failed' });
  }
};