const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
  houseName: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  photo: String,
  photoPublicId: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

homeSchema.index({ location: 1 });
homeSchema.index({ price: 1 });

module.exports = mongoose.model('Home', homeSchema);
