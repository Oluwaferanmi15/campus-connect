const User = require('../models/User');

// @route GET /api/users/search?q=<query>
const searchUsers = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json({ users: [] });

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { university: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name email university department avatarUrl verified')
      .limit(20);

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/:id
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name university department bio avatarUrl verified createdAt'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchUsers, getUserProfile };
