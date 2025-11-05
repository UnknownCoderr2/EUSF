const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Set TTL of 7 days (604800 seconds)
RefreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
