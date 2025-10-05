import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI, LoginCredentials, RegisterData, User as ApiUser, LoginResponse } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profileImage?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await authAPI.checkAuth();
      console.log('🔍 CheckAuth response:', response);
      
      if (response.success && response.user) {
        const apiUser = response.user;
        console.log('✅ User authenticated:', apiUser);
        setUser({
          id: apiUser._id,
          name: apiUser.name,
          email: apiUser.email,
          avatar: apiUser.profileImage || apiUser.avatar,
        });
      } else {
        console.log('❌ No user found or auth failed');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login with:', { email: credentials.email, password: '***' });
      
      const response: LoginResponse = await authAPI.login(credentials);
      console.log('📥 Login API response:', response);
      
      // Backend sends user directly, not nested in data
      if (response.success && response.user) {
        const userData = response.user;
        console.log('✅ Login successful, user data:', userData);
        
        setUser({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          avatar: userData.profileImage,
        });
        return { success: true };
      } else {
        console.log('❌ Login failed:', response.message);
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        console.error('Error response:', axiosError.response?.data);
        const message = axiosError.response?.data?.message || 'Network error occurred';
        return { success: false, message };
      }
      return { success: false, message: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Optionally auto-login after registration
        if (response.data?.user) {
          const apiUser = response.data.user;
          setUser({
            id: apiUser._id,
            name: apiUser.name,
            email: apiUser.email,
            avatar: apiUser.avatar,
          });
        }
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Network error occurred';
        return { success: false, message };
      }
      return { success: false, message: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server request fails, clear the local user state
      setUser(null);
    }
  };

  const isLoggedIn = !!user;

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      checkAuth, 
      isLoggedIn 
    }}>
      {children}
    </UserContext.Provider>
  );
};