const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/documents';

// Make sure directory exists (create if missing)
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'doc_' + Date.now() + ext);
  }
});

module.exports = multer({ storage });
