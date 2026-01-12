import Ticket from '../models/Ticket.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

// Payment QR codes and details
const PAYMENT_DETAILS = {
  khalti: {
    name: 'Khalti',
    number: '9876543210',
    qrCode: 'https://i.imgur.com/khalti-qr.png' // Replace with actual QR code URL
  },
  esewa: {
    name: 'eSewa',
    number: '9876543210',
    qrCode: 'https://i.imgur.com/esewa-qr.png' // Replace with actual QR code URL
  },
  bank: {
    name: 'Bank Transfer',
    bankName: 'Nepal Bank Limited',
    accountNumber: '1234567890',
    accountName: 'Digital Dudes',
    branch: 'Kathmandu'
  }
};

// Store conversation context (in production, use Redis or database)
const conversationContext = new Map();

// Get or initialize conversation context
const getContext = (userId) => {
  if (!conversationContext.has(userId)) {
    conversationContext.set(userId, {
      lastIntent: null,
      lastProduct: null,
      lastQuery: null,
      preferences: {},
      history: []
    });
  }
  return conversationContext.get(userId);
};

// Update conversation context
const updateContext = (userId, updates) => {
  const context = getContext(userId);
  Object.assign(context, updates);
  context.history.push({ timestamp: new Date(), ...updates });
  if (context.history.length > 10) context.history.shift();
};

