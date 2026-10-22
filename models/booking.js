const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true },
    nights: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true },
);
bookingSchema.index({ home: 1, checkIn: 1, checkOut: 1 });
module.exports = mongoose.model('Booking', bookingSchema);
