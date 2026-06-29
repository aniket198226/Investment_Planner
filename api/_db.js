const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  if (connected) return;
  await mongoose.connect(process.env.MONGODB_URI);
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
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  data:      mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = {
  connectDB,
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Plan: mongoose.models.Plan || mongoose.model('Plan', PlanSchema),
};
