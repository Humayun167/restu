// API Connection Test Script
// Run this in the browser console on your frontend to test API connectivity

const testAPI = async () => {
  const baseURL = 'http://localhost:4000';
  
  console.log('🚀 Testing API connectivity...');
  
  try {
    // Test 1: Basic server health check
    console.log('📡 Testing server health...');
    const healthResponse = await fetch(`${baseURL}/`);
    const healthText = await healthResponse.text();
    console.log('✅ Server health:', healthText);
    
    // Test 2: Test CORS by making a request from frontend
    console.log('🌐 Testing CORS configuration...');
    const corsResponse = await fetch(`${baseURL}/api/product/list`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (corsResponse.ok) {
      console.log('✅ CORS configuration working');
      const products = await corsResponse.json();
      console.log('📦 Products response:', products);
    } else {
      console.log('❌ CORS issue:', corsResponse.status, corsResponse.statusText);
    }
    
    // Test 3: Test authentication endpoint
    console.log('🔐 Testing auth endpoint...');
    const authResponse = await fetch(`${baseURL}/api/user/is-auth`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const authData = await authResponse.json();
    console.log('🔐 Auth response:', authData);
    
    console.log('✅ API connectivity test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    console.log('💡 Make sure your backend server is running on http://localhost:4000');
    return false;
  }
};

// For Node.js testing (run in terminal with: node test-api.js)
if (typeof window === 'undefined') {
  testAPI();
}

export default testAPI;