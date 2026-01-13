import orderAssistantService from '../services/orderAssistantService.js';
import Order from '../models/Order.js';
import upload from '../middleware/upload.js';

// Chat with order assistant
export const chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user?._id?.toString() || req.sessionID || 'guest';

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Process message through order assistant
    const response = await orderAssistantService.processMessage(userId, message);

    res.json({
      success: true,
      response: response,
      sessionId: userId
    });
  } catch (error) {
    console.error('Order assistant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
};

// Upload receipt and create order
export const uploadReceipt = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = sessionId || req.user?._id?.toString() || 'guest';
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Receipt file is required'
      });
    }

    // Handle both disk storage (path) and memory storage (buffer)
    const receiptPath = req.file.path || `receipt-${Date.now()}-${req.file.originalname}`;

    // Confirm order with receipt
    const result = await orderAssistantService.confirmOrder(userId, receiptPath);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Create order in database
    const orderData = result.orderData;
    
    // Find product by name
    const Product = (await import('../models/Product.js')).default;
    const product = await Product.findOne({ 
      name: new RegExp(orderData.product, 'i'),
      status: 'active'
    });

    // Use order data from conversation state (already validated during chat)
    const productId = product?._id || null;
    const productName = product?.name || orderData.product;
    const ottType = product?.ottType || orderData.product;
    const profileType = orderData.profileType;
    const price = Number(orderData.price) || 0;

    const durationRaw = (orderData.duration || '').toString();
    const durationValue = parseFloat(durationRaw.match(/[\d.]+/)?.[0]) || null;
    const durationUnit = durationRaw.toLowerCase().includes('day') ? 'days' : 'months';

    const paymentMethod = orderData.paymentMethod?.toLowerCase().includes('khalti')
      ? 'khalti'
      : 'bank-transfer';

    // Create order with required fields filled to avoid validation errors
    const order = await Order.create({
      user: req.user?._id || null,
      orderItems: [{
        product: productId,
        name: productName,
        ottType: ottType,
        duration: {
          value: durationValue,
          unit: durationUnit
        },
        price: price,
        quantity: 1,
        selectedProfile: { profileType },
        selectedPricing: {
          profileType,
          duration: durationRaw,
          price
        },
        customerEmail: orderData.email || null
      }],
      totalAmount: price,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      receiptImage: receiptPath
    });

    res.json({
      success: true,
      message: result.message,
      order: order
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload receipt',
      error: error.message
    });
  }
};

// Reset conversation
export const resetConversation = async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.sessionID || 'guest';
    orderAssistantService.clearState(userId);

    res.json({
      success: true,
      message: 'Conversation reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset conversation'
    });
  }
};
