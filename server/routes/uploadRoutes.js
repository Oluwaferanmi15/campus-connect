const express = require('express');
const { uploadImage, uploadMedia } = require('../config/upload');
const { uploadBuffer } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.post('/image', protect, uploadImage.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const result = await uploadBuffer(req.file.buffer, { resource_type: 'image' });
    res.status(201).json({ url: result.secure_url });
  } catch (err) {
    next(err);
  }
});

router.post('/media', protect, uploadMedia.single('media'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const result = await uploadBuffer(req.file.buffer);
    res.status(201).json({
      url: result.secure_url,
      type: result.resource_type === 'video' ? 'video' : 'image',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/avatar', protect, uploadImage.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const result = await uploadBuffer(req.file.buffer, {
      folder: 'campus-connect/avatars',
      resource_type: 'image',
    });
    const user = await User.findByIdAndUpdate(req.user._id, { avatarUrl: result.secure_url }, { new: true });
    res.status(201).json({ url: result.secure_url, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;