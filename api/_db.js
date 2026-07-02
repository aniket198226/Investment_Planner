const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  if (connected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  // Drop legacy unique index on userId to support multiple plans per user
  try { await mongoose.connection.db.collection('plans').dropIndex('userId_1'); } catch {}
  connected = true;
}

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, required: true },
  email:    { type: String, required: true },
  name:     String,
  picture:  String,
  createdAt: { type: Date, default: Date.now },
});

const PlanSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, default: 'My Plan' },
  data:      mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = {
  connectDB,
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Plan: mongoose.models.Plan || mongoose.model('Plan', PlanSchema),
};
