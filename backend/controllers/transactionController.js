import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';

export const createTransaction = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, paymentGateway, transactionId, paymentDetails } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      order: orderId,
      amount,
      paymentMethod,
      paymentGateway,
      transactionId,
      status: 'pending',
      paymentDetails
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('order', 'orderItems totalAmount orderStatus')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email')
      .populate('order');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('order', 'orderItems totalAmount')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction.status = status;
    await transaction.save();

    if (status === 'completed') {
      await Order.findByIdAndUpdate(transaction.order, {
        paymentStatus: 'completed',
        orderStatus: 'processing'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const refundTransaction = async (req, res) => {
  try {
    const { refundAmount, reason } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already refunded'
      });
    }

    transaction.status = 'refunded';
    transaction.refundDetails = {
      refundId: `REF-${Date.now()}`,
      refundAmount: refundAmount || transaction.amount,
      refundDate: new Date(),
      reason
    };

    await transaction.save();

    await Order.findByIdAndUpdate(transaction.order, {
      paymentStatus: 'refunded',
      orderStatus: 'refunded'
    });

    res.status(200).json({
      success: true,
      message: 'Transaction refunded successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
