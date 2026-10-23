// External modules
const mongoose = require('mongoose');

const PROPERTY_TYPES = ['cottage', 'villa', 'farmhouse', 'apartment', 'other'];
const AMENITIES = ['wifi', 'pool', 'kitchen', 'parking', 'pet-friendly'];

const homeSchema = new mongoose.Schema({
  houseName: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  photo: String,
  photoPublicId: String,
  description: String,
  propertyType: { type: String, enum: PROPERTY_TYPES, default: 'other' },
  amenities: { type: [String], enum: AMENITIES, default: [] },
  guestCapacity: { type: Number, min: 1, default: 2 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingLockId: { type: String, select: false },
  bookingLockExpiresAt: { type: Date, select: false },
});

homeSchema.index({ location: 1 });
homeSchema.index({ price: 1 });
homeSchema.index({ rating: -1 });
homeSchema.index({ owner: 1 });
homeSchema.index({ propertyType: 1, amenities: 1 });

// Exports the home model used by listing and booking routes.
module.exports = mongoose.model('Home', homeSchema);
module.exports.PROPERTY_TYPES = PROPERTY_TYPES;
module.exports.AMENITIES = AMENITIES;
