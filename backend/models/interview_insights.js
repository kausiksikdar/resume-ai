const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true
    },

    jobDescriptionText: {
      type: String,
      required: true
    },

    questions: [
      {
        type: {
          type: String,
          enum: ["technical", "behavioral", "system_design", "other"],
          default: "technical"
        },
        question: {
          type: String,
          required: true
        }
      }
    ],

    // ✅ User‑friendly fields (same as tailored resumes & cover letters)
    name: {
      type: String,
      default: function() {
        return `Interview Questions ${this._id.toString().slice(-6)}`;
      }
    },

    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Interview", interviewSchema);