const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    media: [{ type: String }], // URLs to uploaded images
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, // null = public feed
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
