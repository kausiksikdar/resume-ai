const Resume = require("../models/resume");
const ResumeTailoring = require("../models/ResumeTailoring");
const CoverLetter = require("../models/CoverLetter");
const Interview = require('../models/interview_insights');
const resumeTailorService = require("../services/resumeTailorService");
const coverLetterService = require("../services/coverLetterService");
const interviewService = require("../services/interviewService");
const { getOrSetCache } = require('../utils/cache');
const { invalidateCache } = require('../utils/cache');
const { getGraphInsights } = require('../services/neo4jService');
const mongoose = require('mongoose');

// Resume Tailoring

exports.generateResume = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText } = req.body;

    if (!resumeId || !jobDescriptionText) {
      return res.status(400).json({
        message: "resumeId and jobDescriptionText are required"
      });
    }

    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(resumeId);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Fetch resume
    const resume = await Resume.findOne({
      _id: objectId,
      userId: userId
    });

    if (!resume) {
      console.log(`Resume not found: ${resumeId} for user ${req.user.id}`);
      return res.status(404).json({ message: "Resume not found" });
    }

    // 1. Get graph insights from Neo4j (optional, non‑blocking)
    let graphInsights = null;
    try {
      graphInsights = await getGraphInsights(jobDescriptionText);
    } catch (err) {
      console.warn("Neo4j graph insight error:", err.message);
      // Continue without graph insights
    }

    // 2. Generate tailored resume via AI (pass graphInsights if your service uses it)
    const result = await resumeTailorService.generateResumeTailoring({
      resumeText: resume.extractedText,
      jobDescriptionText,
      graphInsights   // optional – your service can ignore it if not needed
    });

    // 3. Return AI result plus graph insights (if any)
    return res.json({
      ...result,
      graphInsights: graphInsights || null
    });
  } catch (err) {
    console.error("Generate Resume Error:", err);
    return res.status(500).json({
      message: "Failed to generate tailored resume"
    });
  }
};

// 🔹 2. Save Tailored Resume
exports.saveTailoredResume = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText, tailoredData, customName, description } = req.body;
    const userId = req.user.id;

    if (!resumeId || !tailoredData) {
      return res.status(400).json({
        message: "resumeId and tailoredData are required"
      });
    }

    const resumeObjectId = new mongoose.Types.ObjectId(resumeId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const originalResume = await Resume.findOne({
      _id: resumeObjectId,
      userId: userObjectId
    });

    if (!originalResume) {
      return res.status(404).json({ message: "Original resume not found" });
    }

    const savedDoc = await ResumeTailoring.create({
      user: userObjectId,
      originalResume: resumeObjectId,
      jobDescriptionText,
      tailoredResume: tailoredData.tailoredResume,
      name: customName || `Tailored for ${originalResume.originalFileName?.slice(0, 20)}`,
      description: description || "",
      // Store the additional AI fields
      matchScore: tailoredData.matchScore || null,
      keyChanges: tailoredData.keyChanges || [],
      suggestions: tailoredData.suggestions || [],
      missingSkills: tailoredData.missingSkills || []
    });

    await invalidateCache(`user:${userId}:tailored`);

    return res.status(201).json({
      message: "Tailored resume saved successfully",
      data: savedDoc
    });
  } catch (err) {
    console.error("Save Tailored Resume Error:", err);
    return res.status(500).json({
      message: "Failed to save tailored resume"
    });
  }
};

