const express = require('express');
const {
  sendRequest,
  respondToRequest,
  listConnections,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, listConnections);
router.post('/request/:userId', protect, sendRequest);
router.patch('/:id/respond', protect, respondToRequest);

module.exports = router;
