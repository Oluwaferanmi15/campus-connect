const User = require('../models/User');

// @route GET /api/users?q=<optional search>
const listUsers = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const filter = { _id: { $ne: req.user._id } };

    if (q.trim()) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { university: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('name email university department avatarUrl verified')
      .sort({ name: 1 })
      .limit(100);

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

module.exports = { listUsers, getUserProfile };