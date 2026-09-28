const multer = require('multer');
const path = require('path');

// Files are held in memory just long enough to forward them to Cloudinary.
const storage = multer.memoryStorage();

const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
const allowedVideoTypes = /mp4|mov|webm|m4v|avi/;

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const validExt = allowedImageTypes.test(ext);
  const validMime = file.mimetype.startsWith('image/');
  if (validExt && validMime) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
};

const mediaFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(ext) && file.mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(ext) && file.mimetype.startsWith('video/');
  if (isImage || isVideo) return cb(null, true);
  cb(new Error('Only image (jpeg, jpg, png, gif, webp) or video (mp4, mov, webm, m4v, avi) files are allowed'));
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadMedia = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { uploadImage, uploadMedia };