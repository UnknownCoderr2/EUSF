const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  blacklistedAt: { type: Date, default: Date.now }
});

// 🧹 احذف تلقائيًا بعد 7 أيام (604800 ثانية)
BlacklistSchema.index({ blacklistedAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Blacklist', BlacklistSchema);
