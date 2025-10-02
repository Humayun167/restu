// Simple test to verify Gemini API integration
import { GoogleGenerativeAI } from '@google/generative-ai';

const testGeminiAPI = async () => {
  try {
    console.log('🧪 Testing Gemini API...');
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('API Key present:', !!apiKey);
    console.log('API Key starts with:', apiKey?.substring(0, 10) + '...');
    
    if (!apiKey) {
      throw new Error('API key not found');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = 'Hello! Just say "API Working" to confirm the connection.';
    
    console.log('🔄 Sending test prompt...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API Response:', text);
    return { success: true, response: text };
    
  } catch (error) {
    console.error('❌ Gemini API Test Failed:', error);
    return { success: false, error: error.message };
  }
};

export { testGeminiAPI };