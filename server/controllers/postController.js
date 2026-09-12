const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { createNotification } = require('../services/notificationService');

const getFeed = async (req, res, next) => {
  try {
    const { group, page = 1, limit = 20 } = req.query;
    const filter = group ? { group } : { group: null };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'name avatarUrl university');

    res.json({ posts, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { content, media = [], group = null } = req.body;
    if (!content) return res.status(400).json({ message: 'Post content is required' });

    const post = await Post.create({ author: req.user._id, content, media, group });
    const populated = await post.populate('author', 'name avatarUrl university');
    res.status(201).json({ post: populated });
  } catch (err) {
    next(err);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    if (!alreadyLiked) {
      createNotification({
        recipient: post.author,
        actor: req.user._id,
        type: 'like',
        post: post._id,
      }).catch((err) => console.error('Failed to create like notification:', err.message));
    }

    res.json({ likesCount: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    await Comment.deleteMany({ post: post._id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatarUrl');
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { content, parentComment = null } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment content is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      content,
      parentComment,
    });

    post.commentCount += 1;
    await post.save();

    createNotification({
      recipient: post.author,
      actor: req.user._id,
      type: 'comment',
      post: post._id,
    }).catch((err) => console.error('Failed to create comment notification:', err.message));

    const populated = await comment.populate('author', 'name avatarUrl');
    res.status(201).json({ comment: populated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFeed, createPost, toggleLike, deletePost, getComments, addComment };