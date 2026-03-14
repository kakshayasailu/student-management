const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  registrationNumber: { type: String, required: true },

  // Classification
  category: {
    type: String,
    required: true,
    enum: [
      'HACKATHON',
      'INTERNSHIP',
      'RESEARCH_PUBLICATION',
      'TECHNICAL_COMPETITION',
      'CULTURAL',
      'SPORTS',
      'WORKSHOP_SEMINAR',
      'CERTIFICATION',
      'PROJECT',
      'AWARD_RECOGNITION',
      'OTHER'
    ]
  },
  subcategory: { type: String }, // e.g., "National Level", "International"

  // Basic Info
  title: { type: String, required: true },
  description: { type: String },
  organizingBody: { type: String }, // College, Company, Institution
  venue: { type: String },
  level: {
    type: String,
    enum: ['COLLEGE', 'DISTRICT', 'STATE', 'NATIONAL', 'INTERNATIONAL'],
    default: 'COLLEGE'
  },

  // Position/Result
  position: { type: String }, // 1st, 2nd, Participant, etc.
  prize: { type: String }, // Cash prize, Certificate, etc.
  isTeamEvent: { type: Boolean, default: false },
  teamSize: { type: Number },
  teamName: { type: String },
  teamMembers: [{ name: String, regNo: String }],

  // Duration
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  duration: { type: String }, // e.g., "3 months", "2 days"

  // Academic Period
  academicYear: { type: String, required: true }, // e.g., "2023-24"
  semester: { type: Number }, // 1-8

  // Publication specific (for research)
  publicationTitle: { type: String },
  journalConferenceName: { type: String },
  issn: { type: String },
  doi: { type: String },
  impactFactor: { type: Number },
  coAuthors: [String],

  // Internship specific
  companyName: { type: String },
  internshipRole: { type: String },
  stipend: { type: Number },
  mentorName: { type: String },

  // Documents/Certificates
  certificates: [{ 
    filename: String, 
    originalName: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Verification
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  verifiedAt: { type: Date },
  verificationNotes: { type: String },

  // AI Generated Summary
  aiSummary: { type: String },
  
  // Status
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  rejectionReason: { type: String }

}, { timestamps: true });

// Index for faster queries
achievementSchema.index({ registrationNumber: 1, academicYear: 1 });
achievementSchema.index({ category: 1, level: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
