const express = require('express');
const Student = require('../models/Student');
const Achievement = require('../models/Achievement');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');
const { profileUpload } = require('../middleware/upload');

const router = express.Router();

// Get own profile
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'phone', 'alternatePhone', 'permanentAddress', 'currentAddress',
      'bloodGroup', 'fatherName', 'fatherOccupation', 'fatherPhone',
      'motherName', 'motherOccupation', 'motherPhone',
      'guardianName', 'guardianRelation', 'guardianPhone', 'annualFamilyIncome',
      'section', 'currentSemester', 'currentYear', 'rollNumber'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const student = await Student.findByIdAndUpdate(
      req.user._id, updates, { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload profile photo
router.post('/profile/photo', auth, profileUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    await Student.findByIdAndUpdate(req.user._id, { profilePhoto: photoPath });
    res.json({ message: 'Photo uploaded', photoPath });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get own achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    const { category, academicYear, semester, status, page = 1, limit = 10 } = req.query;
    const filter = { student: req.user._id };
    if (category) filter.category = category;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = parseInt(semester);
    if (status) filter.status = status;

    const total = await Achievement.countDocuments(filter);
    const achievements = await Achievement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ achievements, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get own documents
router.get('/documents', auth, async (req, res) => {
  try {
    const { documentType } = req.query;
    const filter = { student: req.user._id, isActive: true };
    if (documentType) filter.documentType = documentType;

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const [achievementStats, documentCount, recentAchievements] = await Promise.all([
      Achievement.aggregate([
        { $match: { student: studentId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Document.countDocuments({ student: studentId, isActive: true }),
      Achievement.find({ student: studentId }).sort({ createdAt: -1 }).limit(5)
    ]);

    const totalAchievements = achievementStats.reduce((sum, s) => sum + s.count, 0);
    
    res.json({
      totalAchievements,
      totalDocuments: documentCount,
      achievementsByCategory: achievementStats,
      recentAchievements,
      student: {
        name: req.user.fullName,
        registrationNumber: req.user.registrationNumber,
        program: req.user.program,
        branch: req.user.branch,
        currentSemester: req.user.currentSemester,
        batch: req.user.batch
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add semester result
router.post('/semester-result', auth, async (req, res) => {
  try {
    const { semester, academicYear, sgpa, cgpa, backlogs, status } = req.body;
    
    const student = await Student.findById(req.user._id);
    const existingIndex = student.semesterResults.findIndex(r => r.semester === semester);
    
    if (existingIndex >= 0) {
      student.semesterResults[existingIndex] = { semester, academicYear, sgpa, cgpa, backlogs, status };
    } else {
      student.semesterResults.push({ semester, academicYear, sgpa, cgpa, backlogs, status });
    }
    
    await student.save();
    res.json({ message: 'Semester result saved', semesterResults: student.semesterResults });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
