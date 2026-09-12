const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @route GET /api/conversations
const listConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name avatarUrl');
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/conversations  { recipientId }
const startConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ message: 'recipientId is required' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, recipientId] });
    }

    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/conversations/:id/messages
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.some((id) => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a participant in this conversation' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatarUrl');
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

module.exports = { listConversations, startConversation, getMessages };
