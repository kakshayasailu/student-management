const express = require('express');
const Achievement = require('../models/Achievement');
const { auth } = require('../middleware/auth');
const { achievementUpload } = require('../middleware/upload');

const router = express.Router();

// Create achievement
router.post('/', auth, achievementUpload.array('certificates', 5), async (req, res) => {
  try {
    const achievementData = {
      ...req.body,
      student: req.user._id,
      registrationNumber: req.user.registrationNumber,
      isTeamEvent: req.body.isTeamEvent === 'true',
      teamMembers: req.body.teamMembers ? JSON.parse(req.body.teamMembers) : [],
      coAuthors: req.body.coAuthors ? JSON.parse(req.body.coAuthors) : []
    };

    if (req.files && req.files.length > 0) {
      achievementData.certificates = req.files.map(f => ({
        filename: f.filename,
        originalName: f.originalname,
        path: `/uploads/achievements/${f.filename}`
      }));
    }

    const achievement = new Achievement(achievementData);
    await achievement.save();

    res.status(201).json({ message: 'Achievement added successfully', achievement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single achievement
router.get('/:id', auth, async (req, res) => {
  try {
    const achievement = await Achievement.findOne({
      _id: req.params.id,
      $or: [{ student: req.user._id }, { _id: req.params.id }]
    }).populate('student', 'firstName lastName registrationNumber');

    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update achievement
router.put('/:id', auth, achievementUpload.array('certificates', 5), async (req, res) => {
  try {
    const achievement = await Achievement.findOne({ _id: req.params.id, student: req.user._id });
    if (!achievement) return res.status(404).json({ message: 'Achievement not found or unauthorized' });

    if (achievement.status === 'APPROVED') {
      return res.status(400).json({ message: 'Cannot edit approved achievement' });
    }

    const updates = { ...req.body, status: 'PENDING' };
    if (req.files && req.files.length > 0) {
      const newCerts = req.files.map(f => ({
        filename: f.filename,
        originalName: f.originalname,
        path: `/uploads/achievements/${f.filename}`
      }));
      updates.certificates = [...(achievement.certificates || []), ...newCerts];
    }

    Object.assign(achievement, updates);
    await achievement.save();

    res.json({ message: 'Achievement updated', achievement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete achievement
router.delete('/:id', auth, async (req, res) => {
  try {
    const achievement = await Achievement.findOneAndDelete({
      _id: req.params.id,
      student: req.user._id
    });
    if (!achievement) return res.status(404).json({ message: 'Achievement not found or unauthorized' });
    res.json({ message: 'Achievement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Achievement statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Achievement.aggregate([
      { $match: { student: req.user._id } },
      {
        $group: {
          _id: { category: '$category', level: '$level' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
