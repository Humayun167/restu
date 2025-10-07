import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
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

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log('Sending login request with:', { email, password });
            console.log('API Base URL:', import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000');
            
            const response = await adminAPI.post('/api/admin/login', {
                email,
                password
            });

            const data = response.data;
            console.log('Login response:', data);
            
            if (data.success) {
                // The server sets the adminToken as an httpOnly cookie
                // We can store a flag in localStorage to track login state
                localStorage.setItem('isAdminLoggedIn', 'true');
                
                toast({
                    title: "Login Successful",
                    description: "Welcome to the admin dashboard!",
                });
                
                // Wait a brief moment to ensure cookies are set before navigating
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 100);
            } else {
                toast({
                    title: "Login Failed",
                    description: data.message || "Invalid email or password",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = "An error occurred during login";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast({
                title: "Login Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
     
    return (
        <form onSubmit={handleSubmit} className='min-h-screen flex items-center text-sm text-gray-600'>

            <div className='flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-l-2xl shadow-xl border border-gray-200'>
                <p className='text-2xl font-medium m-auto'><span className='text-primary'>Seller</span> Login</p>
                 <div className='w-full'>
                    <p>Email</p>
                    <input onChange={(e)=> setEmail(e.target.value)} value={email}
                     placeholder='email' 
                     type="email" 
                     className='border border-gray-20 rounded w-full p-2 mt-l outline-primary'
                      required />
                 </div>
                 <div className='w-full'>
                    <p>Password</p>
                    <input onChange={(e)=> setPassword(e.target.value)} value={password}
                     placeholder='password' type="password" className="border border-gray-20 rounded w-full p-2 mt-l outline-primary" required/>
                 </div>
                 <button 
                    type="submit" 
                    disabled={isLoading}
                    className='bg-primary text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                 >
                    {isLoading ? 'Logging in...' : 'Login'}
                 </button>
                 <p className='text-xs text-gray-500 mt-2'>
                    Demo credentials: admin@example.com / 1234567890
                 </p>


             
            </div>
        </form>
    );
};

export default AdminLogin;