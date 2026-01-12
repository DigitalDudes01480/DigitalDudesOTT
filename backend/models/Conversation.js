import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    intent: String,
    aiPowered: Boolean,
    suggestions: [String]
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  context: {
    lastIntent: String,
    lastProduct: {
      productId: mongoose.Schema.Types.ObjectId,
      productName: String,
      profileType: String
    },
    orderInProgress: Boolean,
    paymentMethod: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ user: 1, isActive: 1, lastActivity: -1 });
conversationSchema.index({ sessionId: 1, isActive: 1 });

// Auto-update lastActivity on message addition
conversationSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Method to add a message
conversationSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    metadata
  });
  this.lastActivity = new Date();
};

// Method to get recent messages
conversationSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Static method to get or create conversation
conversationSchema.statics.getOrCreateConversation = async function(userId, sessionId) {
  let conversation = await this.findOne({
    user: userId,
    sessionId: sessionId,
    isActive: true
  });

  if (!conversation) {
    conversation = await this.create({
      user: userId,
      sessionId: sessionId,
      messages: [],
      context: {}
    });
  }

  return conversation;
};

// Static method to get conversation history
conversationSchema.statics.getHistory = async function(userId, limit = 5) {
  return this.find({ user: userId, isActive: true })
    .sort('-lastActivity')
    .limit(limit)
    .select('messages context lastActivity')
    .lean();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
