import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount amount cannot be negative']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  userUsageLimit: {
    type: Number,
    default: 1,
    min: [1, 'User usage limit must be at least 1']
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usageCount: {
      type: Number,
      default: 0
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Virtual to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Virtual to check if coupon is valid (active and not expired)
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && now >= this.validFrom && now <= this.validUntil;
});

// Method to check if coupon has reached usage limit
couponSchema.methods.hasReachedLimit = function() {
  if (!this.usageLimit) return false;
  return this.usageCount >= this.usageLimit;
};

// Method to check if user has reached their usage limit
couponSchema.methods.hasUserReachedLimit = function(userId) {
  const userUsage = this.usedBy.find(u => u.user.toString() === userId.toString());
  if (!userUsage) return false;
  return userUsage.usageCount >= this.userUsageLimit;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderAmount) {
    return 0;
  }

  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else if (this.discountType === 'fixed') {
    discount = this.discountValue;
    if (discount > orderAmount) {
      discount = orderAmount;
    }
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
