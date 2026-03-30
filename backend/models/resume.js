const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },

    originalFileName: {
      type: String,
      required: true
    },

    cloudinaryUrl: {
      type: String,
      required: true
    },

    cloudinaryPublicId: {
      type: String,
      required: true
    },

    extractedText: {
      type: String,
      required: true
    },

    totalChunks: {
      type: Number,
      required: true
    },

    qdrantPointIds: [
      {
        type: String
      }
    ],

    fileHash: {
      type: String,
      required: true,       // every resume must have a hash
      index: true            // optional, creates an index for faster lookup
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);