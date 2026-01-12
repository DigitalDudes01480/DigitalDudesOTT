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
    const profileType = orderData.profileType;
    const duration = orderData.duration;
    const price = orderData.price;

    // Create order with data from conversation state
    const order = await Order.create({
      user: req.user?._id || null,
      orderItems: [{
        product: productId,
        profileType: profileType,
        duration: duration,
        price: price,
        quantity: 1
      }],
      totalAmount: price,
      paymentMethod: orderData.paymentMethod.toLowerCase().includes('khalti') ? 'khalti' : 'bank',
      paymentStatus: 'pending',
      paymentReceipt: receiptPath,
      orderStatus: 'pending',
      orderSource: 'chatbot',
      customerEmail: orderData.email || null
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
