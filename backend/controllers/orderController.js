import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Subscription from '../models/Subscription.js';
import Transaction from '../models/Transaction.js';
import { sendOrderConfirmation, sendSubscriptionDelivery } from '../utils/emailService.js';

export const createOrder = async (req, res) => {
  try {
    let { orderItems, paymentMethod, totalAmount } = req.body;
    
    if (typeof orderItems === 'string') {
      orderItems = JSON.parse(orderItems);
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    const processedItems = [];
    let calculatedTotal = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      const orderItem = {
        product: product._id,
        name: item.name || product.name,
        ottType: item.ottType || product.ottType,
        duration: item.selectedPricing?.duration || product.duration,
        price: item.price || item.selectedPricing?.price || product.price,
        quantity: item.quantity || 1,
        selectedProfile: item.selectedProfile,
        selectedPricing: item.selectedPricing
      };

      calculatedTotal += orderItem.price * orderItem.quantity;
      processedItems.push(orderItem);
    }

    // Handle receipt - store as base64 in production, file path in development
    let receiptImage = null;
    let receiptData = null;
    
    if (req.file) {
      if (process.env.NODE_ENV === 'production') {
        // Store as base64 in production
        receiptData = {
          data: req.file.buffer.toString('base64'),
          contentType: req.file.mimetype,
          filename: req.file.originalname
        };
      } else {
        // Store file path in development
        receiptImage = `/uploads/receipts/${req.file.filename}`;
      }
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems: processedItems,
      totalAmount: totalAmount || calculatedTotal,
      paymentMethod: paymentMethod || 'khalti',
      receiptImage,
      receiptData,
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });

    await order.populate('user', 'name email');

    await sendOrderConfirmation(order.user, order);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Admin will verify your payment and deliver soon.',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;

    let query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('orderItems.product')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, adminNotes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deliverOrder = async (req, res) => {
  try {
    const { credentials, activationKey, instructions, startDate } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isAlreadyDelivered = order.orderStatus === 'delivered';

    order.deliveryDetails = {
      credentials,
      activationKey,
      instructions,
      deliveredAt: order.deliveryDetails?.deliveredAt || new Date()
    };
    
    if (!isAlreadyDelivered) {
      order.orderStatus = 'delivered';
    }

    await order.save();

    // Update existing subscriptions with new credentials if already delivered
    if (isAlreadyDelivered) {
      const Subscription = (await import('../models/Subscription.js')).default;
      await Subscription.updateMany(
        { order: order._id },
        {
          $set: {
            'credentials.email': credentials?.email || '',
            'credentials.password': credentials?.password || '',
            'credentials.profile': credentials?.profile || '',
            'credentials.profilePin': credentials?.profilePin || '',
            'credentials.additionalNote': credentials?.additionalNote || ''
          }
        }
      );
    }

    // Create subscriptions only if not already delivered
    if (!isAlreadyDelivered) {
      for (const item of order.orderItems) {
      const subscriptionStartDate = startDate ? new Date(startDate) : new Date();
      const expiryDate = new Date(subscriptionStartDate);
      
      if (item.duration.unit === 'year') {
        expiryDate.setFullYear(expiryDate.getFullYear() + item.duration.value);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + item.duration.value);
      }

      const subscription = await Subscription.create({
        user: order.user._id,
        order: order._id,
        product: item.product._id,
        ottType: item.ottType,
        startDate: subscriptionStartDate,
        expiryDate,
        duration: item.duration,
        status: 'active',
        credentials: {
          email: credentials?.email || '',
          password: credentials?.password || '',
          profile: credentials?.profile || '',
          profilePin: credentials?.profilePin || '',
          additionalNote: credentials?.additionalNote || ''
        },
        activationKey
      });

      await sendSubscriptionDelivery(order.user, subscription, order.deliveryDetails);
      }
    }

    res.status(200).json({
      success: true,
      message: isAlreadyDelivered ? 'Credentials updated successfully' : 'Order delivered successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentResult } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentStatus = paymentStatus;
    if (paymentResult) {
      order.paymentResult = paymentResult;
    }

    if (paymentStatus === 'completed') {
      order.orderStatus = 'processing';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
