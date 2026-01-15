import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Subscription from '../models/Subscription.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import crypto from 'crypto';
import { sendEmail, emailTemplates, sendAdminNewOrderNotification, sendOrderConfirmation, sendOrderStatusUpdate, sendSubscriptionDelivery } from '../utils/emailService.js';

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Math.round(days));
  return d;
};

// Helper function to safely parse object from string
const parseObjectFromString = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    // Already an object, return as is
    return value;
  }
  
  if (typeof value !== 'string') {
    return null;
  }
  
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return null;
  }
  
  // Try JSON.parse first (handles proper JSON)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      // If JSON.parse fails, it might be a JavaScript object literal with single quotes
      // Try to convert single quotes to double quotes for string values
      try {
        const normalized = trimmed.replace(/'/g, '"');
        return JSON.parse(normalized);
      } catch (e2) {
        console.error('Failed to parse object string:', trimmed.substring(0, 100));
        return null;
      }
    }
  }
  
  return null;
};

export const createOrder = async (req, res, next) => {
  try {
    console.log('📦 Creating order - Request body:', {
      hasOrderItems: !!req.body.orderItems,
      paymentMethod: req.body.paymentMethod,
      totalAmount: req.body.totalAmount,
      originalAmount: req.body.originalAmount,
      couponCode: req.body.couponCode,
      couponDiscount: req.body.couponDiscount,
      hasReceipt: !!req.file
    });
    
    let { orderItems, paymentMethod, totalAmount, originalAmount, couponCode, couponDiscount } = req.body;
    
    if (typeof orderItems === 'string') {
      try {
        orderItems = JSON.parse(orderItems);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order items'
        });
      }
    }

    if (!Array.isArray(orderItems)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order items'
      });
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
      const productId = item?.product?._id || item?.product;
      const product = await Product.findById(productId);
      
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

      let selectedProfile = null;
      if (item.selectedProfile !== null && item.selectedProfile !== undefined) {
        if (typeof item.selectedProfile === 'string') {
          selectedProfile = item.selectedProfile;
        } else if (typeof item.selectedProfile === 'object' && !Array.isArray(item.selectedProfile)) {
          selectedProfile = JSON.stringify(item.selectedProfile);
        }
      }

      // Parse selectedPricing - handle both object and string cases
      let selectedPricing = parseObjectFromString(item.selectedPricing);
      // Ensure it's a plain object, not an array or other type
      if (selectedPricing !== null && (typeof selectedPricing !== 'object' || Array.isArray(selectedPricing))) {
        selectedPricing = null;
      }

      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || selectedPricing?.price);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity'
        });
      }

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price'
        });
      }

      const orderItem = {
        product: product._id,
        name: item.name || product.name,
        ottType: item.ottType || product.ottType,
        duration: selectedPricing?.duration,
        price,
        quantity,
        selectedProfile,
        selectedPricing,
        customerEmail: item.customerEmail
      };

      calculatedTotal += orderItem.price * orderItem.quantity;
      processedItems.push(orderItem);
    }

    // Handle receipt - store as base64 in production, file path in development
    let receiptImage = null;
    let receiptData = null;
    
    if (req.file) {
      if (process.env.NODE_ENV === 'production') {
        // Check file size (max 5MB for base64 storage)
        if (req.file.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'Receipt file size should be less than 5MB'
          });
        }
        
        // Store as base64 in production
        receiptData = {
          data: req.file.buffer.toString('base64'),
          contentType: req.file.mimetype,
          filename: req.file.originalname
        };
        
        console.log('Receipt stored as base64, size:', req.file.size, 'bytes');
      } else {
        // Store file path in development
        receiptImage = `/uploads/receipts/${req.file.filename}`;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment receipt is required'
      });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems: processedItems,
      totalAmount: totalAmount || calculatedTotal,
      originalAmount: originalAmount || totalAmount || calculatedTotal,
      couponCode: couponCode || undefined,
      couponDiscount: couponDiscount ? Number(couponDiscount) : 0,
      paymentMethod: paymentMethod || 'khalti',
      receiptImage,
      receiptData,
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });
    
    console.log('✅ Order created successfully:', {
      orderId: order._id,
      totalAmount: order.totalAmount,
      originalAmount: order.originalAmount,
      couponDiscount: order.couponDiscount
    });

    await order.populate('user', 'name email');

    // Send emails with proper error handling
    try {
      const confirmationResult = await sendOrderConfirmation(order.user, order);
      if (confirmationResult.success) {
        console.log('✅ Order confirmation email sent to:', order.user.email);
      } else {
        console.error('❌ Failed to send order confirmation email:', confirmationResult.error);
      }
    } catch (emailError) {
      console.error('❌ Order confirmation email error:', emailError);
    }

    try {
      if (process.env.ADMIN_EMAIL) {
        const adminResult = await sendAdminNewOrderNotification(process.env.ADMIN_EMAIL, order);
        if (adminResult.success) {
          console.log('✅ Admin notification email sent to:', process.env.ADMIN_EMAIL);
        } else {
          console.error('❌ Failed to send admin notification email:', adminResult.error);
        }
      } else {
        console.log('⚠️ No ADMIN_EMAIL configured, skipping admin notification');
      }
    } catch (adminEmailError) {
      console.error('❌ Admin notification email error:', adminEmailError);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Admin will verify your payment and deliver soon.',
      order
    });
  } catch (error) {
    console.error('❌ Order creation error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      body: req.body
    });
    return next(error);
  }
};

