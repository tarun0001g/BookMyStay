// External modules
const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
  houseName: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  photo: String,
  photoPublicId: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingLockId: { type: String, select: false },
  bookingLockExpiresAt: { type: Date, select: false },
});

homeSchema.index({ location: 1 });
homeSchema.index({ price: 1 });
homeSchema.index({ rating: -1 });
homeSchema.index({ owner: 1 });

// Exports the home model used by listing and booking routes.
module.exports = mongoose.model('Home', homeSchema);
