const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'comment', 'connection_request', 'connection_accepted', 'message', 'group_join'],
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },
    connection: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);