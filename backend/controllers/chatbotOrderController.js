import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Place order from chatbot
export const placeOrderFromChat = async (req, res) => {
  try {
    const { productId, profileType, duration, paymentMethod, phone } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!productId || !profileType || !duration || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find the matching profile type and pricing
    const profile = product.profileTypes.find(p => p.name === profileType);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile type not found'
      });
    }

    const pricing = profile.pricingOptions.find(p => 
      p.duration.value === parseFloat(duration.value) && 
      p.duration.unit === duration.unit
    );
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing option not found'
      });
    }

    // Get user details
    const user = await User.findById(userId);

    // Create order
    const order = await Order.create({
      user: userId,
      orderItems: [{
        product: productId,
        name: product.name,
        ottType: product.ottType,
        profileType: profileType,
        duration: duration,
        price: pricing.price,
        quantity: 1
      }],
      shippingAddress: {
        phone: phone || user.phone || '',
        email: user.email
      },
      paymentMethod: paymentMethod,
      paymentReceipt: req.file ? req.file.path : '',
      totalAmount: pricing.price,
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Our team will verify your payment and activate your subscription soon.',
      order: {
        _id: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        totalAmount: order.totalAmount,
        status: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Error placing order from chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again or contact support.'
    });
  }
};
