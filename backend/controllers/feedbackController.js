const SkillFeedback = require('../models/SkillFeedback');
const { updateSkillWeight } = require('../services/neo4jService');

exports.submitSkillFeedback = async (req, res) => {
  try {
    const { missingSkill, recommendedSkill, helpful } = req.body;
    const userId = req.user.id;

    if (!missingSkill || !recommendedSkill || helpful === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 1. Store feedback in MongoDB
    await SkillFeedback.create({ userId, missingSkill, recommendedSkill, helpful });

    // 2. Update Neo4j edge weight
    const delta = helpful ? 0.1 : -0.1;
    await updateSkillWeight(missingSkill, recommendedSkill, delta);

    res.json({ message: 'Feedback recorded and graph updated' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: 'Failed to record feedback' });
  }
};