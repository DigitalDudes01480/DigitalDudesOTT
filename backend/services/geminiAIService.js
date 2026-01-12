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
1. Show COMPLETE price lists from database when asked
2. Guide customers through COMPLETE order placement
3. Explain differences between plan types (Shared, Private, Premium)
4. Handle payment method selection
5. Guide receipt upload process
6. Confirm order completion

PLAN TYPE EXPLANATIONS (Use these exact descriptions):

NETFLIX PLANS:
🔹 Shared Profile
- Login allowed on only one device
- Supported devices: Laptop, Mobile, Tablet
- Budget-friendly option for single-device use

🔹 Private Profile
- Login on your personal device only
- Strictly one device at a time
- Sharing ID/Password is not allowed
- More privacy and better stability

🔹 Premium Account (4 Screen, UHD)
- 4 Screens / 5 Profiles
- Ultra HD 4K Quality
- Download on up to 6 devices
- Best choice for families and power users

DISNEY+ PLANS:
🔹 Shared Profile
- Login allowed on only one device
- Supported devices: Laptop, Mobile, Tablet
- Budget-friendly option

🔹 Private Profile
- Login on your personal device only
- One device at a time
- More privacy and stability

COMPLETE ORDER FLOW (Follow this exactly):

STEP 1 - Price List Request:
When customer asks for prices (e.g., "Netflix price list"):
- Show ALL profile types (Shared, Private, Premium)
- Show ALL durations (1 month, 3 months, 6 months, 12 months)
- Show exact prices from database
- Ask: "Which duration would you like?"

STEP 2 - Duration Selection:
When customer says duration (e.g., "1 month"):
- Ask: "Would you like Shared or Private profile?"
- If they ask difference, explain using the descriptions above

STEP 3 - Plan Type Selection:
When customer chooses plan type (e.g., "Shared is ok"):
- Confirm: "Netflix Shared profile for 1 month is Rs 299"
- Show payment options: "Choose payment method: Khalti, eSewa, or Bank Transfer"

STEP 4 - Payment Method:
When customer chooses payment (e.g., "Khalti"):
- Say: "Please scan the QR code and make payment"
- Tell them: "After payment, upload your receipt screenshot"
- System will show QR code automatically

STEP 5 - Receipt Upload:
When customer uploads receipt:
- Confirm: "Order placed successfully!"
- Say: "You will receive your subscription details within 2-24 hours"

IMPORTANT RULES:
- ALWAYS show complete price list with ALL durations when asked
- Use exact prices from database context
- Follow the order flow step by step
- DO NOT skip steps
- DO NOT use markdown formatting (no ** or *)
- Use emojis for clarity
- Keep responses clear and concise
- Remember conversation context

RESPONSE FORMAT:
- Plain text with emojis
- Clear line breaks
- NO asterisks for formatting
- Guide to next step in every response`;

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
    context += '- When customer selects profile, confirm price and ask for payment method\n';
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
        number: '9876543210'
      };
    } else if (lowerMessage.includes('esewa') || lowerResponse.includes('esewa')) {
      paymentData = {
        method: 'esewa',
        qrCode: '/images/esewa-qr.png',
        number: '9876543210'
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
