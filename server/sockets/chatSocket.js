const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const User = require('../models/User');

const activeCalls = new Set();
const pairKey = (a, b) => [String(a), String(b)].sort().join(':');

// Tracks how many live socket connections each user has open (tabs/devices).
// A user is "online" as long as this count is above zero.
const onlineCounts = new Map();

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

    // ---------- Presence ----------
    const previousCount = onlineCounts.get(socket.userId) || 0;
    onlineCounts.set(socket.userId, previousCount + 1);
    if (previousCount === 0) {
      io.emit('presence:online', { userId: socket.userId });
    }
    socket.emit('presence:init', { onlineUserIds: Array.from(onlineCounts.keys()) });

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

    // ---------- Voice / video calls (WebRTC signaling) ----------
    socket.on('call:invite', async ({ conversationId, toUserId, video }, callback) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        const ids = (conversation?.participants || []).map((p) => p.toString());
        if (!ids.includes(socket.userId) || !ids.includes(String(toUserId))) {
          return callback?.({ error: 'not_allowed' });
        }

        const room = io.sockets.adapter.rooms.get(`user:${toUserId}`);
        if (!room || room.size === 0) return callback?.({ error: 'offline' });

        const caller = await User.findById(socket.userId).select('name avatarUrl');
        activeCalls.add(pairKey(socket.userId, toUserId));
        socket.callPeerId = String(toUserId);

        io.to(`user:${toUserId}`).emit('call:incoming', {
          conversationId,
          video: !!video,
          from: { _id: String(caller._id), name: caller.name, avatarUrl: caller.avatarUrl },
        });
        callback?.({ ok: true });
      } catch (err) {
        callback?.({ error: 'failed' });
      }
    });

    const relayMap = {
      'call:accept': 'call:accepted',
      'call:reject': 'call:rejected',
      'call:offer': 'call:offer',
      'call:answer': 'call:answer',
      'call:ice': 'call:ice',
    };

    Object.entries(relayMap).forEach(([incomingEvent, outgoingEvent]) => {
      socket.on(incomingEvent, (payload = {}) => {
        const to = String(payload.toUserId || '');
        if (!activeCalls.has(pairKey(socket.userId, to))) return;
        if (incomingEvent === 'call:accept') socket.callPeerId = to;
        if (incomingEvent === 'call:reject') activeCalls.delete(pairKey(socket.userId, to));
        io.to(`user:${to}`).emit(outgoingEvent, { ...payload, fromUserId: socket.userId });
      });
    });

    socket.on('call:end', ({ toUserId } = {}) => {
      const to = String(toUserId || '');
      if (activeCalls.delete(pairKey(socket.userId, to))) {
        io.to(`user:${to}`).emit('call:ended', { fromUserId: socket.userId });
      }
      socket.callPeerId = null;
    });

    socket.on('disconnect', () => {
      if (socket.callPeerId && activeCalls.delete(pairKey(socket.userId, socket.callPeerId))) {
        io.to(`user:${socket.callPeerId}`).emit('call:ended', { fromUserId: socket.userId });
      }

      // ---------- Presence ----------
      const remaining = (onlineCounts.get(socket.userId) || 1) - 1;
      if (remaining <= 0) {
        onlineCounts.delete(socket.userId);
        io.emit('presence:offline', { userId: socket.userId });
      } else {
        onlineCounts.set(socket.userId, remaining);
      }
    });
  });
};

module.exports = registerChatHandlers;