// Temporary test component to debug admin authentication
import React from 'react';
import axios from 'axios';

const adminAPI = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AdminAuthTest = () => {
    const testAuth = async () => {
        try {
            console.log('Testing admin auth...');
            console.log('API Base URL:', import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000');
            console.log('LocalStorage admin flag:', localStorage.getItem('isAdminLoggedIn'));
            
            const response = await adminAPI.get('/api/admin/is-auth');
            console.log('Auth test response:', response.data);
            
            if (response.data.success) {
                alert('Admin authentication successful!');
            } else {
                alert('Admin authentication failed: ' + response.data.message);
            }
        } catch (error) {
            console.error('Auth test error:', error);
            alert('Auth test error: ' + (error.response?.data?.message || error.message));
        }
    };

    const testLogin = async () => {
        try {
            console.log('Testing admin login...');
            const response = await adminAPI.post('/api/admin/login', {
                email: 'admin@restaurant.com',
                password: 'admin123'
            });
            console.log('Login test response:', response.data);
            
            if (response.data.success) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                alert('Login successful!');
            } else {
                alert('Login failed: ' + response.data.message);
            }
        } catch (error) {
            console.error('Login test error:', error);
            alert('Login test error: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999, background: 'white', padding: '10px', border: '1px solid #ccc' }}>
            <h4>Admin Auth Debug</h4>
            <button onClick={testLogin} style={{ margin: '5px', padding: '5px' }}>Test Login</button>
            <button onClick={testAuth} style={{ margin: '5px', padding: '5px' }}>Test Auth</button>
        </div>
    );
};

export default AdminAuthTest;