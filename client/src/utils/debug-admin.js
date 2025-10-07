// Debug script to test different server URLs
console.log('=== Admin Authentication Debug ===');
console.log('Current environment:', import.meta.env.MODE);
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('Client URL:', window.location.origin);

const possibleServerUrls = [
    'https://restu-server.vercel.app',
    'https://restu-api.vercel.app', 
    'https://restu-backend.vercel.app',
    'https://restu-alpha-server.vercel.app',
    // Add more possibilities based on your actual deployment
];

async function testServerUrl(url) {
    try {
        console.log(`Testing: ${url}`);
        const response = await fetch(`${url}/api/health`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        console.log(`✅ ${url} - Status:`, response.status, 'Data:', data);
        return { url, success: true, data };
    } catch (error) {
        console.log(`❌ ${url} - Error:`, error.message);
        return { url, success: false, error: error.message };
    }
}

async function findWorkingServerUrl() {
    console.log('Testing possible server URLs...');
    
    for (const url of possibleServerUrls) {
        const result = await testServerUrl(url);
        if (result.success) {
            console.log(`🎉 Found working server: ${url}`);
            return url;
        }
    }
    
    console.log('❌ No working server URL found');
    return null;
}

// Auto-run when script loads
findWorkingServerUrl().then(workingUrl => {
    if (workingUrl) {
        console.log(`Update your .env file with: VITE_BACKEND_URL="${workingUrl}"`);
    } else {
        console.log('Please check your server deployment and update the URL list above');
    }
});

// Export for manual testing
window.testAdminAuth = async (serverUrl) => {
    const baseUrl = serverUrl || import.meta.env.VITE_BACKEND_URL;
    
    try {
        // Test login
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
        console.log('Login test:', loginData);
        
        if (loginData.success) {
            // Test auth check
            const authResponse = await fetch(`${baseUrl}/api/admin/is-auth`, {
                credentials: 'include'
            });
            const authData = await authResponse.json();
            console.log('Auth test:', authData);
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
};