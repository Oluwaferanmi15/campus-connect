const express = require('express');
const {
  listConversations,
  startConversation,
  getMessages,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, listConversations);
router.post('/', protect, startConversation);
router.get('/:id/messages', protect, getMessages);

module.exports = router;
