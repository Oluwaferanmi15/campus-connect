const express = require('express');
const {
  listGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  getGroup,
  registerCoursesAndDepartment,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, listGroups);
router.post('/', protect, createGroup);
router.post('/register-courses', protect, registerCoursesAndDepartment);
router.get('/:id', protect, getGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);

module.exports = router;