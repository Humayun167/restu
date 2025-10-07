import React, { useEffect, useState } from 'react';

const AdminDebug = () => {
    const [debugInfo, setDebugInfo] = useState({
        currentPath: window.location.pathname,
        currentOrigin: window.location.origin,
        backendUrl: import.meta.env.VITE_BACKEND_URL,
        mode: import.meta.env.MODE,
        localStorage: localStorage.getItem('isAdminLoggedIn'),
        serverStatus: 'checking...'
    });

    useEffect(() => {
        // Test server connectivity
        const testServer = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/health`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                setDebugInfo(prev => ({
                    ...prev,
                    serverStatus: `✅ Connected - ${JSON.stringify(data)}`
                }));
            } catch (error) {
                setDebugInfo(prev => ({
                    ...prev,
                    serverStatus: `❌ Failed - ${error.message}`
                }));
            }
        };

        testServer();
    }, []);

    const testLogin = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: 'admin@restaurant.com',
                    password: 'admin123'
                })
            });
            const data = await response.json();
            alert(`Login test: ${JSON.stringify(data)}`);
            
            if (data.success) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                setDebugInfo(prev => ({ ...prev, localStorage: 'true' }));
            }
        } catch (error) {
            alert(`Login error: ${error.message}`);
        }
    };

    const testAuth = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/is-auth`, {
                credentials: 'include'
            });
            const data = await response.json();
            alert(`Auth test: ${JSON.stringify(data)}`);
        } catch (error) {
            alert(`Auth error: ${error.message}`);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '20px', 
            zIndex: 9999,
            overflow: 'auto'
        }}>
            <h1>Admin Debug Information</h1>
            <div style={{ marginBottom: '20px' }}>
                <h3>Environment Info:</h3>
                <pre style={{ backgroundColor: '#333', padding: '10px', borderRadius: '5px' }}>
                    {JSON.stringify(debugInfo, null, 2)}
                </pre>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <button onClick={testLogin} style={{ marginRight: '10px', padding: '10px' }}>
                    Test Login
                </button>
                <button onClick={testAuth} style={{ marginRight: '10px', padding: '10px' }}>
                    Test Auth
                </button>
                <button onClick={() => {
                    localStorage.removeItem('isAdminLoggedIn');
                    setDebugInfo(prev => ({ ...prev, localStorage: null }));
                }} style={{ marginRight: '10px', padding: '10px' }}>
                    Clear LocalStorage
                </button>
                <button onClick={() => window.location.reload()} style={{ padding: '10px' }}>
                    Reload Page
                </button>
            </div>

            <div>
                <h3>Possible Issues:</h3>
                <ul>
                    <li>If server status shows ❌, your VITE_BACKEND_URL is wrong</li>
                    <li>If login fails, check server environment variables</li>
                    <li>If auth fails after login, check cookie settings</li>
                    <li>Check browser console for more detailed errors</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminDebug;