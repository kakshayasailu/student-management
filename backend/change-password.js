require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

async function changePassword() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const admin = await Student.findOne({ email: 'admin@college.edu' });
  if (!admin) {
    console.log('Admin not found!');
    process.exit(1);
  }

  admin.password = 'Admin@2024';
  await admin.save();
  console.log('✅ Password changed successfully!');
  console.log('   Email: admin@college.edu');
  console.log('   New Password: Admin@2024');
  process.exit(0);
}

changePassword().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});