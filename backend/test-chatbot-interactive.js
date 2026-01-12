import readline from 'readline';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chatbot/chat';

// Store conversation history
const conversationHistory = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🤖 Digital Dudes Order Assistant - Interactive Test\n');
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

    // Send to chatbot API
    const response = await axios.post(API_URL, {
      message: userMessage,
      conversationHistory: conversationHistory
    });

    const botResponse = response.data.response;
    
    // Add bot message to history
    conversationHistory.push({
      type: 'bot',
      message: botResponse.message
    });

    // Display bot response
    console.log('\n🤖 Bot:', botResponse.message);
    
    // Show suggestions if available
    if (botResponse.suggestions && botResponse.suggestions.length > 0) {
      console.log('\n💡 Suggestions:', botResponse.suggestions.join(' | '));
    }

    // Show payment data if available
    if (botResponse.paymentData) {
      console.log('\n💳 Payment Method:', botResponse.paymentData.method);
      console.log('📱 QR Code:', botResponse.paymentData.qrCode);
      if (botResponse.paymentData.number) {
        console.log('📞 Number:', botResponse.paymentData.number);
      }
    }

    // Show AI status
    if (response.data.aiEnabled && botResponse.aiPowered) {
      console.log('\n✨ AI-powered response');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
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
console.log('💬 Try these commands:');
console.log('   - "Netflix price list" (to start)');
console.log('   - "1 month private" (to test validation)');
console.log('   - "clear" (to reset conversation)');
console.log('   - "history" (to view conversation)');
console.log('   - "exit" (to quit)\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

askQuestion();
