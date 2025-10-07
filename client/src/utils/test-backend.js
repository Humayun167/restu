// Quick test script for your backend
console.log('Testing backend: https://restu-bknd.vercel.app');

async function testBackend() {
    const baseUrl = 'https://restu-bknd.vercel.app';
    
    console.log('1. Testing health endpoint...');
    try {
        const healthResponse = await fetch(`${baseUrl}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }

    console.log('2. Testing admin login...');
    try {
        const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                email: 'admin@restaurant.com',
                password: 'admin123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('✅ Admin login test:', loginData);
        
        if (loginData.success) {
            console.log('3. Testing admin auth...');
            const authResponse = await fetch(`${baseUrl}/api/admin/is-auth`, {
                credentials: 'include'
            });
            const authData = await authResponse.json();
            console.log('✅ Admin auth test:', authData);
        }
    } catch (error) {
        console.log('❌ Admin login failed:', error.message);
    }
}

// Run the test
testBackend();