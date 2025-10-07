import React, { useEffect, useState } from 'react';

interface DebugInfo {
  environment: string;
  currentUrl: string;
  backendUrl: string;
  isProduction: boolean;
  localStorage: {
    isAdminLoggedIn: string | null;
    adminToken: string | null;
  };
  cookies: string;
  serverHealth: string;
  authStatus: string;
  corsStatus: string;
}

const AdminProductionDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    environment: import.meta.env.MODE,
    currentUrl: window.location.origin,
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
    isProduction: import.meta.env.PROD,
    localStorage: {
      isAdminLoggedIn: localStorage.getItem('isAdminLoggedIn'),
      adminToken: localStorage.getItem('adminToken') ? 'present' : 'missing',
    },
    cookies: document.cookie || 'no cookies',
    serverHealth: 'checking...',
    authStatus: 'checking...',
    corsStatus: 'checking...'
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    
    // Test 1: Server Health
    try {
      const healthResponse = await fetch(`${backendUrl}/`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (healthResponse.ok) {
        const text = await healthResponse.text();
        setDebugInfo(prev => ({ 
          ...prev, 
          serverHealth: `✅ Server responding: ${text}` 
        }));
      } else {
        setDebugInfo(prev => ({ 
          ...prev, 
          serverHealth: `❌ Server error: ${healthResponse.status}` 
        }));
      }
    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        serverHealth: `❌ Network error: ${error.message}` 
      }));
    }

    // Test 2: CORS Test
    try {
      const corsResponse = await fetch(`${backendUrl}/api/admin/is-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setDebugInfo(prev => ({ 
        ...prev, 
        corsStatus: `✅ CORS working - Status: ${corsResponse.status}` 
      }));
    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        corsStatus: `❌ CORS error: ${error.message}` 
      }));
    }

    // Test 3: Auth Status
    try {
      const token = localStorage.getItem('adminToken');
      const authResponse = await fetch(`${backendUrl}/api/admin/is-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const authData = await authResponse.json();
      setDebugInfo(prev => ({ 
        ...prev, 
        authStatus: `Response: ${JSON.stringify(authData)}` 
      }));
    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        authStatus: `❌ Auth check error: ${error.message}` 
      }));
    }
  };

  const testLogin = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@restaurant.com',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('isAdminLoggedIn', 'true');
        alert('✅ Login successful! Token stored.');
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          localStorage: {
            isAdminLoggedIn: 'true',
            adminToken: 'present'
          }
        }));
      } else {
        alert(`❌ Login failed: ${data.message}`);
      }
    } catch (error) {
      alert(`❌ Login error: ${error.message}`);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminLoggedIn');
    setDebugInfo(prev => ({
      ...prev,
      localStorage: {
        isAdminLoggedIn: null,
        adminToken: null
      }
    }));
    alert('✅ Tokens cleared');
  };

  if (!import.meta.env.DEV && debugInfo.environment !== 'development') {
    // Only show in development or when explicitly enabled
    const showDebug = new URLSearchParams(window.location.search).get('debug') === 'admin';
    if (!showDebug) {
      return null;
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '20px',
      overflowY: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>
        🔧 Admin Production Debug Panel
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#4ecdc4' }}>Environment Info</h2>
        <ul>
          <li>Mode: {debugInfo.environment}</li>
          <li>Is Production: {debugInfo.isProduction ? 'Yes' : 'No'}</li>
          <li>Current URL: {debugInfo.currentUrl}</li>
          <li>Backend URL: {debugInfo.backendUrl}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#4ecdc4' }}>Local Storage</h2>
        <ul>
          <li>Admin Logged In: {debugInfo.localStorage.isAdminLoggedIn || 'null'}</li>
          <li>Admin Token: {debugInfo.localStorage.adminToken || 'null'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#4ecdc4' }}>Cookies</h2>
        <p>{debugInfo.cookies}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#4ecdc4' }}>Server Status</h2>
        <ul>
          <li>Health: {debugInfo.serverHealth}</li>
          <li>CORS: {debugInfo.corsStatus}</li>
          <li>Auth: {debugInfo.authStatus}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#4ecdc4' }}>Actions</h2>
        <button 
          onClick={testLogin}
          style={{
            padding: '10px 15px',
            margin: '5px',
            backgroundColor: '#4ecdc4',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Login
        </button>
        <button 
          onClick={clearTokens}
          style={{
            padding: '10px 15px',
            margin: '5px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Tokens
        </button>
        <button 
          onClick={runDiagnostics}
          style={{
            padding: '10px 15px',
            margin: '5px',
            backgroundColor: '#45a29e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Re-run Tests
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#ffd93d' }}>Production Troubleshooting Tips:</h3>
        <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <li>If server health fails: Check VITE_BACKEND_URL in environment variables</li>
          <li>If CORS fails: Verify FRONTEND_URL is set correctly on server</li>
          <li>If auth fails but cookies work locally: Try the fallback token method</li>
          <li>If cookies don't work: The token fallback should handle authentication</li>
          <li>Clear browser data if issues persist</li>
        </ul>
      </div>

      <p style={{ marginTop: '30px', textAlign: 'center', color: '#888' }}>
        Press F12 and check console for additional debug information.
        <br />
        Add ?debug=admin to URL to show this panel in production.
      </p>
    </div>
  );
};

export default AdminProductionDebug;