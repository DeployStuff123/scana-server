import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    img: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    role: { type: String, enum: ["admin", "user"], default: "user", },
    password: {
      type: String,
      required: true
    },
    isBlocked: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
