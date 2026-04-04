const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Saved'],
    default: 'Saved'
  },
  dateApplied: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  tailoredResumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeTailoring', default: null },
  coverLetterId: { type: mongoose.Schema.Types.ObjectId, ref: 'CoverLetter', default: null },
  jobDescription: { type: String, default: '' } // optional, store JD text
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);