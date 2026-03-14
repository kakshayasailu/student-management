const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const createStorage = (subfolder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, `../uploads/${subfolder}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype) || 
    file.mimetype === 'application/pdf' || 
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  
  if (ext || mime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and Word docs are allowed.'));
  }
};

const documentUpload = multer({
  storage: createStorage('documents'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

const achievementUpload = multer({
  storage: createStorage('achievements'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

const profileUpload = multer({
  storage: createStorage('profiles'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photo.'));
    }
  }
});

module.exports = { documentUpload, achievementUpload, profileUpload };
