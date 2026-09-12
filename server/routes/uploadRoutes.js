const express = require('express');
const { uploadImage, uploadMedia } = require('../config/upload');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.post('/image', protect, uploadImage.single('image'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
});

router.post('/media', protect, uploadMedia.single('media'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const url = `/uploads/${req.file.filename}`;
    const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    res.status(201).json({ url, type });
  } catch (err) {
    next(err);
  }
});

router.post('/avatar', protect, uploadImage.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const url = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatarUrl: url }, { new: true });
    res.status(201).json({ url, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;