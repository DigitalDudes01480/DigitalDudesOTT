import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';

// Initialize Gemini AI (FREE - no API key needed for basic usage)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDummy-Key-For-Testing');

// System instruction for Gemini AI
const SYSTEM_INSTRUCTION = `You are an intelligent customer support assistant for Digital Dudes, a premium OTT subscription platform in Nepal.

COMPANY INFORMATION:
- Digital Dudes provides Netflix, Prime Video, Disney+ Hotstar, Spotify, YouTube Premium subscriptions
- Affordable pricing with instant delivery (2-24 hours)
- Payment: Khalti, eSewa, Bank Transfer
- 100% genuine subscriptions with warranty
- 24/7 customer support

YOUR ROLE:
1. Answer queries about products, pricing, delivery, payments
2. Help customers place orders step-by-step
3. Track order status
4. Provide subscription information
5. Handle refund requests
6. Offer personalized product recommendations
7. Create support tickets when needed

PERSONALITY:
- Friendly, helpful, professional
- Use emojis appropriately (🎬 products, 💰 pricing, ✅ confirmations)
- Keep responses concise (under 150 words)
- Always offer next steps

IMPORTANT:
- Guide customers through complete purchase process
- Provide specific pricing when available
- Be helpful and never refuse assistance
- If unsure, offer to create support ticket
- Remember conversation context

RESPONSE FORMAT:
- Clear bullet points
- Include 2-4 relevant suggestions
- Professional yet friendly tone`;

// Get real-time product data
const getProductContext = async () => {
  try {
    const products = await Product.find({ status: 'active' })
      .select('name ottType pricing description')
      .lean();
    
    if (!products || products.length === 0) {
      return 'No products currently available.';
    }
    
    let context = '\n\nAVAILABLE PRODUCTS:\n';
    products.forEach(product => {
      context += `\n${product.name} (${product.ottType}):\n`;
      if (product.description) {
        context += `Description: ${product.description}\n`;
      }
      if (product.pricing && product.pricing.length > 0) {
        context += 'Pricing:\n';
        product.pricing.forEach(price => {
          context += `  - ${price.profileType}: ₹${price.price} for ${price.duration.value} ${price.duration.unit}\n`;
        });
      }
    });
    
    return context;
  } catch (error) {
    console.error('Error fetching product context:', error);
    return '';
  }
};

// Get user order context
const getUserOrderContext = async (userId) => {
  if (!userId) return '';
  
  try {
    const orders = await Order.find({ user: userId })
      .sort('-createdAt')
      .limit(3)
      .populate('orderItems.product', 'name')
      .lean();
    
    if (!orders || orders.length === 0) {
      return '\n\nUSER ORDER HISTORY: No previous orders.';
    }
    
    let context = '\n\nUSER ORDER HISTORY:\n';
    orders.forEach(order => {
      context += `Order #${order.orderNumber}: ${order.orderStatus}, ₹${order.totalAmount}\n`;
    });
    
    return context;
  } catch (error) {
    return '';
  }
};

// Get user subscription context
const getUserSubscriptionContext = async (userId) => {
  if (!userId) return '';
  
  try {
    const subscriptions = await Subscription.find({ 
      user: userId,
      status: 'active'
    })
      .populate('product', 'name')
      .lean();
    
    if (!subscriptions || subscriptions.length === 0) {
      return '\n\nUSER SUBSCRIPTIONS: No active subscriptions.';
    }
    
    let context = '\n\nUSER ACTIVE SUBSCRIPTIONS:\n';
    subscriptions.forEach(sub => {
      const daysLeft = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      context += `${sub.product?.name}: ${daysLeft} days remaining\n`;
    });
    
    return context;
  } catch (error) {
    return '';
  }
};

// Main AI chat function using Gemini
export const generateAIResponse = async (userMessage, userId = null, conversationHistory = []) => {
  try {
    // Get real-time context
    const productContext = await getProductContext();
    const orderContext = await getUserOrderContext(userId);
    const subscriptionContext = await getUserSubscriptionContext(userId);
    
    // Build conversation history for Gemini
    const chatHistory = conversationHistory.slice(-6).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.message }]
    }));
    
    // Initialize Gemini model (using latest available model)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION + productContext + orderContext + subscriptionContext
    });
    
    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });
    
    // Send message and get response
    const result = await chat.sendMessage(userMessage);
    const aiResponse = result.response.text();
    
    // Analyze intent and extract suggestions
    const intent = analyzeIntent(userMessage, aiResponse);
    const suggestions = extractSuggestions(aiResponse, intent);
    
    return {
      success: true,
      message: aiResponse,
      intent: intent,
      suggestions: suggestions,
      type: intent
    };
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    return {
      success: false,
      error: error.message,
      message: null
    };
  }
};

// Analyze intent from conversation
const analyzeIntent = (userMessage, aiResponse) => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (/order|purchase|buy|want to get|i want/.test(lowerMessage)) return 'purchase_intent';
  if (/price|cost|how much|rate/.test(lowerMessage)) return 'pricing';
  if (/track|status|where is|my order/.test(lowerMessage)) return 'order_status';
  if (/refund|cancel|return|money back/.test(lowerMessage)) return 'refund';
  if (/help|support|problem|issue|not working/.test(lowerMessage)) return 'support';
  if (/compare|difference|better|vs/.test(lowerMessage)) return 'comparison';
  if (/recommend|suggest|best|which/.test(lowerMessage)) return 'recommendation';
  if (/payment|pay|khalti|esewa|bank/.test(lowerMessage)) return 'payment';
  if (/delivery|when|how long/.test(lowerMessage)) return 'delivery';
  
  return 'general';
};

// Extract smart suggestions
const extractSuggestions = (aiResponse, intent) => {
  const suggestions = [];
  
  switch (intent) {
    case 'purchase_intent':
      suggestions.push('Proceed with payment', 'View pricing', 'Compare products');
      break;
    case 'pricing':
      suggestions.push('Place order', 'View all products', 'Get recommendation');
      break;
    case 'order_status':
      suggestions.push('Check my orders', 'Contact support', 'Create ticket');
      break;
    case 'payment':
      suggestions.push('Khalti', 'eSewa', 'Bank Transfer');
      break;
    case 'recommendation':
      suggestions.push('Get Netflix', 'Get Disney+ Hotstar', 'View pricing');
      break;
    case 'comparison':
      suggestions.push('Netflix', 'Prime Video', 'Disney+ Hotstar', 'View all');
      break;
    default:
      suggestions.push('Browse products', 'Check pricing', 'Contact support', 'Create ticket');
  }
  
  return suggestions.slice(0, 4);
};

// Check if AI is available
export const isAIAvailable = () => {
  return true; // Gemini works without API key for testing
};

export default {
  generateAIResponse,
  isAIAvailable
};
