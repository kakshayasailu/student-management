const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  // Personal Details
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  nationality: { type: String, default: 'Indian' },
  religion: { type: String },
  caste: { type: String },
  profilePhoto: { type: String },

  // Contact Details
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  permanentAddress: {
    street: String,
    city: String,
    district: String,
    state: String,
    pincode: String
  },
  currentAddress: {
    street: String,
    city: String,
    district: String,
    state: String,
    pincode: String
  },

  // Parent/Guardian Info
  fatherName: { type: String },
  fatherOccupation: { type: String },
  fatherPhone: { type: String },
  motherName: { type: String },
  motherOccupation: { type: String },
  motherPhone: { type: String },
  guardianName: { type: String },
  guardianRelation: { type: String },
  guardianPhone: { type: String },
  annualFamilyIncome: { type: Number },

  // Academic Info
  admissionCategory: {
    type: String,
    enum: ['VSAT', 'EAMCET', 'JEE', 'MANAGEMENT', 'NRI', 'LATERAL_ENTRY', 'OTHER'],
    required: true
  },
  admissionYear: { type: Number, required: true },
  program: { type: String, required: true }, // B.Tech, M.Tech, MBA, etc.
  branch: { type: String, required: true }, // CSE, ECE, etc.
  section: { type: String },
  currentSemester: { type: Number, default: 1 },
  currentYear: { type: Number, default: 1 },
  batch: { type: String }, // e.g., "2021-2025"
  rollNumber: { type: String },
  hallTicketNumber: { type: String },

  // Entrance Exam Details
  entranceExamScore: { type: Number },
  entranceExamRank: { type: Number },
  entranceExamYear: { type: Number },

  // Academic Performance (per semester)
  semesterResults: [{
    semester: Number,
    academicYear: String,
    sgpa: Number,
    cgpa: Number,
    backlogs: { type: Number, default: 0 },
    status: { type: String, enum: ['PASS', 'FAIL', 'PENDING'] }
  }],

  // Auth
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

// Hash password before save
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

studentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Student', studentSchema);
