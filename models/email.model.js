// models/email.model.js
import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  email: { type: String },
  visitedAt: { type: Date, default: Date.now },
  followUpSent: { type: Boolean },
  followUpSentAt: { type: Date },
}, {
  timestamps: true
});

export default mongoose.model('Email', emailSchema);
