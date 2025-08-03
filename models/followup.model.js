import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  enabled: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  subject: { type: String, required: true },
  // message: { type: String },
  attachment: { type: Object, fileType: String, imageUrl: String, pdfUrl: String },
  destinationUrl: { type: String },

  // Type: 'casual' or 'scheduled'
  followUpType: { type: String, enum: ['casual', 'scheduled'], default: 'casual', required: true },

  // For casual
  delayInMinutes: { type: Number, default: 0 },

  // For scheduled
  scheduleType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  sendHour: { type: Number, min: 0, max: 23 }, // 24hr clock
  scheduleDay: { type: Number, min: 0, max: 6 }, // 0 = Sunday (for weekly)
  scheduleDate: { type: Number, min: 1, max: 31 }, // 1 to 31 (for monthly)
}, {
  timestamps: true
});

export default mongoose.model('FollowUp', followUpSchema);
