const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'student-documents',
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, PDF files are allowed!'));
    }
  }
});

// Upload document
router.post('/upload', auth, (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      console.log('Multer/Cloudinary upload error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('File received:', req.file);
    console.log('Body received:', req.body);

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const doc = new Document({
      student: req.user._id,
      registrationNumber: req.user.registrationNumber,
      documentType: req.body.documentType,
      semester: req.body.semester,
      academicYear: req.body.academicYear,
      examType: req.body.examType,
      description: req.body.description,
      issueDate: req.body.issueDate,
      expiryDate: req.body.expiryDate,
      issuingAuthority: req.body.issuingAuthority,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    await doc.save();
    console.log('Document saved successfully:', doc._id);
    res.status(201).json({ message: 'Document uploaded successfully', document: doc });
  } catch (error) {
    console.log('Document save error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all documents for current user
router.get('/', auth, async (req, res) => {
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

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, student: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found or unauthorized' });

    if (doc.filename) {
      await cloudinary.uploader.destroy(`student-documents/${doc.filename}`, { resource_type: 'auto' });
    }

    doc.isActive = false;
    await doc.save();
    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;