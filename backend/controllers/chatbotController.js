import Ticket from '../models/Ticket.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';

// Intelligent chatbot response system
const generateResponse = async (message, userId) => {
  try {
    const lowerMessage = message.toLowerCase().trim();
    
    // Greeting patterns
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowerMessage)) {
      return {
        type: 'greeting',
        message: "Hello! 👋 I'm your Digital Dudes support assistant. How can I help you today?\n\nI can assist you with:\n• Order status and tracking\n• Subscription information\n• Account issues\n• Product inquiries\n• Technical support\n• Billing questions",
        suggestions: ['Check my orders', 'View subscriptions', 'Product catalog', 'Create support ticket']
      };
    }

    // Order-related queries
    if (/order|purchase|bought|buy/.test(lowerMessage)) {
      try {
        if (!userId) {
          return {
            type: 'info',
            message: "Please log in to view your orders.",
            suggestions: ['Browse products', 'Contact support']
          };
        }

        const orders = await Order.find({ user: userId })
          .sort('-createdAt')
          .limit(3)
          .populate('orderItems.product', 'name')
          .lean()
          .catch(() => []);
        
        if (!orders || orders.length === 0) {
          return {
            type: 'info',
            message: "You don't have any orders yet. Would you like to browse our products?",
            suggestions: ['Browse products', 'View pricing', 'Contact support']
          };
        }

        const recentOrder = orders[0];
        let response = `📦 Your most recent order (#${recentOrder._id.toString().slice(-6).toUpperCase()}):\n\n`;
        response += `Status: ${recentOrder.orderStatus}\n`;
        response += `Payment: ${recentOrder.paymentStatus}\n`;
        response += `Total: ₹${recentOrder.totalAmount}\n\n`;
        
        if (orders.length > 1) {
          response += `You have ${orders.length} total orders. `;
        }

        return {
          type: 'order_info',
          message: response,
          suggestions: ['View all orders', 'Track delivery', 'Contact support'],
          data: { orders: orders.map(o => o._id) }
        };
      } catch (error) {
        console.error('Error fetching orders:', error);
        return {
          type: 'info',
          message: "I can help you with your orders! Please visit the Dashboard to view your order history.",
          suggestions: ['Go to Dashboard', 'Contact support', 'Create ticket']
        };
      }
    }

    // Subscription queries
    if (/subscription|expire|renew|active/.test(lowerMessage)) {
      try {
        if (!userId) {
          return {
            type: 'info',
            message: "Please log in to view your subscriptions.",
            suggestions: ['Browse products', 'Contact support']
          };
        }

        const subscriptions = await Subscription.find({ 
          user: userId,
          status: 'active'
        }).populate('product', 'name ottType').lean().catch(() => []);
        
        if (!subscriptions || subscriptions.length === 0) {
          return {
            type: 'info',
            message: "You don't have any active subscriptions. Browse our products to get started!",
            suggestions: ['Browse products', 'View pricing', 'Contact support']
          };
        }

        let response = `🎬 Your Active Subscriptions:\n\n`;
        subscriptions.forEach((sub, idx) => {
          if (sub.product) {
            const daysLeft = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            response += `${idx + 1}. ${sub.product.name} (${sub.product.ottType})\n`;
            response += `   Days remaining: ${daysLeft > 0 ? daysLeft : 'Expired'}\n\n`;
          }
        });

        return {
          type: 'subscription_info',
          message: response,
          suggestions: ['Renew subscription', 'View all subscriptions', 'Contact support']
        };
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return {
          type: 'info',
          message: "I can help you with your subscriptions! Please visit the Dashboard to view your active subscriptions.",
          suggestions: ['Go to Dashboard', 'Contact support', 'Create ticket']
        };
      }
    }

    // Product/pricing queries
    if (/product|price|cost|plan|netflix|prime|hotstar|disney/.test(lowerMessage)) {
      try {
        const products = await Product.find({ status: 'active' })
          .select('name ottType profileTypes')
          .limit(5)
          .lean()
          .catch(() => []);
        
        if (!products || products.length === 0) {
          return {
            type: 'info',
            message: "🎯 Browse our OTT subscription catalog!\n\nWe offer premium subscriptions for Netflix, Prime Video, Disney+ Hotstar, and more at unbeatable prices.\n\nVisit our shop to see all available plans and pricing!",
            suggestions: ['Go to Shop', 'Contact support', 'Create ticket']
          };
        }

        let response = `🎯 Popular OTT Subscriptions:\n\n`;
        let productCount = 0;
        
        products.forEach((product, idx) => {
          try {
            // Get minimum price from all profile types
            let minPrice = null;
            if (product.profileTypes && Array.isArray(product.profileTypes) && product.profileTypes.length > 0) {
              product.profileTypes.forEach(profile => {
                if (profile && profile.pricingOptions && Array.isArray(profile.pricingOptions) && profile.pricingOptions.length > 0) {
                  profile.pricingOptions.forEach(pricing => {
                    if (pricing && pricing.price && (minPrice === null || pricing.price < minPrice)) {
                      minPrice = pricing.price;
                    }
                  });
                }
              });
            }
            
            if (minPrice !== null && product.name && product.ottType) {
              productCount++;
              response += `${productCount}. ${product.name} (${product.ottType})\n`;
              response += `   Starting from ₹${minPrice}\n\n`;
            }
          } catch (err) {
            console.error('Error processing product:', product?.name || 'unknown', err);
          }
        });
        
        if (productCount === 0) {
          response = `🎯 Browse our OTT subscription catalog!\n\nWe offer premium subscriptions at unbeatable prices.\n\n`;
        }
        response += `Visit our shop to see all available plans!`;

        return {
          type: 'product_info',
          message: response,
          suggestions: ['Go to Shop', 'View pricing', 'Contact support']
        };
      } catch (error) {
        console.error('Error fetching products:', error);
        return {
          type: 'info',
          message: "I can help you find the perfect OTT subscription! Please visit our Shop to browse all available products and pricing.",
          suggestions: ['Go to Shop', 'Contact support', 'Create ticket']
        };
      }
    }

  // Account/login issues
  if (/account|login|password|reset|forgot|access/.test(lowerMessage)) {
    return {
      type: 'account_help',
      message: "🔐 Account & Login Help:\n\n• Forgot password? Use the 'Forgot Password' link on the login page\n• Can't access account? Try resetting your password\n• Need to update profile? Go to Profile settings\n• Still having issues? I can create a support ticket for you",
      suggestions: ['Reset password', 'Contact support', 'Create ticket']
    };
  }

  // Payment/billing queries
  if (/payment|pay|bill|refund|charge/.test(lowerMessage)) {
    return {
      type: 'billing_help',
      message: "💳 Payment & Billing Help:\n\n• We accept Khalti and Bank Transfer\n• Upload payment receipt after making payment\n• Refunds processed within 5-7 business days\n• For billing disputes, please create a support ticket\n\nNeed immediate assistance?",
      suggestions: ['View payment methods', 'Create billing ticket', 'Contact support']
    };
  }

  // Technical support
  if (/not working|error|problem|issue|bug|broken|help/.test(lowerMessage)) {
    return {
      type: 'technical_help',
      message: "🔧 Technical Support:\n\nI can help you with:\n• Account activation issues\n• Subscription not working\n• Login problems\n• App/website errors\n\nFor detailed technical support, I recommend creating a support ticket so our team can assist you properly.",
      suggestions: ['Create technical ticket', 'View FAQs', 'Contact support']
    };
  }

  // Ticket creation intent
  if (/ticket|support|help me|assist|talk to human|agent/.test(lowerMessage)) {
    return {
      type: 'ticket_prompt',
      message: "📝 I can create a support ticket for you to get personalized help from our team.\n\nPlease choose a category:",
      suggestions: ['Technical Issue', 'Billing Question', 'Account Problem', 'Subscription Help', 'Other']
    };
  }

  // FAQ/general info
  if (/faq|question|how|what|when|why/.test(lowerMessage)) {
    return {
      type: 'general_help',
      message: "ℹ️ I'm here to help! Here are some common topics:\n\n• Order tracking and status\n• Subscription management\n• Account and login issues\n• Payment and billing\n• Technical support\n\nWhat would you like to know more about?",
      suggestions: ['My orders', 'My subscriptions', 'Payment info', 'Create ticket']
    };
  }

    // Default response
    return {
      type: 'default',
      message: "I'm here to help! I can assist you with:\n\n• 📦 Order status and tracking\n• 🎬 Subscription information\n• 💳 Payment and billing\n• 🔧 Technical support\n• 📝 Creating support tickets\n\nWhat would you like help with?",
      suggestions: ['Check orders', 'View subscriptions', 'Browse products', 'Create ticket']
    };
  } catch (error) {
    console.error('Error in generateResponse:', error);
    // Return safe default response on any error
    return {
      type: 'default',
      message: "I'm here to help! I can assist you with:\n\n• 📦 Order status and tracking\n• 🎬 Subscription information\n• 💳 Payment and billing\n• 🔧 Technical support\n• 📝 Creating support tickets\n\nWhat would you like help with?",
      suggestions: ['Browse products', 'Contact support', 'Create ticket']
    };
  }
};

