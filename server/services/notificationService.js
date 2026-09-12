const Notification = require('../models/Notification');
const { getIO } = require('../sockets/ioRegistry');

const createNotification = async ({ recipient, actor, type, post, group, conversation, connection }) => {
  if (recipient.toString() === actor.toString()) return null;

  const notification = await Notification.create({
    recipient,
    actor,
    type,
    post: post || null,
    group: group || null,
    conversation: conversation || null,
    connection: connection || null,
  });

  const populated = await notification.populate('actor', 'name avatarUrl');

  const io = getIO();
  if (io) {
    io.to(`user:${recipient}`).emit('notification:new', populated);
  }

  return populated;
};

module.exports = { createNotification };