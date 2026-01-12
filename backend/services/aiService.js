import OpenAI from 'openai';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// System prompt for the AI chatbot
const SYSTEM_PROMPT = `You are an intelligent customer support assistant for Digital Dudes, a premium OTT subscription platform.

COMPANY INFORMATION:
- Digital Dudes provides Netflix, Prime Video, Disney+ Hotstar, Spotify, YouTube Premium subscriptions
- We offer affordable pricing with instant delivery (2-24 hours)
- Payment methods: Khalti, eSewa, Bank Transfer
- 100% genuine subscriptions with warranty
- 24/7 customer support

YOUR CAPABILITIES:
1. Answer customer queries about products, pricing, delivery, payments
2. Help customers place orders
3. Track order status
4. Provide subscription information
5. Handle refund requests
6. Offer product recommendations
7. Create support tickets

PERSONALITY:
- Friendly, helpful, and professional
- Use emojis appropriately (🎬 for products, 💰 for pricing, ✅ for confirmations)
- Keep responses concise but informative
- Always offer next steps or suggestions

IMPORTANT RULES:
- If customer wants to buy/order, guide them through the process
- For pricing, provide specific numbers if you have the data
- For order status, ask for order number if not logged in
- Always be helpful and never refuse assistance
- If you don't know something, offer to create a support ticket

RESPONSE FORMAT:
- Use clear formatting with bullet points
- Include relevant suggestions at the end
- Keep responses under 200 words unless detailed explanation needed`;

// Function to get real-time product data for AI context
const getProductContext = async () => {
  try {
    const products = await Product.find({ status: 'active' })
      .select('name ottType pricing description')
      .lean();
    
    if (!products || products.length === 0) {
      return 'No products currently available.';
    }
    
    let context = 'AVAILABLE PRODUCTS:\n';
    products.forEach(product => {
      context += `\n${product.name} (${product.ottType}):\n`;
      if (product.description) {
        context += `- Description: ${product.description}\n`;
      }
      if (product.pricing && product.pricing.length > 0) {
        context += '- Pricing:\n';
        product.pricing.forEach(price => {
          context += `  * ${price.profileType}: ₹${price.price} for ${price.duration.value} ${price.duration.unit}\n`;
        });
      }
    });
    
    return context;
  } catch (error) {
    console.error('Error fetching product context:', error);
    return 'Product information temporarily unavailable.';
  }
};

// Function to get user's order history for context
const getUserOrderContext = async (userId) => {
  if (!userId) return '';
  
  try {
    const orders = await Order.find({ user: userId })
      .sort('-createdAt')
      .limit(3)
      .populate('orderItems.product', 'name')
      .lean();
    
    if (!orders || orders.length === 0) {
      return '\nUSER ORDER HISTORY: No previous orders.';
    }
    
    let context = '\nUSER ORDER HISTORY:\n';
    orders.forEach(order => {
      context += `- Order #${order.orderNumber}: ${order.orderStatus}, ₹${order.totalAmount}\n`;
    });
    
    return context;
  } catch (error) {
    return '';
  }
};

// Function to get user's subscription info for context
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
      return '\nUSER SUBSCRIPTIONS: No active subscriptions.';
    }
    
    let context = '\nUSER ACTIVE SUBSCRIPTIONS:\n';
    subscriptions.forEach(sub => {
      const daysLeft = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      context += `- ${sub.product?.name}: ${daysLeft} days remaining\n`;
    });
    
    return context;
  } catch (error) {
    return '';
  }
};

// Main AI chat function
export const generateAIResponse = async (userMessage, userId = null, conversationHistory = []) => {
  try {
    // Get real-time context
    const productContext = await getProductContext();
    const orderContext = await getUserOrderContext(userId);
    const subscriptionContext = await getUserSubscriptionContext(userId);
    
    // Build full context
    const fullContext = `${SYSTEM_PROMPT}\n\n${productContext}${orderContext}${subscriptionContext}`;
    
    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: fullContext },
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.message
      })),
      { role: 'user', content: userMessage }
    ];
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Analyze response to determine intent and extract suggestions
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
    console.error('AI Service Error:', error);
    
    // Return error with fallback
    return {
      success: false,
      error: error.message,
      message: null
    };
  }
};

// Analyze intent from AI response
const analyzeIntent = (userMessage, aiResponse) => {
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();
  
  if (/order|purchase|buy|want to get/.test(lowerMessage)) return 'purchase_intent';
  if (/price|cost|how much/.test(lowerMessage)) return 'pricing';
  if (/track|status|where is/.test(lowerMessage)) return 'order_status';
  if (/refund|cancel|return/.test(lowerMessage)) return 'refund';
  if (/help|support|problem/.test(lowerMessage)) return 'support';
  if (/compare|difference|better/.test(lowerMessage)) return 'comparison';
  if (/recommend|suggest|best/.test(lowerMessage)) return 'recommendation';
  if (/payment|pay|khalti|esewa/.test(lowerMessage)) return 'payment';
  
  return 'general';
};

// Extract smart suggestions from AI response
const extractSuggestions = (aiResponse, intent) => {
  const suggestions = [];
  
  // Intent-based suggestions
  switch (intent) {
    case 'purchase_intent':
      suggestions.push('Proceed with payment', 'View pricing', 'Compare products');
      break;
    case 'pricing':
      suggestions.push('Place order', 'View all products', 'Contact support');
      break;
    case 'order_status':
      suggestions.push('Check my orders', 'Contact support', 'Create ticket');
      break;
    case 'payment':
      suggestions.push('Khalti', 'eSewa', 'Bank Transfer');
      break;
    case 'recommendation':
      suggestions.push('Get Netflix', 'Get Disney+ Hotstar', 'View all products');
      break;
    default:
      suggestions.push('Browse products', 'Check pricing', 'Contact support', 'Create ticket');
  }
  
  return suggestions.slice(0, 4);
};

// Check if AI service is available
export const isAIAvailable = () => {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-api-key-here';
};

export default {
  generateAIResponse,
  isAIAvailable
};
