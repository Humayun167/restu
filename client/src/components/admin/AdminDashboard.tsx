import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { assets } from '@/assets/assets';
import axios from 'axios';

// Create axios instance with same config as main API
const adminAPI = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if admin is authenticated using the API
        const checkAuth = async () => {
            try {
                console.log('Checking admin auth with:', import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000');
                const response = await adminAPI.get('/api/admin/is-auth');
                const data = response.data;
                
                if (!data.success) {
                    localStorage.removeItem('isAdminLoggedIn');
                    navigate('/admin/login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('isAdminLoggedIn');
                navigate('/admin/login');
            }
        };
        
        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await adminAPI.get('/api/admin/logout');
            localStorage.removeItem('isAdminLoggedIn');
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout even if API call fails
            localStorage.removeItem('isAdminLoggedIn');
            navigate('/admin/login');
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
        { id: 'add-product', label: 'Add Product', path: '/admin/add-product' },
        { id: 'product-list', label: 'Product List', path: '/admin/products' },
        { id: 'orders', label: 'Orders', path: '/admin/orders' },
        { id: 'reservations', label: 'Reservations', path: '/admin/reservations' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <img src={assets.logout_icon} alt="Logout" className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-sm min-h-screen">
                    <nav className="mt-6">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    navigate(item.path);
                                }}
                                className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${
                                    activeTab === item.id
                                        ? 'bg-primary text-white border-r-4 border-primary'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;