const express = require('express');
const {
  listNotifications,
  getUnreadCount,
  getUnreadCountsByCategory,
  markAsRead,
  markAllAsRead,
  markTypesAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, listNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.get('/unread-by-category', protect, getUnreadCountsByCategory);
router.patch('/read-all', protect, markAllAsRead);
router.patch('/read-by-type', protect, markTypesAsRead);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;