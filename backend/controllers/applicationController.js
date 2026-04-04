const Application = require('../models/Application');
const { getOrSetCache, invalidateCache } = require('../utils/cache');

exports.createApplication = async (req, res) => {
  try {
    const { jobTitle, company, status, dateApplied, notes, tailoredResumeId, coverLetterId, jobDescription } = req.body;
    if (!jobTitle || !company) {
      return res.status(400).json({ message: 'Job title and company are required' });
    }

    // Convert empty strings to null for ObjectId fields
    const finalTailoredId = tailoredResumeId === '' ? null : tailoredResumeId;
    const finalCoverLetterId = coverLetterId === '' ? null : coverLetterId;

    // Handle date: default to today if empty/invalid
    let finalDate = dateApplied ? new Date(dateApplied) : new Date();
    if (isNaN(finalDate.getTime())) finalDate = new Date();

    const application = await Application.create({
      userId: req.user.id,
      jobTitle,
      company,
      status: status || 'Saved',
      dateApplied: finalDate,
      notes: notes || '',
      tailoredResumeId: finalTailoredId,
      coverLetterId: finalCoverLetterId,
      jobDescription: jobDescription || ''
    });
    await invalidateCache(`user:${req.user.id}:applications`);
    res.status(201).json(application);
  } catch (err) {
    console.error('Create application error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:applications`;
    const apps = await getOrSetCache(cacheKey, async () => {
      return await Application.find({ userId }).sort({ createdAt: -1 });
    }, 300); // 5 minutes TTL
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!app) return res.status(404).json({ message: 'Not found' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Convert empty strings to null for ObjectId fields
    if (updateData.tailoredResumeId === '') updateData.tailoredResumeId = null;
    if (updateData.coverLetterId === '') updateData.coverLetterId = null;

    // Remove dateApplied if empty (to leave unchanged)
    if (updateData.dateApplied === '') delete updateData.dateApplied;
    else if (updateData.dateApplied) {
      const parsed = new Date(updateData.dateApplied);
      if (isNaN(parsed.getTime())) delete updateData.dateApplied;
    }

    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { returnDocument: 'after' }
    );
    if (!app) return res.status(404).json({ message: 'Not found' });
    await invalidateCache(`user:${req.user.id}:applications`);
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!app) return res.status(404).json({ message: 'Not found' });
    await invalidateCache(`user:${req.user.id}:applications`);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};