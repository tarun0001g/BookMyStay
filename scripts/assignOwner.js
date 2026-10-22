// Usage: node scripts/assignOwner.js <admin-email>
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Home = require('../models/home');
async function main() {
  const emailArg = process.argv[2];
  if (!emailArg) throw new Error('Usage: node scripts/assignOwner.js <admin-email>');
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is required');
  await mongoose.connect(process.env.MONGO_URL);
  const admin = await User.findOne({
    email: emailArg.trim().toLowerCase(),
    userType: 'admin',
  });
  if (!admin) throw new Error('No admin found for that email');
  const result = await Home.updateMany(
    { $or: [{ owner: { $exists: false } }, { owner: null }] },
    { $set: { owner: admin._id } },
  );
  console.log(`Assigned ${result.modifiedCount} homes to ${admin.email}`);
}
main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
