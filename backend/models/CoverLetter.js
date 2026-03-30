const mongoose = require("mongoose");

const coverLetterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true
    },

    jobDescriptionText: {
      type: String,
      required: true
    },

    coverLetter: {
      type: String,
      required: true
    },

    // ✅ New fields (same as tailored resume)
    name: {
      type: String,
      default: function() {
        return `Cover Letter ${this._id.toString().slice(-6)}`;
      }
    },

    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoverLetter", coverLetterSchema);