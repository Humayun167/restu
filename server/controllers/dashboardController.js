import Order from "../models/Order.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Get date ranges
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const thisWeek = new Date(today);
        thisWeek.setDate(today.getDate() - 7);

        // Order Statistics
        const [
            totalOrders,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            orderRevenue
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ orderStatus: 'pending' }),
            Order.countDocuments({ orderStatus: 'delivered' }),
            Order.countDocuments({ orderStatus: { $in: ['cancelled', 'canceled'] } }),
            Order.aggregate([
                { $match: { orderStatus: 'delivered' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ])
        ]);

        const totalRevenue = orderRevenue.length > 0 ? orderRevenue[0].total : 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Reservation Statistics
        const [
            totalReservations,
            todayReservations,
            pendingReservations,
            confirmedReservations,
            cancelledReservations,
            reservationGuests
        ] = await Promise.all([
            Reservation.countDocuments(),
            Reservation.countDocuments({ 
                date: { $gte: today, $lt: tomorrow } 
            }),
            Reservation.countDocuments({ status: 'pending' }),
            Reservation.countDocuments({ status: 'confirmed' }),
            Reservation.countDocuments({ status: 'cancelled' }),
            Reservation.aggregate([
                { $group: { _id: null, totalGuests: { $sum: '$guests' } } }
            ])
        ]);

        const totalGuests = reservationGuests.length > 0 ? reservationGuests[0].totalGuests : 0;
        const averagePartySize = totalReservations > 0 ? totalGuests / totalReservations : 0;

        // Order Status Distribution for Charts
        const orderStatusData = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Reservation Status Distribution for Charts
        const reservationStatusData = await Reservation.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Daily Orders for the last 7 days
        const dailyOrdersData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thisWeek }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { 
                        $sum: { 
                            $cond: [
                                { $eq: ['$orderStatus', 'delivered'] }, 
                                '$total', 
                                0
                            ] 
                        } 
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // Recent Orders
        const recentOrders = await Order.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(); // Use lean() for better performance

        // Format chart data
        const orderStatusChart = orderStatusData.map(item => ({
            name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
            value: item.count,
            color: getStatusColor(item._id)
        }));

        const reservationStatusChart = reservationStatusData.map(item => ({
            name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
            value: item.count,
            color: getReservationStatusColor(item._id)
        }));

        // Format daily data
        const dailyOrders = [];
        const revenueData = [];
        
        // Fill in the last 7 days with data
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dayData = dailyOrdersData.find(d => 
                d._id.year === date.getFullYear() &&
                d._id.month === date.getMonth() + 1 &&
                d._id.day === date.getDate()
            );
            
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const orders = dayData ? dayData.orders : 0;
            const revenue = dayData ? dayData.revenue : 0;
            
            dailyOrders.push({ date: dateStr, orders, revenue: Math.round(revenue) });
            revenueData.push({ date: dateStr, revenue: Math.round(revenue) });
        }

        res.json({
            success: true,
            stats: {
                orders: {
                    totalOrders,
                    pendingOrders,
                    deliveredOrders,
                    cancelledOrders,
                    totalRevenue,
                    averageOrderValue
                },
                reservations: {
                    totalReservations,
                    todayReservations,
                    pendingReservations,
                    confirmedReservations,
                    cancelledReservations,
                    totalGuests,
                    averagePartySize
                }
            },
            chartData: {
                orderStatus: orderStatusChart,
                reservationStatus: reservationStatusChart,
                dailyOrders,
                revenueData
            },
            recentOrders: recentOrders.map(order => ({
                _id: order._id,
                orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6)}`,
                userId: order.userId,
                orderItems: order.orderItems,
                total: order.total,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt
            }))
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

// Helper function to get status colors
const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return '#f59e0b';
        case 'delivered': return '#10b981';
        case 'cancelled':
        case 'canceled': return '#ef4444';
        case 'confirmed': return '#3b82f6';
        case 'preparing': return '#f97316';
        case 'out-for-delivery': return '#8b5cf6';
        default: return '#6b7280';
    }
};

const getReservationStatusColor = (status) => {
    switch (status) {
        case 'pending': return '#f59e0b';
        case 'confirmed': return '#10b981';
        case 'cancelled': return '#ef4444';
        case 'completed': return '#8b5cf6';
        case 'no-show': return '#ef4444';
        default: return '#6b7280';
    }
};

export { getDashboardStats };