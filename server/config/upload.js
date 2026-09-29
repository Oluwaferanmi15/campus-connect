const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const allowedImageTypes = /jpeg|jpg|png|gif|webp/;

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const validExt = allowedImageTypes.test(ext);
  const validMime = file.mimetype.startsWith('image/');
  if (validExt && validMime) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadImage };