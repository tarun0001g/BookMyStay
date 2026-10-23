// External modules
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },

  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
  },

  userType: {
    type: String,
    enum: ['guest', 'admin'],
    default: 'guest',
  },

  favourites: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home',
      },
    ],
    default: [],
  },
});

// Exports the user model used by account and favourites routes.
module.exports = mongoose.model('User', userSchema);
