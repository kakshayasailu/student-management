const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register Student
router.post('/register', [
  body('registrationNumber').notEmpty().trim().toUpperCase(),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty(),
  body('dateOfBirth').isDate(),
  body('gender').isIn(['Male', 'Female', 'Other']),
  body('admissionCategory').notEmpty(),
  body('admissionYear').isNumeric(),
  body('program').notEmpty(),
  body('branch').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existing = await Student.findOne({
      $or: [
        { registrationNumber: req.body.registrationNumber.toUpperCase() },
        { email: req.body.email.toLowerCase() }
      ]
    });

    if (existing) {
      return res.status(400).json({
        message: existing.registrationNumber === req.body.registrationNumber.toUpperCase()
          ? 'Registration number already exists'
          : 'Email already registered'
      });
    }

    const student = new Student({
      ...req.body,
      registrationNumber: req.body.registrationNumber.toUpperCase(),
      batch: `${req.body.admissionYear}-${parseInt(req.body.admissionYear) + 4}`
    });

    await student.save();

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: student._id,
        registrationNumber: student.registrationNumber,
        name: student.fullName,
        email: student.email,
        role: student.role,
        program: student.program,
        branch: student.branch
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login
router.post('/login', [
  body('identifier').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { identifier, password } = req.body;
    
    const student = await Student.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { registrationNumber: identifier.toUpperCase() }
      ]
    });

    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!student.isActive) {
      return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    }

    student.lastLogin = new Date();
    await student.save();

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        registrationNumber: student.registrationNumber,
        name: student.fullName,
        email: student.email,
        role: student.role,
        program: student.program,
        branch: student.branch,
        currentSemester: student.currentSemester,
        profilePhoto: student.profilePhoto
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Change Password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    const isMatch = await student.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    student.password = req.body.newPassword;
    await student.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