export const updateOrderAdmin = async (req, res) => {
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

    const {
      orderStatus,
      paymentStatus,
      paymentMethod,
      totalAmount,
      originalAmount,
      couponCode,
      couponDiscount,
      adminNotes,
      customerNotes,
      orderSource,
      customerInfo,
      localOrderDetails
    } = req.body;

    if (orderStatus !== undefined) order.orderStatus = orderStatus;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) order.paymentMethod = paymentMethod;

    if (totalAmount !== undefined) order.totalAmount = Number(totalAmount);
    if (originalAmount !== undefined) order.originalAmount = Number(originalAmount);
    if (couponCode !== undefined) order.couponCode = couponCode;
    if (couponDiscount !== undefined) order.couponDiscount = Number(couponDiscount);

    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    if (customerNotes !== undefined) order.customerNotes = customerNotes;

    if (orderSource !== undefined) order.orderSource = orderSource;

    if (customerInfo && typeof customerInfo === 'object') {
      order.customerInfo = {
        ...(order.customerInfo || {}),
        ...(customerInfo || {})
      };
    }

    if (localOrderDetails && typeof localOrderDetails === 'object') {
      order.localOrderDetails = {
        ...(order.localOrderDetails || {}),
        ...(localOrderDetails || {})
      };
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Subscription.deleteMany({ order: order._id });
    await Transaction.deleteMany({ order: order._id });
    await Order.deleteOne({ _id: order._id });

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
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

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = order.orderStatus;

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    if (orderStatus && previousStatus !== order.orderStatus) {
      try {
        const statusResult = await sendOrderStatusUpdate(order.user, order, previousStatus);
        if (statusResult.success) {
          console.log('✅ Order status update email sent to:', order.user.email);
        } else {
          console.error('❌ Failed to send order status update email:', statusResult.error);
        }
      } catch (statusEmailError) {
        console.error('❌ Order status update email error:', statusEmailError);
      }
    }

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
    const { credentials, instructions, startDate, expiryDate, credentialType } = req.body;

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

    const normalizedCredentials = {
      email: credentials?.email || '',
      profile: credentials?.profile || '',
      profilePin: credentials?.profilePin || '',
      additionalNote: credentials?.additionalNote || ''
    };

    if (credentials?.password) {
      normalizedCredentials.password = credentials.password;
    }

    const deliveryDetails = {
      credentials: normalizedCredentials,
      instructions: instructions || '',
      deliveredAt: order.deliveryDetails?.deliveredAt || new Date()
    };

    // Update order with delivery details
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      { 
        deliveryDetails: deliveryDetails,
        orderStatus: isAlreadyDelivered ? order.orderStatus : 'delivered'
      },
      { new: true, upsert: false }
    );

    // Local orders don't have a user, so skip subscription creation + email delivery logic.
    if (!order.user) {
      return res.status(200).json({
        success: true,
        message: isAlreadyDelivered ? 'Credentials updated successfully' : 'Order delivered successfully',
        order: updatedOrder
      });
    }

    // Update existing subscriptions with new credentials if already delivered
    if (isAlreadyDelivered) {
      const Subscription = (await import('../models/Subscription.js')).default;
      
      // Get all subscriptions for this order to check profile types
      const existingSubs = await Subscription.find({ order: order._id }).populate('product');
      
      for (const subscription of existingSubs) {
        // Find the corresponding order item
        const matchingItem = order.orderItems.find(item => {
          const itemProductId = item.product?._id ? item.product._id.toString() : item.product?.toString();
          return itemProductId && itemProductId === subscription.product.toString() && item.ottType === subscription.ottType;
        });
        
        // Check if this is a shared or private profile type
        const profileType = matchingItem?.product?.profileTypes?.find(pt => pt.name === matchingItem?.selectedProfile);
        const isSharedProfile = profileType?.accountType === 'shared';
        const isPrivateProfile = profileType?.accountType === 'private';
        
        await Subscription.updateOne(
          { _id: subscription._id },
          {
            $set: {
              'credentials.email': credentials?.email || '',
              'credentials.password': credentialType === 'password' && credentials?.password ? credentials.password : undefined,
              'credentials.loginPin': credentialType === 'loginPin' && credentials?.loginPin ? credentials.loginPin : undefined,
              'credentials.credentialType': credentialType || 'password',
              'credentials.profile': credentials?.profile || '',
              'credentials.profilePin': credentials?.profilePin || '',
              'credentials.additionalNote': credentials?.additionalNote || '',
              'credentials.isSharedProfile': isSharedProfile,
              'credentials.isPrivateProfile': isPrivateProfile,
              'credentials.accessCode': isSharedProfile ? null : undefined,
              activationKey: undefined
            }
          }
        );
      }

      for (const subscription of existingSubs) {
        const matchingItem = order.orderItems.find((item) => {
          const itemProductId = item.product?._id ? item.product._id.toString() : item.product?.toString();
          return itemProductId && itemProductId === subscription.product.toString() && item.ottType === subscription.ottType;
        });

        const recipientEmail = matchingItem?.customerEmail || order.user.email;
        const recipientUser = { name: order.user.name, email: recipientEmail };
        try {
          const deliveryResult = await sendSubscriptionDelivery(recipientUser, subscription, order.deliveryDetails);
          if (deliveryResult.success) {
            console.log('✅ Subscription delivery email sent to:', recipientEmail);
          } else {
            console.error('❌ Failed to send subscription delivery email:', deliveryResult.error);
          }
        } catch (deliveryEmailError) {
          console.error('❌ Subscription delivery email error:', deliveryEmailError);
        }
      }
    }

    // Create subscriptions only if not already delivered
    if (!isAlreadyDelivered) {
      for (const item of order.orderItems) {
      const subscriptionStartDate = startDate ? new Date(startDate) : new Date();
      let subscriptionExpiryDate;

      // Use expiryDate from request if provided, otherwise calculate from duration
      if (expiryDate) {
        subscriptionExpiryDate = new Date(expiryDate);
      } else {
        subscriptionExpiryDate = new Date(subscriptionStartDate);
        const durationValue = Number(item?.duration?.value || 0);
        const durationUnit = String(item?.duration?.unit || 'month');

        if (durationUnit === 'days') {
          subscriptionExpiryDate = addDays(subscriptionExpiryDate, durationValue);
        } else if (durationUnit === 'year') {
          subscriptionExpiryDate = addDays(subscriptionExpiryDate, durationValue * 365);
        } else {
          // Treat month/months as 30 days so fractional months (e.g. 1.5) work as expected.
          subscriptionExpiryDate = addDays(subscriptionExpiryDate, durationValue * 30);
        }
      }

      // Check if this is a shared or private profile type
      const profileType = item.product.profileTypes?.find(pt => pt.name === item.selectedProfile);
      const isSharedProfile = profileType?.accountType === 'shared';
      const isPrivateProfile = profileType?.accountType === 'private';

      const subscription = await Subscription.create({
        user: order.user._id,
        order: order._id,
        product: item.product._id,
        ottType: item.ottType,
        startDate: subscriptionStartDate,
        expiryDate: subscriptionExpiryDate,
        duration: item.duration,
        status: 'active',
        credentials: {
          email: credentials?.email || '',
          password: credentialType === 'password' && credentials?.password ? credentials.password : undefined,
          loginPin: credentialType === 'loginPin' && credentials?.loginPin ? credentials.loginPin : undefined,
          credentialType: credentialType || 'password',
          profile: credentials?.profile || '',
          profilePin: credentials?.profilePin || '',
          additionalNote: credentials?.additionalNote || '',
          isSharedProfile,
          isPrivateProfile,
          accessCode: isSharedProfile ? null : undefined
        },
        activationKey: undefined
      });

      const recipientEmail = item.customerEmail || order.user.email;
      const recipientUser = { name: order.user.name, email: recipientEmail };
      try {
        const deliveryResult = await sendSubscriptionDelivery(recipientUser, subscription, order.deliveryDetails);
        if (deliveryResult.success) {
          console.log('✅ Subscription delivery email sent to:', recipientEmail);
        } else {
          console.error('❌ Failed to send subscription delivery email:', deliveryResult.error);
        }
      } catch (deliveryEmailError) {
        console.error('❌ Subscription delivery email error:', deliveryEmailError);
      }
      }
    }

    res.status(200).json({
      success: true,
      message: isAlreadyDelivered ? 'Credentials updated successfully' : 'Order delivered successfully',
      order: updatedOrder
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

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = order.orderStatus;

    order.paymentStatus = paymentStatus;
    if (paymentResult) {
      order.paymentResult = paymentResult;
    }

    if (paymentStatus === 'completed') {
      order.orderStatus = 'processing';
    }

    await order.save();

    if (previousStatus !== order.orderStatus) {
      try {
        const statusResult = await sendOrderStatusUpdate(order.user, order, previousStatus);
        if (statusResult.success) {
          console.log('✅ Payment status update email sent to:', order.user.email);
        } else {
          console.error('❌ Failed to send payment status update email:', statusResult.error);
        }
      } catch (statusEmailError) {
        console.error('❌ Payment status update email error:', statusEmailError);
      }
    }

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

// Create local order (for Facebook, Messenger, WhatsApp, etc.)
export const createLocalOrder = async (req, res) => {
  try {
    const {
      customerInfo,
      orderItems,
      totalAmount,
      orderSource,
      localOrderDetails,
      adminNotes,
      couponCode,
      couponDiscount,
      originalAmount
    } = req.body;

    // Validate required fields
    if (!customerInfo?.name) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one order item is required'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total amount must be greater than 0'
      });
    }

    let customerCode;
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `DD-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
      const exists = await Order.findOne({ customerCode: candidate }).select('_id');
      if (!exists) {
        customerCode = candidate;
        break;
      }
    }

    if (!customerCode) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate customer code'
      });
    }

    // Create the local order
    const normalizedLocalOrderDetails = {
      ...(localOrderDetails || {})
    };

    const order = await Order.create({
      user: null, // Local orders don't have a user account
      customerCode,
      orderItems,
      totalAmount,
      couponCode,
      couponDiscount: couponDiscount || 0,
      originalAmount: originalAmount || totalAmount,
      orderStatus: 'confirmed',
      paymentStatus: 'completed',
      paymentMethod: normalizedLocalOrderDetails?.paymentMethod || 'other',
      orderSource: orderSource || 'other',
      customerInfo,
      localOrderDetails: normalizedLocalOrderDetails,
      adminNotes,
      customerNotes: normalizedLocalOrderDetails?.notes || ''
    });

    // Populate product information for response
    const populatedOrder = await Order.findById(order._id).populate('orderItems.product');

    // Send confirmation email if customer email is provided
    if (customerInfo.email) {
      try {
        await sendEmail({
          email: customerInfo.email,
          subject: 'Order Confirmation - Digital Dudes',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Order Confirmation</h2>
              <p>Dear ${customerInfo.name},</p>
              <p>Thank you for your order! We've received your order and it's being processed.</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Total Amount:</strong> NPR ${totalAmount}</p>
                <p><strong>Payment Method:</strong> ${localOrderDetails?.paymentMethod || 'Other'}</p>
                <p><strong>Order Source:</strong> ${orderSource || 'Other'}</p>
              </div>
              <p>We will deliver your subscription credentials shortly.</p>
              <p>Best regards,<br>Digital Dudes Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the order if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Local order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create local order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrderByCustomerCode = async (req, res) => {
  try {
    const customerCode = String(req.params.customerCode || '').trim();
    if (!customerCode) {
      return res.status(400).json({
        success: false,
        message: 'Customer code is required'
      });
    }

    const order = await Order.findOne({ customerCode })
      .populate('orderItems.product', 'name ottType image')
      .select('-adminNotes -receiptData -receiptImage');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const subscriptions = await Subscription.find({ order: order._id })
      .populate('product', 'name ottType image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      order,
      subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateOrderCredentials = async (req, res) => {
  try {
    const { credentials } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order delivery credentials
    if (!order.deliveryDetails) {
      order.deliveryDetails = {};
    }
    
    order.deliveryDetails.credentials = {
      email: credentials?.email || '',
      password: credentials?.password || '',
      profile: credentials?.profile || '',
      profilePin: credentials?.profilePin || '',
      additionalNote: credentials?.additionalNote || ''
    };

    await order.save();

    // Prepare subscription update object
    const subscriptionUpdate = {
      email: credentials?.email || '',
      password: credentials?.password || '',
      profile: credentials?.profile || '',
      profilePin: credentials?.profilePin || ''
    };

    // Add expiry date if provided
    if (credentials?.expiryDate) {
      subscriptionUpdate.expiryDate = new Date(credentials.expiryDate);
    }

    // Update all subscriptions for this order
    await Subscription.updateMany(
      { order: order._id },
      { $set: subscriptionUpdate }
    );

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('orderItems.product');

    res.status(200).json({
      success: true,
      message: 'Credentials updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
