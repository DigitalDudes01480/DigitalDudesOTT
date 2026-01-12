import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('Testing Google Gemini AI...');
console.log('API Key present:', !!apiKey);
console.log('API Key starts with:', apiKey?.substring(0, 10));

const genAI = new GoogleGenerativeAI(apiKey);

async function testAI() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = "Say hello in one sentence";
    
    console.log('\nSending test message to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('\n✅ AI Response:', response);
    console.log('\n✅ Gemini AI is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('The API key is invalid. Please check it in Google AI Studio.');
    }
  }
}

testAI();
