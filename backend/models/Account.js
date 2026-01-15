import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Account', accountSchema);
