const express = require('express');
const { listUsers, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, listUsers);
router.get('/:id', protect, getUserProfile);

module.exports = router;