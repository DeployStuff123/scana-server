import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    visitorId: { type: String, required: true },
    visitedAt: { type: Date, default: Date.now, required: true },
    visitIp: { type: String },
  },
)

export default mongoose.model('Visit', visitSchema);
