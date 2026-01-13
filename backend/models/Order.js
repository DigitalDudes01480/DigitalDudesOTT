import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
      default: null
    },
    name: {
      type: String,
      required: true
    },
    ottType: {
      type: String,
      required: true
    },
    duration: {
      value: Number,
      unit: String
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    selectedProfile: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    selectedPricing: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  couponCode: {
    type: String,
    uppercase: true
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  originalAmount: {
    type: Number
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'stripe', 'card', 'khalti', 'bank-transfer'],
    required: true
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  deliveryDetails: {
    credentials: {
      email: String,
      password: String,
      profile: String,
      profilePin: String,
      additionalNote: String
    },
    activationKey: String,
    instructions: String,
    deliveredAt: Date
  },
  customerNotes: String,
  adminNotes: String,
  receiptImage: String,
  receiptData: {
    data: String,
    contentType: String,
    filename: String
  }
}, {
  timestamps: true
});

orderSchema.index({ user: 1, orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
