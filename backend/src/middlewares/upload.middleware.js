import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Chai aur Code style: small, focused middleware for uploads

const ensureUploadsDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = path.join(process.cwd(), 'uploads');
    ensureUploadsDir(baseDir);
    cb(null, baseDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + '-' + Date.now() + ext;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePicture') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for profile picture'), false);
    }
  }

  if (file.fieldname === 'resume') {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF or Word documents are allowed for resume'), false);
    }
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

