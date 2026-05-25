const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['./uploads/thumbnails', './uploads/resources', './uploads/assignments', './uploads/avatars'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = './uploads/';
    
    if (file.fieldname === 'thumbnail') {
      uploadPath += 'thumbnails/';
    } else if (file.fieldname === 'resource') {
      uploadPath += 'resources/';
    } else if (file.fieldname === 'assignment') {
      uploadPath += 'assignments/';
    } else if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageExts = /\.(jpe?g|png|gif|webp|bmp|svg|avif|heic|heif)$/i;
  const allowedDocs = /pdf|doc|docx|txt|zip/;

  const extname = path.extname(file.originalname || '').toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();

  if (file.fieldname === 'thumbnail' || file.fieldname === 'avatar') {
    // Accept if EITHER the browser-reported mimetype is an image OR the
    // extension looks like an image. Both signals are imperfect alone
    // (mobile uploads sometimes report octet-stream; pasted/screenshot
    // files sometimes lack an extension) so we OR them. Cloudinary will
    // reject non-image binaries downstream anyway.
    const isImageMime = mimetype.startsWith('image/');
    const isImageExt = allowedImageExts.test(extname);
    if (isImageMime || isImageExt) {
      return cb(null, true);
    }
    return cb(new Error('Only image files are allowed for thumbnails and avatars'));
  }

  if (file.fieldname === 'resource' || file.fieldname === 'assignment') {
    const isAllowed =
      allowedImageExts.test(extname) ||
      allowedDocs.test(extname.replace('.', ''));
    if (isAllowed) {
      return cb(null, true);
    }
    return cb(new Error('Invalid file type'));
  }

  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: fileFilter
});

module.exports = upload;
