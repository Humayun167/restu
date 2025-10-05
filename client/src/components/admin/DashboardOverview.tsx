import React, { useState, useEffect } from 'react';
import { assets } from '@/assets/assets';
import { formatPrice } from '@/utils/currency';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

interface ReservationStats {
    totalReservations: number;
    todayReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    totalGuests: number;
    averagePartySize: number;
}

interface RecentOrder {
    _id: string;
    orderNumber: string;
    userId: {
        name: string;
        email: string;
    };
    orderItems: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    orderStatus: string;
    createdAt: string;
}

const DashboardOverview = () => {
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [reservationStats, setReservationStats] = useState<ReservationStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [chartData, setChartData] = useState({
        orderStatus: [] as Array<{name: string, value: number, color: string}>,
        reservationStatus: [] as Array<{name: string, value: number, color: string}>,
        dailyOrders: [] as Array<{date: string, orders: number, revenue: number}>,
        revenueData: [] as Array<{date: string, revenue: number}>
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Import dashboardAPI dynamically to avoid circular imports
            const { dashboardAPI } = await import('@/lib/api');
            
            // Fetch real data from the dashboard API
            console.log('Fetching dashboard statistics...');
            const data = await dashboardAPI.getStats();
            console.log('Dashboard API response:', data);

            if (data.success && data.stats && data.chartData) {
                // Set real statistics
                setStats(data.stats.orders);
                setReservationStats(data.stats.reservations);
                setRecentOrders(data.recentOrders || []);
                
                // Set real chart data
                setChartData({
                    orderStatus: data.chartData.orderStatus,
                    reservationStatus: data.chartData.reservationStatus,
                    dailyOrders: data.chartData.dailyOrders,
                    revenueData: data.chartData.revenueData
                });
            } else {
                console.error('Dashboard API returned error:', data.message);
                setError(data.message || 'Failed to load dashboard data');
            }

        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            setError('Failed to load dashboard data. Please check if you are logged in as admin.');
        } finally {
            setLoading(false);
        }
    };

    const dashboardStats = (stats && reservationStats) ? [
        {
            title: 'Total Orders',
            value: stats.totalOrders.toString(),
            icon: assets.parcel_icon,
            color: 'bg-blue-500'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders.toString(),
            icon: assets.parcel_icon,
            color: 'bg-yellow-500'
        },
        {
            title: 'Total Revenue',
            value: formatPrice(stats.totalRevenue),
            icon: assets.basket_icon,
            color: 'bg-purple-500'
        },
        {
            title: 'Total Reservations',
            value: reservationStats.totalReservations.toString(),
            icon: assets.menu_1,
            color: 'bg-indigo-500'
        },
        {
            title: 'Today\'s Reservations',
            value: reservationStats.todayReservations.toString(),
            icon: assets.menu_2,
            color: 'bg-green-500'
        },
        {
            title: 'Pending Reservations',
            value: reservationStats.pendingReservations.toString(),
            icon: assets.menu_3,
            color: 'bg-orange-500'
        },
        {
            title: 'Total Guests',
            value: reservationStats.totalGuests.toString(),
            icon: assets.profile_icon,
            color: 'bg-teal-500'
        },
        {
            title: 'Avg Party Size',
            value: reservationStats.averagePartySize.toFixed(1),
            icon: assets.profile_icon,
            color: 'bg-pink-500'
        }
    ] : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'confirmed': return 'text-blue-600 bg-blue-100';
            case 'preparing': return 'text-orange-600 bg-orange-100';
            case 'out-for-delivery': return 'text-indigo-600 bg-indigo-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getTotalItems = (orderItems: RecentOrder['orderItems']) => {
        return orderItems.reduce((total, item) => total + item.quantity, 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <img src={stat.icon} alt={stat.title} className="h-6 w-6 filter invert" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Orders Status Distribution */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData.orderStatus}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {chartData.orderStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Reservation Status Distribution */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Reservation Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData.reservationStatus}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {chartData.reservationStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} reservations`, 'Count']} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Additional Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Orders */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Orders (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.dailyOrders}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value, name) => [
                                    name === 'orders' ? `${value} orders` : formatPrice(Number(value)),
                                    name === 'orders' ? 'Orders' : 'Revenue'
                                ]}
                            />
                            <Legend />
                            <Bar dataKey="orders" fill="#3b82f6" name="orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Revenue']} />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                                name="Revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {order.userId.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {getTotalItems(order.orderItems)} items
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatPrice(order.total)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                                            {formatStatus(order.orderStatus)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;