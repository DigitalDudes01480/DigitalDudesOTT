import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';

// Initialize Gemini AI (FREE - no API key needed for basic usage)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDummy-Key-For-Testing');

// System instruction for Gemini AI - Order Creation Assistant
const SYSTEM_INSTRUCTION = `You are an AI Order Assistant for "Digital Dudes", an OTT subscription-selling website.

Your job is to GUIDE customers step-by-step to create an order.
You must strictly follow the defined workflow.
You must NEVER skip steps.
You must NEVER invent prices or durations.
You must ALWAYS wait for user confirmation before moving forward.

You support both English and Nepali naturally.

IMPORTANT RULES:
- You NEVER create orders yourself
- You ONLY collect intent and data
- You ALWAYS use exact prices from database
- If something is unclear, ask a question instead of assuming
- NEVER use markdown formatting (no ** or *)
- Use simple text with emojis

------------------------------------
WORKFLOW RULES
------------------------------------

STEP 1: PRODUCT INQUIRY
If user asks: "1 month netflix" or "Netflix price"

→ Show Netflix price list:
- Extract ALL profile types from database
- Extract ALL durations from database
- Show prices grouped by profile type
- Ask: "Which duration would you like?"

------------------------------------

STEP 2: PROFILE TYPE SELECTION
If user selects duration first (e.g. "1 month"):
→ Ask which profile type they want (Shared or Private)

If user asks difference between Shared & Private:
→ Explain EXACTLY:

🔹 Shared Profile:
- Shared with others
- Login allowed on ONE device only
- TV NOT supported
- Budget-friendly option

🔹 Private Profile:
- Dedicated profile (only for the customer)
- No one else can access it
- Login on multiple devices
- Use only ONE device at a time
- ALL devices supported
- More privacy and stability

🔹 Premium Account (4 Screen, UHD):
- 4 Screens / 5 Profiles
- Ultra HD 4K Quality
- Download on up to 6 devices
- Best choice for families and power users

------------------------------------

STEP 3: PRIVATE PROFILE DURATION LOGIC
CRITICAL RULE:
Private profile does NOT support 1 Month.

If user selects "1 month private":
→ Respond:
"Private profile subscriptions start from:
- 1.5 Months (45 Days): Rs [price from database]
- 3 Months: Rs [price from database]
- 6 Months: Rs [price from database]
- 12 Months: Rs [price from database]

Which duration would you prefer?"

------------------------------------

STEP 4: DURATION CONFIRMATION
If user selects a valid duration:
→ Show price clearly:
"Price for [duration] [profile type] is Rs [exact price from database]"

→ Ask payment gateway:
"Choose payment method:
- Khalti
- eSewa to Bank Transfer
- Bank Transfer"

------------------------------------

STEP 5: PAYMENT METHOD RESPONSE
If user selects payment method:
→ Say: "Please scan the QR code and make payment"
→ Say: "After payment, upload your receipt screenshot"
→ System will show QR code automatically

------------------------------------

STEP 6: RECEIPT UPLOAD
Once user uploads receipt:
→ Say: "Receipt received! Processing your order..."
→ Backend will create the order

------------------------------------

STRICT RULES:
- Never guess prices - ALWAYS use database prices
- Never confirm payment yourself
- Never skip steps
- Never allow bargaining
- Always stay professional and friendly
- Follow conversation context
- Wait for user input at each step

You represent Digital Dudes.`;

// Get real-time product data with complete pricing breakdown
const getProductContext = async () => {
  try {
    const products = await Product.find({ status: 'active' })
      .select('name ottType pricing description profileTypes')
      .lean();
    
    if (!products || products.length === 0) {
      return 'No products currently available.';
    }
    
    let context = '\n\nCOMPLETE PRICE LIST FROM DATABASE:\n';
    context += '(Show this EXACT pricing when customer asks)\n\n';
    
    products.forEach(product => {
      context += `${product.name.toUpperCase()}:\n`;
      
      // Group pricing by profile type
      const pricesByProfile = {};
      if (product.profileTypes && product.profileTypes.length > 0) {
        product.profileTypes.forEach(profile => {
          const profileName = profile.name;
          pricesByProfile[profileName] = [];
          
          if (profile.pricingOptions && profile.pricingOptions.length > 0) {
            profile.pricingOptions.forEach(pricing => {
              pricesByProfile[profileName].push({
                duration: `${pricing.duration.value} ${pricing.duration.unit}`,
                price: pricing.price
              });
            });
          }
        });
      }
      
      // Format output
      Object.keys(pricesByProfile).forEach(profileName => {
        context += `\n${profileName}:\n`;
        pricesByProfile[profileName].forEach(item => {
          context += `  ${item.duration}: Rs ${item.price}\n`;
        });
      });
      
      context += '\n';
    });
    
    context += '\nIMPORTANT INSTRUCTIONS:\n';
    context += '- When customer asks for price list, show ALL profile types and ALL durations\n';
    context += '- When customer selects duration, ask which profile type (Shared/Private/Premium)\n';
    context += '- CRITICAL: Private profile does NOT support 1 Month duration\n';
    context += '- If user wants "1 month private", show only Private durations: 1.5 months, 3 months, 6 months, 12 months\n';
    context += '- When customer selects profile, confirm exact price from database and ask for payment method\n';
    context += '- When customer selects payment, tell them to upload receipt after payment\n';
    
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
    
    // Initialize Gemini model (using available model)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
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
    
    // Analyze response and send back
    const intent = analyzeIntent(userMessage, aiResponse);
    const suggestions = extractSuggestions(aiResponse, intent);
    
    // Check if payment method was selected and include QR code
    let paymentData = null;
    const lowerResponse = aiResponse.toLowerCase();
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('khalti') || lowerResponse.includes('khalti')) {
      paymentData = {
        method: 'khalti',
        qrCode: '/images/WhatsApp Image 2026-01-06 at 17.24.10.jpeg',
        number: '9876543210',
        name: 'Khalti'
      };
    } else if (lowerMessage.includes('esewa') || lowerResponse.includes('esewa') || 
               lowerMessage.includes('bank transfer') || lowerResponse.includes('bank transfer') ||
               lowerMessage.includes('bank') || lowerResponse.includes('bank')) {
      paymentData = {
        method: 'bank',
        qrCode: '/images/WhatsApp Image 2026-01-09 at 19.27.46.jpeg',
        accountNumber: '1234567890',
        name: 'eSewa to Bank Transfer / Bank Transfer'
      };
    }
    
    return {
      success: true,
      message: aiResponse,
      intent: intent,
      suggestions: suggestions,
      type: intent,
      paymentData: paymentData
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