// Intelligent chatbot response system with learning
const generateResponse = async (message, userId) => {
  try {
    const lowerMessage = message.toLowerCase().trim();
    const context = userId ? getContext(userId) : null;
    
    // Learn from message patterns
    if (context) {
      context.lastQuery = message;
    }
    
    // Greeting patterns
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowerMessage)) {
      const greeting = context?.history.length > 0 
        ? "Welcome back! 👋 How can I help you today?" 
        : "Hello! 👋 I'm your Digital Dudes support assistant. How can I help you today?";
      
      return {
        type: 'greeting',
        message: `${greeting}\n\nI can assist you with:\n• Order status and tracking\n• Subscription information\n• Account issues\n• Product inquiries\n• Technical support\n• Billing questions`,
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

    // Learn from previous interactions - user confirming interest
    if (context?.lastIntent === 'product_inquiry' && /yes|sure|ok|proceed|continue|interested/.test(lowerMessage)) {
      if (context.lastProduct) {
        updateContext(userId, { lastIntent: 'payment_selection' });
        return {
          type: 'payment_selection',
          message: `Great! Let's proceed with ${context.lastProduct.productName}.\n\nPlease select your payment method:`,
          suggestions: ['Khalti', 'eSewa', 'Bank Transfer'],
          data: context.lastProduct
        };
      }
    }

    // Check if user wants to buy/order a specific plan
    if (/i want|buy|purchase|order|get|interested|looking for|need/.test(lowerMessage) && /plan|subscription|netflix|prime|hotstar|disney|spotify|youtube/.test(lowerMessage)) {
      try {
        // Extract product name from message
        const products = await Product.find({ status: 'active' })
          .select('name ottType profileTypes')
          .lean()
          .catch(() => []);
        
        let matchedProduct = null;
        let matchedProfile = null;
        
        // Try to match product name
        for (const product of products) {
          if (lowerMessage.includes(product.name.toLowerCase()) || lowerMessage.includes(product.ottType.toLowerCase())) {
            matchedProduct = product;
            
            // Try to match profile type
            if (product.profileTypes && product.profileTypes.length > 0) {
              for (const profile of product.profileTypes) {
                if (lowerMessage.includes(profile.name.toLowerCase()) || 
                    lowerMessage.includes('shared') && profile.name.toLowerCase().includes('shared') ||
                    lowerMessage.includes('private') && profile.name.toLowerCase().includes('private') ||
                    lowerMessage.includes('premium') && profile.name.toLowerCase().includes('premium')) {
                  matchedProfile = profile;
                  break;
                }
              }
            }
            break;
          }
        }
        
        if (matchedProduct && matchedProfile) {
          // Show pricing for matched plan
          let response = `🎯 ${matchedProduct.name} - ${matchedProfile.name}\n\n`;
          response += `📺 ${matchedProfile.description}\n`;
          
          if (matchedProfile.pricingOptions && matchedProfile.pricingOptions.length > 0) {
            matchedProfile.pricingOptions.forEach((pricing, idx) => {
              message += `${idx + 1}. ${pricing.duration.value} ${pricing.duration.unit} - ₹${pricing.price}\n`;
            });
          }
          
          message += `\n\nWould you like to proceed with this plan?`;

          // Save context for learning
          if (context) {
            updateContext(userId, {
              lastIntent: 'product_inquiry',
              lastProduct: {
                productId: matchedProduct._id,
                productName: matchedProduct.name,
                profileType: matchedProfile.name,
                pricing: matchedProfile.pricingOptions,
                paymentDetails: PAYMENT_DETAILS
              }
            });
          }

          return {
            type: 'product_details',
            message,
            suggestions: ['Proceed with payment', 'View other plans', 'Contact support'],
            data: {
              productId: matchedProduct._id,
              productName: matchedProduct.name,
              profileType: matchedProfile.name,
              pricing: matchedProfile.pricingOptions,
              paymentDetails: PAYMENT_DETAILS
            }
          };
        } else if (matchedProduct) {
          // Show all plans for the product
          let response = `🎯 ${matchedProduct.name} Plans:\n\n`;
          
          if (matchedProduct.profileTypes && matchedProduct.profileTypes.length > 0) {
            matchedProduct.profileTypes.forEach((profile, idx) => {
              response += `${idx + 1}. ${profile.name}\n`;
              response += `   ${profile.description}\n`;
              if (profile.pricingOptions && profile.pricingOptions.length > 0) {
                const minPrice = Math.min(...profile.pricingOptions.map(p => p.price));
                response += `   Starting from ₹${minPrice}\n\n`;
              }
            });
          }
          
          response += `Which plan would you like?`;
          
          return {
            type: 'product_plans',
            message: response,
            suggestions: matchedProduct.profileTypes.map(p => p.name),
            data: { productId: matchedProduct._id, productName: matchedProduct.name }
          };
        } else {
          return {
            type: 'info',
            message: "I'd love to help you order! Please specify which product you're interested in.\n\nWe offer:\n• Netflix\n• Prime Video\n• Disney+ Hotstar\n• And more!",
            suggestions: ['Show all products', 'Netflix plans', 'Prime plans']
          };
        }
      } catch (error) {
        console.error('Error processing order request:', error);
        return {
          type: 'info',
          message: "I can help you place an order! Please visit our shop to browse products.",
          suggestions: ['Go to Shop', 'Contact support']
        };
      }
    }
    
    // Payment process initiation
    if (/payment|pay now|proceed|khalti|esewa|bank/.test(lowerMessage)) {
      return {
        type: 'payment_instructions',
        message: `💳 Payment Methods:\n\nChoose your preferred payment method:\n\n1️⃣ Khalti - ${PAYMENT_DETAILS.khalti.number}\n2️⃣ eSewa - ${PAYMENT_DETAILS.esewa.number}\n3️⃣ Bank Transfer - ${PAYMENT_DETAILS.bank.bankName}\n\nSelect a method to see QR code and details!`,
        suggestions: ['Khalti', 'eSewa', 'Bank Transfer'],
        data: { paymentDetails: PAYMENT_DETAILS }
      };
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

  // Smart fallback with context awareness
  let fallbackMessage = "I'm here to help! ";
  
  // Provide contextual suggestions based on conversation history
  if (context?.lastIntent === 'product_inquiry') {
    fallbackMessage += "I noticed you were looking at our products. Would you like to:\n\n• Continue with your previous selection\n• Browse other products\n• Get pricing information\n• Speak with support";
    
    if (context) {
      updateContext(userId, { lastIntent: 'contextual_help' });
    }
    
    return {
      type: 'contextual_help',
      message: fallbackMessage,
      suggestions: ['Continue previous', 'Browse products', 'Get pricing', 'Contact support']
    };
  }
  
  if (context?.history.length > 0) {
    fallbackMessage += "Based on our conversation, I can help you with:\n\n";
  } else {
    fallbackMessage += "I can assist you with:\n\n";
  }
  
  fallbackMessage += "• 📦 Order status and tracking\n• 🎬 Subscription information\n• 💳 Payment and billing\n• 🔧 Technical support\n• 📝 Creating support tickets\n\nWhat would you like help with?";
  
  return {
    type: 'default',
    message: fallbackMessage,
    suggestions: ['Check my orders', 'View subscriptions', 'Browse products', 'Create support ticket']
  };
  
  } catch (error) {
    console.error('Error generating chatbot response:', error);
    return {
      type: 'error',
      message: "I'm having trouble processing your request. Please try again or create a support ticket for assistance.",
      suggestions: ['Try again', 'Create support ticket', 'Contact support']
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
