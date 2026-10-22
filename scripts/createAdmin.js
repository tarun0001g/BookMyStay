// Usage: node scripts/createAdmin.js <email> <password>
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
async function main() {
  const [emailArg, password] = process.argv.slice(2);
  if (!emailArg || !password)
    throw new Error('Usage: node scripts/createAdmin.js <email> <password>');
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is required');
  await mongoose.connect(process.env.MONGO_URL);
  const email = emailArg.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: { email, password: hash, userType: 'admin' },
      $setOnInsert: { firstName: 'Admin', lastName: 'User' },
    },
    { upsert: true, new: true, runValidators: true },
  );
  console.log(`Admin account ready for ${user.email}`);
}
main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
