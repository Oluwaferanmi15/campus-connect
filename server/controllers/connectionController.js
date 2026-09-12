const Connection = require('../models/Connection');
const { createNotification } = require('../services/notificationService');

const sendRequest = async (req, res, next) => {
  try {
    const recipientId = req.params.userId;
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: "Can't connect with yourself" });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
    });
    if (existing) return res.status(409).json({ message: 'Connection already exists', status: existing.status });

    const connection = await Connection.create({ requester: req.user._id, recipient: recipientId });

    createNotification({
      recipient: recipientId,
      actor: req.user._id,
      type: 'connection_request',
      connection: connection._id,
    }).catch((err) => console.error('Failed to create connection notification:', err.message));

    res.status(201).json({ connection });
  } catch (err) {
    next(err);
  }
};

const respondToRequest = async (req, res, next) => {
  try {
    const { action } = req.body;
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Request not found' });
    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    connection.status = action === 'accept' ? 'accepted' : 'rejected';
    await connection.save();

    if (connection.status === 'accepted') {
      createNotification({
        recipient: connection.requester,
        actor: req.user._id,
        type: 'connection_accepted',
        connection: connection._id,
      }).catch((err) => console.error('Failed to create connection notification:', err.message));
    }

    res.json({ connection });
  } catch (err) {
    next(err);
  }
};

const listConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: 'accepted',
    })
      .populate('requester', 'name avatarUrl')
      .populate('recipient', 'name avatarUrl');
    res.json({ connections });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendRequest, respondToRequest, listConnections };