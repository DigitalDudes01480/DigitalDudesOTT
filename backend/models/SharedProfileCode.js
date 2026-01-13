import mongoose from 'mongoose';

const sharedProfileCodeSchema = new mongoose.Schema({
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  usedAt: {
    type: Date
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  accessCount: {
    type: Number,
    default: 0
  },
  maxAccess: {
    type: Number,
    default: 1
  },
  notes: String
}, {
  timestamps: true
});

sharedProfileCodeSchema.index({ code: 1 });
sharedProfileCodeSchema.index({ subscription: 1 });
sharedProfileCodeSchema.index({ user: 1 });
sharedProfileCodeSchema.index({ status: 1 });
sharedProfileCodeSchema.index({ expiresAt: 1 });

sharedProfileCodeSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.expiresAt);
});

sharedProfileCodeSchema.virtual('isUsed').get(function() {
  return this.status === 'used' || this.accessCount >= this.maxAccess;
});

sharedProfileCodeSchema.set('toJSON', { virtuals: true });
sharedProfileCodeSchema.set('toObject', { virtuals: true });

// Auto-expire codes
sharedProfileCodeSchema.pre('save', function(next) {
  if (this.isExpired && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Generate random code method
sharedProfileCodeSchema.statics.generateCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const SharedProfileCode = mongoose.model('SharedProfileCode', sharedProfileCodeSchema);

export default SharedProfileCode;
