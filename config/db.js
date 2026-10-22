// Connects the application to its configured MongoDB database.
const mongoose = require('mongoose');

// Opens the shared MongoDB connection used by the application.
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URL);
}

module.exports = connectDB;
