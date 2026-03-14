const express = require('express');
const Student = require('../models/Student');
const Achievement = require('../models/Achievement');
const Document = require('../models/Document');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Search student by registration number
router.get('/student/:regNo', adminAuth, async (req, res) => {
  try {
    const student = await Student.findOne({
      registrationNumber: req.params.regNo.toUpperCase()
    }).select('-password');

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const [achievements, documents] = await Promise.all([
      Achievement.find({ registrationNumber: student.registrationNumber }).sort({ createdAt: -1 }),
      Document.find({ registrationNumber: student.registrationNumber, isActive: true }).sort({ createdAt: -1 })
    ]);

    res.json({ student, achievements, documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all students with pagination
router.get('/students', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, program, branch, admissionCategory } = req.query;
    const filter = { role: 'student' };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (program) filter.program = program;
    if (branch) filter.branch = branch;
    if (admissionCategory) filter.admissionCategory = admissionCategory;

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ students, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify/Approve achievement
router.put('/achievement/:id/verify', adminAuth, async (req, res) => {
  try {
    const { status, verificationNotes } = req.body;
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      {
        status,
        isVerified: status === 'APPROVED',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        verificationNotes
      },
      { new: true }
    );
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    res.json({ message: `Achievement ${status.toLowerCase()}`, achievement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify document
router.put('/document/:id/verify', adminAuth, async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document verified', document: doc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Dashboard analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const [
      totalStudents,
      totalAchievements,
      pendingAchievements,
      achievementsByCategory,
      achievementsByLevel,
      programDistribution,
      recentStudents
    ] = await Promise.all([
      Student.countDocuments({ role: 'student' }),
      Achievement.countDocuments(),
      Achievement.countDocuments({ status: 'PENDING' }),
      Achievement.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Achievement.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      Student.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { program: '$program', branch: '$branch' }, count: { $sum: 1 } } }
      ]),
      Student.find({ role: 'student' }).select('-password').sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      totalStudents,
      totalAchievements,
      pendingAchievements,
      achievementsByCategory,
      achievementsByLevel,
      programDistribution,
      recentStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all pending achievements
router.get('/achievements/pending', adminAuth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ status: 'PENDING' })
      .populate('student', 'firstName lastName registrationNumber program branch')
      .sort({ createdAt: -1 });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle student active status
router.put('/student/:id/toggle', adminAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ message: `Student ${student.isActive ? 'activated' : 'deactivated'}`, isActive: student.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create admin account (protected - only existing admins)
router.post('/create-admin', adminAuth, async (req, res) => {
  try {
    const { registrationNumber, email, password, firstName, lastName } = req.body;
    const admin = new Student({
      registrationNumber,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      phone: '0000000000',
      admissionCategory: 'OTHER',
      admissionYear: 2020,
      program: 'ADMIN',
      branch: 'ADMIN',
      role: 'admin'
    });
    await admin.save();
    res.status(201).json({ message: 'Admin created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
