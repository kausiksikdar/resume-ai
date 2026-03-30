const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const Resume = require("../models/resume");
const User = require("../models/user");
const { extractText } = require("../services/textExtractor");
const { chunkText } = require("../utils/chunkText");
const { generateBatchEmbeddings, generateEmbedding } = require("../services/embeddingService");
const semanticSearchService = require("../services/semanticSearchService");
const { uploadToCloudinary } = require("../services/cloudinary");
const { COLLECTION_NAME } = require("../services/qdrantService");
const qdrant = require("../config/qdrant");
const cloudinary = require("../config/cloudinary");
const mongoose = require('mongoose');

const MAX_RESUMES = 5;

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;

    // 🔹 1. Fetch user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 2. Check upload limit (SINGLE SOURCE OF TRUTH)
    if (user.usage.resumesUploaded >= MAX_RESUMES) {
      return res.status(400).json({
        message: "Resume upload limit reached"
      });
    }

    // 🔹 3. Generate file hash (prevent duplicates)
    const hash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    const existing = await Resume.findOne({
      userId,
      fileHash: hash
    });

    if (existing) {
      return res.status(400).json({
        message: "This resume has already been uploaded"
      });
    }

    // 🔹 4. Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    // 🔹 5. Extract text & chunk
    const text = await extractText(req.file.buffer, req.file.mimetype);
    const chunks = chunkText(text);

    // 🔹 6. Generate embeddings
    const vectors = await generateBatchEmbeddings(chunks);

    // 🔹 7. Save resume in MongoDB
    const resume = await Resume.create({
      userId,
      originalFileName: req.file.originalname,
      cloudinaryUrl: cloudResult.secure_url,
      cloudinaryPublicId: cloudResult.public_id,
      extractedText: text,
      totalChunks: chunks.length,
      qdrantPointIds: [],
      fileHash: hash
    });

    // 🔹 8. Prepare Qdrant points
    const points = vectors.map((vector, index) => ({
      id: uuidv4(),
      vector,
      payload: {
        userId,
        resumeId: resume._id.toString(),
        chunkIndex: index
      }
    }));

    await qdrant.upsert(COLLECTION_NAME, { points });

    // 🔹 9. Save point IDs
    resume.qdrantPointIds = points.map((p) => p.id);
    await resume.save();

    // 🔹 10. Increment usage (ATOMIC — VERY IMPORTANT)
    await User.findByIdAndUpdate(userId, {
      $inc: { "usage.resumesUploaded": 1 }
    });

    return res.status(201).json(resume);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      message: "Failed to upload resume"
    });
  }
};

exports.searchResumes = async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const userId = req.user.id;

    console.log('=== SEARCH CONTROLLER ===');
    console.log('Received query:', query);
    console.log('User ID:', userId);

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Search query is required" 
      });
    }

    const resumes = await semanticSearchService.searchResumes({
      query: query.trim(),
      userId
    });

    console.log(`Search completed, returning ${resumes.length} results`);
    res.json(resumes);

  } catch (error) {
    console.error('❌ Search controller error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || "Failed to search resumes"
    });
  }
};

exports.getUserResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Convert string to ObjectId for MongoDB query
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Use 'userId' field instead of 'user'
    const resumes = await Resume.find({ userId: userObjectId })
      .select("_id cloudinaryUrl createdAt originalFileName")
      .sort({ createdAt: -1 });

    res.status(200).json(resumes);

  } catch (error) {
    console.error('Error in getUserResumes:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const resumeId = req.params.id;

    // Use 'userId' field to match how it's saved in the database
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: userObjectId  // Changed from 'user' to 'userId'
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);

  } catch (error) {
    console.error('Error in getSingleResume:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const resumeId = req.params.id;

    console.log('=== DELETE RESUME STARTED ===');
    console.log('Resume ID:', resumeId);
    console.log('User ID:', userId);

    // First find the resume to get Qdrant point IDs
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: userObjectId
    });

    if (!resume) {
      console.log('Resume not found in MongoDB');
      return res.status(404).json({ message: "Resume not found" });
    }

    console.log('Found resume:', {
      id: resume._id,
      qdrantPointIds: resume.qdrantPointIds,
      cloudinaryUrl: resume.cloudinaryUrl
    });

    // Step 1: Delete from Qdrant first
    if (resume.qdrantPointIds && resume.qdrantPointIds.length > 0) {
      try {
        console.log('Deleting from Qdrant, point IDs:', resume.qdrantPointIds);
        
        // Delete each point individually or in batch
        const deleteResult = await qdrant.delete(COLLECTION_NAME, {
          points: resume.qdrantPointIds
        });
        
        console.log('Qdrant delete result:', deleteResult);
        
        // Optional: Verify deletion
        // You can add a check here to verify points are deleted
        
      } catch (qdrantError) {
        console.error('Error deleting from Qdrant:', qdrantError);
        // Don't return here - still try to delete from MongoDB
        // But log the error for debugging
      }
    } else {
      console.log('No Qdrant points found for this resume');
    }

    // Step 2: Delete from MongoDB
    console.log('Deleting from MongoDB...');
    const deleteResult = await Resume.deleteOne({ _id: resumeId });
    console.log('MongoDB delete result:', deleteResult);

    if (deleteResult.deletedCount === 0) {
      console.log('Failed to delete from MongoDB');
      return res.status(404).json({ message: "Resume not found in MongoDB" });
    }

    // Step 3: Decrement user usage count
    console.log('Decrementing user usage count...');
    await User.findByIdAndUpdate(userId, {
      $inc: { "usage.resumesUploaded": -1 }
    });

    // Step 4: Optional - Delete from Cloudinary
    if (resume.cloudinaryPublicId) {
      try {
        console.log('Deleting from Cloudinary:', resume.cloudinaryPublicId);
        // Uncomment if you have cloudinary configured
        // await cloudinary.uploader.destroy(resume.cloudinaryPublicId, {
        //   resource_type: "raw"
        // });
        console.log('Cloudinary deletion would happen here');
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Don't fail the whole operation for Cloudinary errors
      }
    }

    console.log('=== DELETE RESUME COMPLETED SUCCESSFULLY ===');
    
    res.json({ 
      success: true,
      message: "Resume deleted successfully from MongoDB and Qdrant",
      deletedFromQdrant: resume.qdrantPointIds?.length > 0
    });

  } catch (error) {
    console.error('Error in deleteResume:', error);
    res.status(500).json({ 
      message: "Failed to delete resume",
      error: error.message 
    });
  }
};