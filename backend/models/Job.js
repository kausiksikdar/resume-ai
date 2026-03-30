const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  company: String,
  description: { type: String, required: true },
  url: String,
  location: String,
  source: { type: String, default: 'manual' }, // 'adzuna' or 'manual'
  sourceId: String,
  embeddingGenerated: { type: Boolean, default: false },
  qdrantPointId: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);