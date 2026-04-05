const mongoose = require('mongoose');

const skillFeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  missingSkill: { type: String, required: true },
  recommendedSkill: { type: String, required: true },
  helpful: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SkillFeedback', skillFeedbackSchema);