// 🔹 3. Get All Tailored Resumes
exports.getAllTailoredResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:tailored`;

    const resumes = await getOrSetCache(cacheKey, async () => {
      return await ResumeTailoring.find({ user: userId })
        .sort({ createdAt: -1 });
    }, 300);

    return res.json(resumes);
  } catch (err) {
    console.error('Get All Resumes Error:', err);
    return res.status(500).json({ message: 'Failed to fetch resumes' });
  }
};

// 🔹 4. Get Single Tailored Resume
exports.getTailoredResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await ResumeTailoring.findOne({
      _id: id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        message: "Tailored resume not found"
      });
    }

    return res.json(resume);
  } catch (err) {
    console.error("Get Resume By ID Error:", err);
    return res.status(500).json({
      message: "Failed to fetch resume"
    });
  }
};

// 🔹 5. Delete Tailored Resume
exports.deleteTailoredResume = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ResumeTailoring.findOneAndDelete({
      _id: id,
      user: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Resume not found or already deleted"
      });
    }

    if (deleted) {
      await invalidateCache(`user:${req.user.id}:tailored`);
    }

    return res.json({
      message: "Tailored resume deleted successfully"
    });
  } catch (err) {
    console.error("Delete Resume Error:", err);
    return res.status(500).json({
      message: "Failed to delete resume"
    });
  }
};

// Cover Letter
// 🔹 1. Generate Cover Letter (NO SAVE)
exports.generateCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText } = req.body;

    if (!resumeId || !jobDescriptionText) {
      return res.status(400).json({
        message: "resumeId and jobDescriptionText are required"
      });
    }

    // Convert to ObjectId (MongoDB expects ObjectId for _id)
    const objectId = new mongoose.Types.ObjectId(resumeId);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 🔁 Use `userId` to match the field in your Resume schema
    const resume = await Resume.findOne({
          _id: objectId,
          userId: userId      // <-- changed from `user` to `userId`
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    const result = await coverLetterService.generateCoverLetter({
      resumeText: resume.extractedText,
      jobDescriptionText
    });

    return res.json(result);
  } catch (err) {
    console.error("Generate Cover Letter Error:", err);
    return res.status(500).json({
      message: "Failed to generate cover letter"
    });
  }
};

// 🔹 2. Save Cover Letter
exports.saveCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText, coverLetter, customName, description } = req.body;
    const userId = req.user.id;

    if (!resumeId || !coverLetter) {
      return res.status(400).json({
        message: "resumeId and coverLetter are required"
      });
    }

    const resumeObjectId = new mongoose.Types.ObjectId(resumeId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const resume = await Resume.findOne({
      _id: resumeObjectId,
      userId: userObjectId
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    // ✅ Generate a default name without referencing savedDoc
    const finalName = customName || `Cover Letter ${Date.now().toString().slice(-6)}`;

    const savedDoc = await CoverLetter.create({
      user: userObjectId,
      resume: resumeObjectId,
      jobDescriptionText,
      coverLetter,
      name: finalName,
      description: description || ""
    });

    await invalidateCache(`user:${userId}:coverLetters:*`);

    return res.status(201).json({
      message: "Cover letter saved successfully",
      data: savedDoc
    });
  } catch (err) {
    console.error("Save Cover Letter Error:", err);
    return res.status(500).json({
      message: "Failed to save cover letter"
    });
  }
};

// 🔹 3. Get All Cover Letters
exports.getAllCoverLetters = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const cacheKey = `user:${userId}:coverLetters:page:${page}:limit:${limit}`;

    const letters = await getOrSetCache(cacheKey, async () => {
      return await CoverLetter.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    }, 300);

    return res.json({ count: letters.length, data: letters });
  } catch (err) {
    console.error('Get All Cover Letters Error:', err);
    return res.status(500).json({ message: 'Failed to fetch cover letters' });
  }
};

// 🔹 4. Get Single Cover Letter
exports.getCoverLetterById = async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await CoverLetter.findOne({
      _id: id,
      user: req.user.id
    });

    if (!letter) {
      return res.status(404).json({
        message: "Cover letter not found"
      });
    }

    return res.json(letter);
  } catch (err) {
    console.error("Get Cover Letter Error:", err);
    return res.status(500).json({
      message: "Failed to fetch cover letter"
    });
  }
};

// 🔹 5. Delete Cover Letter
exports.deleteCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CoverLetter.findOneAndDelete({
      _id: id,
      user: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Cover letter not found or already deleted"
      });
    }

    if (deleted) {
      await invalidateCache(`user:${req.user.id}:coverLetters:*`);
    }

    return res.json({
      message: "Cover letter deleted successfully"
    });
  } catch (err) {
    console.error("Delete Cover Letter Error:", err);
    return res.status(500).json({
      message: "Failed to delete cover letter"
    });
  }
};

// Interview Questions
// 🔹 1. Generate Interview Questions (no save)
exports.generateInterview = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText } = req.body;

    if (!resumeId || !jobDescriptionText) {
      return res.status(400).json({
        message: "resumeId and jobDescriptionText are required"
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const resumeObjectId = new mongoose.Types.ObjectId(resumeId);

    const resume = await Resume.findOne({
      _id: resumeObjectId,
      userId: userObjectId          // ✅ use userId, not user
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    const result = await interviewService.generateInterviewQuestions({
      resumeText: resume.extractedText,
      jobDescriptionText
    });

    return res.json(result);   // { questions: [...] }
  } catch (err) {
    console.error("Generate Interview Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to generate interview questions"
    });
  }
};

// 🔹 2. Save Interview Questions
exports.saveInterview = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText, questions, customName, description } = req.body;
    const userId = req.user.id;

    if (!resumeId || !questions) {
      return res.status(400).json({
        message: "resumeId and questions are required"
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const resumeObjectId = new mongoose.Types.ObjectId(resumeId);

    const resume = await Resume.findOne({
      _id: resumeObjectId,
      userId: userObjectId
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    const savedDoc = await Interview.create({
      userId: userObjectId,
      resumeId: resumeObjectId,
      jobDescriptionText,
      questions,
      name: customName || `Interview Questions ${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      description: description || ""
    });

    return res.status(201).json({
      message: "Interview questions saved successfully",
      data: savedDoc
    });
  } catch (err) {
    console.error("Save Interview Error:", err);
    return res.status(500).json({
      message: "Failed to save interview questions"
    });
  }
};

// 🔹 3. Get All Interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cacheKey = `user:${userId}:interviews:page:${page}:limit:${limit}`;

    const docs = await getOrSetCache(cacheKey, async () => {
      return await Interview.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    }, 300);

    await invalidateCache(`user:${userId}:interviews:*`);

    return res.json({ count: docs.length, data: docs });
  } catch (err) {
    console.error('Get Interviews Error:', err);
    return res.status(500).json({ message: 'Failed to fetch interviews' });
  }
};

// 🔹 4. Get Single Interview
exports.getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const interviewId = new mongoose.Types.ObjectId(id);

    const doc = await Interview.findOne({
      _id: interviewId,
      userId: userObjectId
    });

    if (!doc) {
      return res.status(404).json({
        message: "Interview data not found"
      });
    }

    return res.json(doc);
  } catch (err) {
    console.error("Get Interview Error:", err);
    return res.status(500).json({
      message: "Failed to fetch interview"
    });
  }
};

// 🔹 5. Delete Interview
exports.deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const interviewId = new mongoose.Types.ObjectId(id);

    const deleted = await Interview.findOneAndDelete({
      _id: interviewId,
      userId: userObjectId
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Interview not found or already deleted"
      });
    }

    if (deleted) {
      await invalidateCache(`user:${req.user.id}:interviews:*`);
    }

    return res.json({
      message: "Interview deleted successfully"
    });
  } catch (err) {
    console.error("Delete Interview Error:", err);
    return res.status(500).json({
      message: "Failed to delete interview"
    });
  }
};