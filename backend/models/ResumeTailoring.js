const mongoose = require("mongoose");

const resumeTailoringSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    originalResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true
    },
    jobDescriptionText: {
      type: String,
      required: true
    },
    tailoredResume: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: function() {
        return `Tailored Resume ${this._id.toString().slice(-6)}`;
      }
    },
    description: {
      type: String,
      default: ""
    },
    // ✅ New fields from AI analysis
    matchScore: {
      type: Number,
      default: null
    },
    keyChanges: {
      type: [String],
      default: []
    },
    suggestions: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResumeTailoring", resumeTailoringSchema);