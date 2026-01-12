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

    if (!product) {
      console.error('Product not found:', orderData.product);
      return res.status(404).json({
        success: false,
        message: `Product not found: ${orderData.product}`
      });
    }

    if (!product.pricing || !Array.isArray(product.pricing)) {
      console.error('Product pricing is invalid:', product);
      return res.status(500).json({
        success: false,
        message: 'Product pricing data is invalid'
      });
    }

    // Find matching pricing with flexible matching
    const pricing = product.pricing.find(p => {
      if (!p || !p.profileType || !p.duration) return false;
      
      const profileMatch = p.profileType.toLowerCase().includes(orderData.profileType.toLowerCase()) || 
                          orderData.profileType.toLowerCase().includes(p.profileType.toLowerCase());
      
      const durationMatch = p.duration.toLowerCase().includes(orderData.duration.toLowerCase()) ||
                           orderData.duration.toLowerCase().includes(p.duration.toLowerCase());
      
      return profileMatch && durationMatch;
    });

    if (!pricing) {
      console.error('Pricing not found for:', { 
        product: orderData.product, 
        profileType: orderData.profileType, 
        duration: orderData.duration,
        availablePricing: product.pricing 
      });
      return res.status(404).json({
        success: false,
        message: `Pricing not found for ${orderData.profileType} ${orderData.duration}`
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user?._id || null,
      orderItems: [{
        product: product._id,
        profileType: pricing.profileType,
        duration: pricing.duration,
        price: pricing.price,
        quantity: 1
      }],
      totalAmount: pricing.price,
      paymentMethod: orderData.paymentMethod.toLowerCase().includes('khalti') ? 'khalti' : 'bank',
      paymentStatus: 'pending',
      paymentReceipt: receiptPath,
      orderStatus: 'pending',
      orderSource: 'chatbot'
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
