// External modules
const mongoose = require('mongoose');

// Opens the shared MongoDB connection used by the application.
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });
}

module.exports = connectDB;
