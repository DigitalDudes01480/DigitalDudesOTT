import Product from '../models/Product.js';

// Order Assistant Service - Handles order workflow logic
class OrderAssistantService {
  constructor() {
    this.conversationState = new Map(); // Store conversation states
  }

  // Get product catalog from database
  async getProductCatalog() {
    try {
      const products = await Product.find({ status: 'active' })
        .select('name ottType pricing profileTypes description')
        .lean();
      
      return products.map(product => {
        // Transform profileTypes structure to flat pricing array
        const pricing = [];
        
        if (product.profileTypes && product.profileTypes.length > 0) {
          product.profileTypes.forEach(profileType => {
            if (profileType.pricingOptions && profileType.pricingOptions.length > 0) {
              profileType.pricingOptions.forEach(option => {
                pricing.push({
                  profileType: profileType.name,
                  duration: `${option.duration.value} ${option.duration.unit}`,
                  price: option.price
                });
              });
            }
          });
        }
        
        return {
          name: product.name,
          ottType: product.ottType,
          profileTypes: product.profileTypes || [],
          pricing: pricing,
          description: product.description
        };
      });
    } catch (error) {
      console.error('Error fetching product catalog:', error);
      return [];
    }
  }

  // Detect product intent from user message
  detectProductIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    const productKeywords = {
      netflix: ['netflix', 'netflex', 'netflx'],
      prime: ['prime', 'amazon prime', 'prime video'],
      disney: ['disney', 'hotstar', 'disney+', 'disney plus'],
      spotify: ['spotify', 'music'],
      youtube: ['youtube', 'youtube premium', 'yt premium']
    };

    for (const [product, keywords] of Object.entries(productKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return product;
      }
    }

