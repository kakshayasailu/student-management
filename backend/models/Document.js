const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  registrationNumber: { type: String, required: true },

  documentType: {
    type: String,
    required: true,
    enum: [
      'MARK_MEMO',
      'AADHAAR_CARD',
      'PAN_CARD',
      'VOTER_ID',
      'APAAR_ABC_ID',
      'PASSPORT',
      'BIRTH_CERTIFICATE',
      'TRANSFER_CERTIFICATE',
      'MIGRATION_CERTIFICATE',
      'INCOME_CERTIFICATE',
      'CASTE_CERTIFICATE',
      'DOMICILE_CERTIFICATE',
      'CHARACTER_CERTIFICATE',
      'BONAFIDE_CERTIFICATE',
      'SCHOLARSHIP_DOCUMENT',
      'ENTRANCE_SCORECARD',
      'DEGREE_CERTIFICATE',
      'OTHER'
    ]
  },

  // For mark memos
  semester: { type: Number },
  academicYear: { type: String },
  examType: { type: String, enum: ['REGULAR', 'SUPPLEMENTARY', 'IMPROVEMENT'] },

  // File info
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },

  // Description
  description: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  issuingAuthority: { type: String },

  // Verification
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  verifiedAt: { type: Date },

  // Status
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

documentSchema.index({ registrationNumber: 1, documentType: 1 });

module.exports = mongoose.model('Document', documentSchema);
