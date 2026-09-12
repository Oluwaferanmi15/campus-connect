const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};

const registerChatHandlers = (io) => {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', async ({ conversationId, content }, callback) => {
      try {
        if (!content || !conversationId) {
          return callback?.({ error: 'conversationId and content are required' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return callback?.({ error: 'Conversation not found' });
        if (!conversation.participants.some((id) => id.toString() === socket.userId)) {
          return callback?.({ error: 'Not a participant in this conversation' });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          content,
          readBy: [socket.userId],
        });

        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populated = await message.populate('sender', 'name avatarUrl');

        io.to(`conversation:${conversationId}`).emit('message:new', populated);
        callback?.({ message: populated });

        const others = conversation.participants.filter((id) => id.toString() !== socket.userId);
        others.forEach(async (recipientId) => {
          try {
            const notification = await Notification.create({
              recipient: recipientId,
              actor: socket.userId,
              type: 'message',
              conversation: conversationId,
            });
            const populatedNotification = await notification.populate('actor', 'name avatarUrl');
            io.to(`user:${recipientId}`).emit('notification:new', populatedNotification);
          } catch (err) {
            console.error('Failed to create message notification:', err.message);
          }
        });
      } catch (err) {
        callback?.({ error: 'Failed to send message' });
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId: socket.userId });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId: socket.userId });
    });
  });
};

module.exports = registerChatHandlers;