import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true, trim: true },
    image: { type: String },
    destinationUrl: { type: String, required: true },
    description: { type: String },
    type: { type: String, },
    buttonName: { type: String },
    buttonColor: { type: String, default: '#000000' },
    visits: { type: Number, default: 0 },
    googleLogin: { type: String },
    isActive: { type: Boolean, default: true },
    googleLoginNotForced: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Link', linkSchema);
