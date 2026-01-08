import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'stripe', 'card'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['paypal', 'stripe']
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    payerId: String,
    payerEmail: String,
    paymentSource: String,
    cardLast4: String,
    cardBrand: String
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    reason: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
