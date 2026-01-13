import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  ottType: {
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
  duration: {
    value: Number,
    unit: String
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended'],
    default: 'active'
  },
  credentials: {
    email: String,
    password: String,
    profile: String,
    profilePin: String,
    additionalNote: String,
    accessCode: String,
    isSharedProfile: {
      type: Boolean,
      default: false
    }
  },
  activationKey: String,
  autoRenew: {
    type: Boolean,
    default: false
  },
  renewalDate: Date,
  notes: String,
  sharedProfileRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    code: String,
    approvedDate: Date,
    expiresAt: Date
  }]
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ expiryDate: 1 });

subscriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

subscriptionSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.expiryDate);
});

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

subscriptionSchema.pre('save', function(next) {
  if (this.isExpired && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
