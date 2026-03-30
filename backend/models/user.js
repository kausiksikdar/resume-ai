const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    usage: {
      // AI feature usage
      resumeTailor: { type: Number, default: 0 },
      coverLetter: { type: Number, default: 0 },
      interview: { type: Number, default: 0 },
      rejection: { type: Number, default: 0 },

      // Upload limits
      resumesUploaded: { type: Number, default: 0 },
      jobsUploaded: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);

