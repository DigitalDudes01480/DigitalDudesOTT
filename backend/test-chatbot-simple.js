import readline from 'readline';
import { generateAIResponse } from './services/geminiAIService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB\n');

// Store conversation history
const conversationHistory = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Digital Dudes Order Assistant - Interactive Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Type your messages to test the chatbot workflow.');
console.log('Type "exit" or "quit" to end the session.\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function sendMessage(userMessage) {
  try {
    // Add user message to history
    conversationHistory.push({
      type: 'user',
      message: userMessage
    });

    // Call AI service directly
    const aiResult = await generateAIResponse(userMessage, null, conversationHistory);

    if (!aiResult.success) {
      console.log('\n❌ AI Error:', aiResult.error);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    // Add bot message to history
    conversationHistory.push({
      type: 'bot',
      message: aiResult.message
    });

    // Display bot response
    console.log('\n🤖 Bot:', aiResult.message);
    
    // Show suggestions if available
    if (aiResult.suggestions && aiResult.suggestions.length > 0) {
      console.log('\n💡 Suggestions:', aiResult.suggestions.join(' | '));
    }

    // Show payment data if available
    if (aiResult.paymentData) {
      console.log('\n💳 Payment Method:', aiResult.paymentData.method);
      console.log('📱 QR Code:', aiResult.paymentData.qrCode);
      if (aiResult.paymentData.number) {
        console.log('📞 Number:', aiResult.paymentData.number);
      }
      if (aiResult.paymentData.name) {
        console.log('🏦 Name:', aiResult.paymentData.name);
      }
    }

    console.log('\n✨ AI-powered response');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

function askQuestion() {
  rl.question('👤 You: ', async (answer) => {
    const input = answer.trim();

    if (!input) {
      askQuestion();
      return;
    }

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('\n👋 Thanks for testing! Goodbye.\n');
      await mongoose.disconnect();
      rl.close();
      process.exit(0);
      return;
    }

    if (input.toLowerCase() === 'clear') {
      conversationHistory.length = 0;
      console.log('\n🗑️  Conversation history cleared.\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      askQuestion();
      return;
    }

    if (input.toLowerCase() === 'history') {
      console.log('\n📜 Conversation History:');
      conversationHistory.forEach((msg, idx) => {
        console.log(`${idx + 1}. [${msg.type}]: ${msg.message.substring(0, 100)}...`);
      });
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      askQuestion();
      return;
    }

    await sendMessage(input);
    askQuestion();
  });
}

// Start the conversation
console.log('💬 Try these test scenarios:');
console.log('   - "Netflix price list" (to start)');
console.log('   - "1 month" (after price list)');
console.log('   - "What is the difference between shared and private?"');
console.log('   - "1 month private" (to test validation)');
console.log('   - "Shared" (to select profile)');
console.log('   - "Khalti" (to select payment)');
console.log('   - "clear" (to reset conversation)');
console.log('   - "history" (to view conversation)');
console.log('   - "exit" (to quit)\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

askQuestion();
