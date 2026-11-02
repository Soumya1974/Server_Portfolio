import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: [true, 'IP address is required'],
      unique: true,
      trim: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    followedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Explicit unique index to prevent duplicate follows from the same IP at the DB level
followerSchema.index({ ip: 1 }, { unique: true });

const Follower = mongoose.models.Follower || mongoose.model('Follower', followerSchema);

export default Follower;