// Chat endpoint
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await generateResponse(message, userId);

    res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again or create a support ticket.',
      response: {
        type: 'error',
        message: 'Sorry, I encountered an error. Please try again or create a support ticket.',
        suggestions: ['Create ticket', 'Contact support']
      }
    });
  }
};

// Create ticket from chatbot
export const createTicketFromChat = async (req, res) => {
  try {
    const { category, subject, message, chatHistory } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Map chatbot categories to ticket categories
    const categoryMap = {
      'Technical Issue': 'technical',
      'Billing Question': 'billing',
      'Account Problem': 'account',
      'Subscription Help': 'subscription',
      'Other': 'other'
    };

    const ticketCategory = categoryMap[category] || 'other';

    // Include chat history in the ticket message
    let fullMessage = message;
    if (chatHistory && chatHistory.length > 0) {
      fullMessage += '\n\n--- Chat History ---\n';
      chatHistory.forEach(msg => {
        fullMessage += `${msg.sender}: ${msg.message}\n`;
      });
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      category: ticketCategory,
      priority: 'medium',
      messages: [{
        sender: req.user._id,
        senderRole: 'customer',
        message: fullMessage
      }]
    });

    await ticket.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully! Our team will respond soon.',
      ticket: {
        ticketNumber: ticket.ticketNumber,
        _id: ticket._id,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status
      }
    });
  } catch (error) {
    console.error('Error creating ticket from chat:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get chatbot suggestions based on user context
export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(200).json({
        success: true,
        suggestions: [
          { text: 'Browse products', action: 'products' },
          { text: 'Payment methods', action: 'payment' },
          { text: 'Need help', action: 'help' }
        ]
      });
    }
    
    // Get user's recent activity to provide contextual suggestions
    const [orders, subscriptions, tickets] = await Promise.all([
      Order.countDocuments({ user: userId }).catch(() => 0),
      Subscription.countDocuments({ user: userId, status: 'active' }).catch(() => 0),
      Ticket.countDocuments({ user: userId, status: { $in: ['open', 'in-progress'] } }).catch(() => 0)
    ]);

    const suggestions = [];

    if (orders > 0) {
      suggestions.push({ text: 'Check my orders', action: 'orders' });
    }
    if (subscriptions > 0) {
      suggestions.push({ text: 'View my subscriptions', action: 'subscriptions' });
    }
    if (tickets > 0) {
      suggestions.push({ text: 'My support tickets', action: 'tickets' });
    }
    
    suggestions.push(
      { text: 'Browse products', action: 'products' },
      { text: 'Payment methods', action: 'payment' },
      { text: 'Need help', action: 'help' }
    );

    res.status(200).json({
      success: true,
      suggestions: suggestions.slice(0, 6)
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    // Return default suggestions even on error
    res.status(200).json({
      success: true,
      suggestions: [
        { text: 'Browse products', action: 'products' },
        { text: 'Payment methods', action: 'payment' },
        { text: 'Need help', action: 'help' }
      ]
    });
  }
};