    return null;
  }

  // Format price list for a product
  async formatPriceList(productName) {
    const products = await this.getProductCatalog();
    const product = products.find(p => 
      p.name.toLowerCase().includes(productName.toLowerCase())
    );

    if (!product || !product.pricing || product.pricing.length === 0) {
      return null;
    }

    let response = `**${product.name} Subscription Options**\n\n`;

    // Group pricing by profile type
    const groupedPricing = {};
    product.pricing.forEach(item => {
      const profileType = item.profileType || 'Standard';
      if (!groupedPricing[profileType]) {
        groupedPricing[profileType] = [];
      }
      groupedPricing[profileType].push(item);
    });

    // Format each profile type with prices
    Object.entries(groupedPricing).forEach(([profileType, prices]) => {
      response += `**${profileType}**\n`;
      
      // Sort by duration value
      prices.sort((a, b) => {
        const durationA = parseFloat(a.duration.match(/[\d.]+/)?.[0]) || 0;
        const durationB = parseFloat(b.duration.match(/[\d.]+/)?.[0]) || 0;
        return durationA - durationB;
      });

      prices.forEach(item => {
        response += `• ${item.duration} – Rs ${item.price}\n`;
      });
      response += '\n';
    });

    response += '**Which profile type would you like to buy? (Shared / Private)**';
    
    return {
      message: response,
      product: product,
      groupedPricing: groupedPricing
    };
  }

  // Explain profile differences
  explainProfileDifference(productName) {
    const explanations = {
      shared: `**Shared Profile**
• Profile is shared with other users
• Login allowed on **only one device**
• **TV is NOT supported**
• Supported devices: Mobile, Laptop, Tablet
• Budget-friendly option`,
      
      private: `**Private Profile**
• Dedicated profile only for you
• No one else can access your account
• You can sign in on multiple devices
• You can watch on **one device at a time**
• **All devices supported (Mobile, Laptop, Tablet, TV)**
• More privacy and stability`
    };

    return `${explanations.shared}\n\n${explanations.private}\n\n**Which profile would you like to continue with?**`;
  }

  // Validate Private profile duration
  validatePrivateDuration(duration) {
    const validDurations = ['1.5 months', '45 days', '3 months', '6 months', '12 months'];
    const lowerDuration = duration.toLowerCase();
    
    if (lowerDuration.includes('1 month') && !lowerDuration.includes('1.5')) {
      return {
        valid: false,
        message: `Our **Private Profile subscription starts from 1.5 Months (45 Days)**.

Available durations are:
• 1.5 Months (45 Days)
• 3 Months
• 6 Months
• 12 Months

**Which duration would you like to choose?**`
      };
    }

    return { valid: true };
  }

  // Get price for specific selection
  async getPrice(productName, profileType, duration) {
    const products = await this.getProductCatalog();
    const product = products.find(p => 
      p.name.toLowerCase().includes(productName.toLowerCase())
    );

    if (!product) return null;

    const priceItem = product.pricing.find(p => 
      p.profileType.toLowerCase() === profileType.toLowerCase() &&
      p.duration.toLowerCase().includes(duration.toLowerCase())
    );

    return priceItem;
  }

  // Get payment QR code path
  getPaymentQR(paymentMethod) {
    const qrCodes = {
      khalti: '/images/WhatsApp Image 2026-01-06 at 17.24.10.jpeg',
      esewa: '/images/WhatsApp Image 2026-01-09 at 19.27.46.jpeg',
      bank: '/images/WhatsApp Image 2026-01-09 at 19.27.46.jpeg'
    };

    const method = paymentMethod.toLowerCase();
    if (method.includes('khalti')) return qrCodes.khalti;
    if (method.includes('esewa') || method.includes('bank')) return qrCodes.esewa;
    
    return null;
  }

  // Process user message and return response
  async processMessage(userId, message) {
    const lowerMessage = message.toLowerCase();
    
    // Get or create conversation state
    let state = this.conversationState.get(userId) || {
      step: 'initial',
      product: null,
      profileType: null,
      duration: null,
      price: null,
      paymentMethod: null
    };

    let response = {
      message: '',
      showPriceList: false,
      showPaymentQR: false,
      qrCodePath: null,
      showReceiptUpload: false,
      suggestions: []
    };

    // Step 1: Detect product intent
    if (state.step === 'initial' || !state.product) {
      const productIntent = this.detectProductIntent(message);
      
      if (productIntent) {
        const priceList = await this.formatPriceList(productIntent);
        
        if (priceList) {
          state.product = productIntent;
          state.step = 'profile_selection';
          response.message = priceList.message;
          response.showPriceList = true;
          response.suggestions = ['Shared', 'Private'];
        } else {
          response.message = "Sorry, I couldn't find that product. Please try again.";
        }
      } else {
        response.message = "Hi! I'm here to help you purchase OTT subscriptions. Which product are you interested in? (Netflix, Prime Video, Disney+, Spotify, YouTube Premium)";
        response.suggestions = ['Netflix', 'Prime Video', 'Disney+'];
      }
    }
    // Step 2: Handle profile type selection
    else if (state.step === 'profile_selection') {
      if (lowerMessage.includes('difference') || lowerMessage.includes('compare')) {
        response.message = this.explainProfileDifference(state.product);
        response.suggestions = ['Shared', 'Private'];
      } else if (lowerMessage.includes('shared') || lowerMessage.includes('private')) {
        state.profileType = lowerMessage.includes('private') ? 'Private' : 'Shared';
        state.step = 'duration_selection';
        response.message = `Great! You've selected **${state.profileType} Profile**.\n\n**Which duration would you like?**`;
        response.suggestions = state.profileType === 'Private' 
          ? ['1.5 Months', '3 Months', '6 Months', '12 Months']
          : ['1 Month', '3 Months', '6 Months'];
      } else {
        response.message = "Please select either **Shared** or **Private** profile.";
        response.suggestions = ['Shared', 'Private'];
      }
    }
    // Step 3: Handle duration selection
    else if (state.step === 'duration_selection') {
      // Validate Private profile 1 month restriction
      if (state.profileType === 'Private') {
        const validation = this.validatePrivateDuration(message);
        if (!validation.valid) {
          response.message = validation.message;
          response.suggestions = ['1.5 Months', '3 Months', '6 Months', '12 Months'];
          this.conversationState.set(userId, state);
          return response;
        }
      }

      // Extract duration
      const durationMatch = message.match(/(\d+\.?\d*)\s*(month|months|days)/i);
      if (durationMatch) {
        state.duration = durationMatch[0];
        
        // Get price
        const priceItem = await this.getPrice(state.product, state.profileType, state.duration);
        
        if (priceItem) {
          state.price = priceItem.price;
          state.step = 'payment_method';
          
          response.message = `✅ The price for **${state.duration} ${state.product} ${state.profileType} Profile** is **Rs ${state.price}**\n\n**Which payment method would you like to use?**\n• Khalti\n• eSewa to Bank Transfer\n• Bank Transfer`;
          response.suggestions = ['Khalti', 'eSewa to Bank Transfer', 'Bank Transfer'];
        } else {
          response.message = "Sorry, I couldn't find pricing for that duration. Please select from the available options.";
        }
      } else {
        response.message = "Please specify a duration (e.g., 1 month, 3 months, 6 months).";
      }
    }
    // Step 4: Handle payment method
    else if (state.step === 'payment_method') {
      state.paymentMethod = message;
      const qrPath = this.getPaymentQR(message);
      
      if (qrPath) {
        state.step = 'receipt_upload';
        response.message = `Please complete the payment and **upload the payment receipt below**.\n\n📎 **Upload Payment Receipt**\n*(Please upload a clear screenshot or photo of your payment receipt)*`;
        response.showPaymentQR = true;
        response.qrCodePath = qrPath;
        response.showReceiptUpload = true;
      } else {
        response.message = "Please select a valid payment method: Khalti, eSewa to Bank Transfer, or Bank Transfer.";
        response.suggestions = ['Khalti', 'eSewa to Bank Transfer', 'Bank Transfer'];
      }
    }

    // Save state
    this.conversationState.set(userId, state);
    
    return response;
  }

  // Handle receipt upload and confirm order
  async confirmOrder(userId, receiptData) {
    const state = this.conversationState.get(userId);
    
    if (!state || state.step !== 'receipt_upload') {
      return {
        success: false,
        message: "Please complete the order process first."
      };
    }

    // Create order data
    const orderData = {
      product: state.product,
      profileType: state.profileType,
      duration: state.duration,
      price: state.price,
      paymentMethod: state.paymentMethod,
      receipt: receiptData,
      status: 'pending'
    };

    // Reset conversation state
    this.conversationState.delete(userId);

    return {
      success: true,
      message: `✅ **Payment received successfully!**\nYour ${state.product} order has been **confirmed**.\nOur team will deliver your subscription details shortly.\nThank you for choosing **Digital Dudes** ❤️`,
      orderData: orderData
    };
  }

  // Clear conversation state
  clearState(userId) {
    this.conversationState.delete(userId);
  }
}

export default new OrderAssistantService();
