import axios, { AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  withCredentials: true, // Important for cookie-based authentication
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔗 Adding token to request:', token.substring(0, 20) + '...');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login or clear auth state
      console.log('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

// API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Backend response types (actual response structure)
export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  cartItems?: unknown[];
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
  subCategory?: string;
  stock: number;
  popular?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Address {
  _id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'stripe' | 'razorpay' | 'paypal';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  orderNumber: string;
  estimatedDeliveryTime?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log('🌐 Making login request to:', api.defaults.baseURL + '/api/user/login');
    console.log('📤 Request data:', { email: credentials.email, password: '***' });
    const response = await api.post('/api/user/login', credentials);
    console.log('📨 Raw response:', response);
    
    // Store token in localStorage if login successful
    if (response.data.success && response.data.token) {
      console.log('💾 Storing token in localStorage');
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  register: async (userData: RegisterData): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/api/user/register', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.get('/api/user/logout');
    // Clear token from localStorage on logout
    localStorage.removeItem('token');
    console.log('🗑️ Token removed from localStorage');
    return response.data;
  },

  checkAuth: async (): Promise<{ success: boolean; user?: User & { cartItems?: Record<string, number> }; message?: string }> => {
    const response = await api.get('/api/user/is-auth');
    return response.data;
  },
};

// Product API
export const productAPI = {
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/api/product/list');
    return response.data;
  },

  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/api/product/${id}`);
    return response.data;
  },

  getProductsByCategory: async (category: string): Promise<ApiResponse<Product[]>> => {
    const response = await api.get(`/api/product/category/${category}`);
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  updateCart: async (cartItems: Record<string, number>): Promise<ApiResponse> => {
    const response = await api.post('/api/cart/update', { cartItems });
    return response.data;
  },
};

// Order API
export const orderAPI = {
  placeOrder: async (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
    const response = await api.post('/api/order/place', orderData);
    return response.data;
  },

  placeOrderCOD: async (orderData: {
    items: { productId: string; name: string; price: number; quantity: number; image: string }[];
    address: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
    };
  }): Promise<{ success: boolean; message?: string; orderNumber?: string; estimatedDeliveryTime?: Date }> => {
    const response = await api.post('/api/order/cod', orderData);
    return response.data;
  },

  getUserOrders: async (): Promise<{ success: boolean; orders?: Order[]; message?: string }> => {
    const response = await api.get('/api/order/user');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse> => {
    const response = await api.post('/api/order/status', { orderId, status });
    return response.data;
  },
};

// Admin API (if needed)
export const adminAPI = {
  addProduct: async (productData: FormData): Promise<ApiResponse> => {
    const response = await api.post('/api/admin/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/api/order/admin');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse> => {
    const response = await api.post('/api/order/status', { orderId, status });
    return response.data;
  },
};

// Address API
export const addressAPI = {
  getAddresses: async (): Promise<{ success: boolean; addresses?: Address[]; message?: string }> => {
    const response = await api.get('/api/address/get');
    return response.data;
  },

  addAddress: async (addressData: Omit<Address, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; address?: Address; message?: string }> => {
    const response = await api.post('/api/address/add', addressData);
    return response.data;
  },

  updateAddress: async (addressId: string, addressData: Omit<Address, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; address?: Address; message?: string }> => {
    const response = await api.put(`/api/address/update/${addressId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addressId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/api/address/delete/${addressId}`);
    return response.data;
  },

  setDefaultAddress: async (addressId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.put(`/api/address/set-default/${addressId}`);
    return response.data;
  },
};

// Reservation Types
export interface Reservation {
  id: string;
  confirmationNumber: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  tableNumber?: string;
  adminNotes?: string;
  userId?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  formattedDateTime?: string;
  canBeCancelled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  displayTime: string;
  availableCapacity?: number;
}

export interface ReservationPagination {
  current: number;
  pages: number;
  total: number;
}

// Reservation API
export const reservationAPI = {
  // Create a new reservation
  create: async (reservationData: {
    date: string;
    time: string;
    guests: number;
    name: string;
    phone: string;
    email: string;
    specialRequests?: string;
  }): Promise<{
    success: boolean;
    message?: string;
    reservation?: Partial<Reservation>;
  }> => {
    const response = await api.post('/api/reservation/create', reservationData);
    return response.data;
  },

  // Get user's reservations
  getUserReservations: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    reservations?: Reservation[];
    pagination?: ReservationPagination;
    message?: string;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/api/reservation/my-reservations?${queryParams.toString()}`);
    return response.data;
  },

  // Get all reservations (Admin only)
  getAllReservations: async (params?: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    success: boolean;
    reservations?: Reservation[];
    pagination?: ReservationPagination;
    todayStats?: Record<string, { count: number; guests: number }>;
    message?: string;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/api/reservation/all?${queryParams.toString()}`);
    return response.data;
  },

  // Update reservation status (Admin only)
  updateStatus: async (reservationId: string, data: {
    status?: string;
    tableNumber?: string;
    adminNotes?: string;
  }): Promise<{
    success: boolean;
    message?: string;
    reservation?: Reservation;
  }> => {
    const response = await api.put(`/api/reservation/update/${reservationId}`, data);
    return response.data;
  },

  // Cancel reservation (User)
  cancel: async (reservationId: string, reason?: string): Promise<{
    success: boolean;
    message?: string;
    reservation?: Partial<Reservation>;
  }> => {
    const response = await api.put(`/api/reservation/cancel/${reservationId}`, { reason });
    return response.data;
  },

  // Cancel reservation (Admin)
  adminCancel: async (reservationId: string, reason?: string): Promise<{
    success: boolean;
    message?: string;
    reservation?: Partial<Reservation>;
  }> => {
    const response = await api.put(`/api/reservation/admin-cancel/${reservationId}`, { reason });
    return response.data;
  },

  // Get available time slots
  getAvailableSlots: async (date: string, guests: number = 1): Promise<{
    success: boolean;
    availableSlots?: AvailableSlot[];
    date?: string;
    guests?: number;
    message?: string;
  }> => {
    const response = await api.get(`/api/reservation/available-slots?date=${date}&guests=${guests}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics (Admin only)
  getStats: async (): Promise<{
    success: boolean;
    stats?: {
      orders: {
        totalOrders: number;
        pendingOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
      };
      reservations: {
        totalReservations: number;
        todayReservations: number;
        pendingReservations: number;
        confirmedReservations: number;
        cancelledReservations: number;
        totalGuests: number;
        averagePartySize: number;
      };
    };
    chartData?: {
      orderStatus: Array<{ name: string; value: number; color: string }>;
      reservationStatus: Array<{ name: string; value: number; color: string }>;
      dailyOrders: Array<{ date: string; orders: number; revenue: number }>;
      revenueData: Array<{ date: string; revenue: number }>;
    };
    recentOrders?: Array<{
      _id: string;
      orderNumber: string;
      userId: { name: string; email: string };
      orderItems: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      orderStatus: string;
      createdAt: string;
    }>;
    message?: string;
  }> => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
};

export default api;