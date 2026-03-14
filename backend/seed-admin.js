// Run this once to create the initial admin account
// Usage: node seed-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await Student.findOne({ email: 'admin@college.edu' });
  if (existing) {
    console.log('Admin already exists. Email: admin@college.edu');
    process.exit(0);
  }

  const admin = new Student({
    registrationNumber: 'ADMIN001',
    email: 'admin@college.edu',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'Male',
    phone: '9000000000',
    admissionCategory: 'OTHER',
    admissionYear: 2020,
    program: 'ADMIN',
    branch: 'ADMIN',
    role: 'admin',
    batch: '2020-2024'
  });

  await admin.save();
  console.log('✅ Admin account created!');
  console.log('   Email: admin@college.edu');
  console.log('   Password: admin123');
  console.log('   ⚠️  Change password after first login!');
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
