const Notification = require('../models/Notification');

const CATEGORY_TYPES = {
  feed: ['like', 'comment'],
  groups: ['group_join'],
  people: ['connection_request', 'connection_accepted'],
  messages: ['message'],
};

const listNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('actor', 'name avatarUrl')
      .populate('post', 'content')
      .populate('group', 'name')
      .populate('conversation');

    res.json({ notifications });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

const getUnreadCountsByCategory = async (req, res, next) => {
  try {
    const entries = await Promise.all(
      Object.entries(CATEGORY_TYPES).map(async ([key, types]) => {
        const count = await Notification.countDocuments({
          recipient: req.user._id,
          type: { $in: types },
          read: false,
        });
        return [key, count];
      })
    );

    res.json({ counts: Object.fromEntries(entries) });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

const markTypesAsRead = async (req, res, next) => {
  try {
    const types = (req.query.types || '').split(',').filter(Boolean);
    if (types.length === 0) return res.status(400).json({ message: 'types query param is required' });

    await Notification.updateMany(
      { recipient: req.user._id, type: { $in: types }, read: false },
      { read: true }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listNotifications,
  getUnreadCount,
  getUnreadCountsByCategory,
  markAsRead,
  markAllAsRead,
  markTypesAsRead,
};