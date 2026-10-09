const express = require('express');
const {
  getFeed,
  createPost,
  toggleLike,
  deletePost,
  getComments,
  addComment,
  toggleCommentLike,
  deleteComment,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getFeed);
router.post('/', protect, createPost);
router.delete('/comments/:commentId', protect, deleteComment);
router.post('/comments/:commentId/like', protect, toggleCommentLike);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);

module.exports = router;