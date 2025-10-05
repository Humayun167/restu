import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';
import { assets } from '@/assets/assets';
import { adminAPI, Order } from '@/lib/api';

const OrderManagement = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const statuses = ['All', 'pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

    // Load orders from API
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                console.log('🔄 Fetching admin orders...');
                const response = await adminAPI.getAllOrders();
                console.log('📦 Admin orders response:', response);
                
                if (response.success && response.data) {
                    setOrders(response.data);
                    console.log(`✅ Loaded ${response.data.length} orders`);
                } else {
                    console.log('❌ Failed to fetch orders:', response.message);
                    toast({
                        title: "Error",
                        description: "Failed to load orders",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error('💥 Error fetching orders:', error);
                toast({
                    title: "Error",
                    description: "Failed to load orders",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [toast]);

    // Filter orders based on status and search term
    useEffect(() => {
        let filtered = orders;

        if (statusFilter !== 'All') {
            filtered = filtered.filter(order => order.orderStatus === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(order => {
                const customerName = typeof order.userId === 'object' ? order.userId.name : '';
                const customerEmail = typeof order.userId === 'object' ? order.userId.email : '';
                
                return (
                    customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        setFilteredOrders(filtered);
    }, [orders, statusFilter, searchTerm]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'confirmed': return 'text-blue-600 bg-blue-100';
            case 'preparing': return 'text-orange-600 bg-orange-100';
            case 'out-for-delivery': return 'text-purple-600 bg-purple-100';
            case 'delivered': return 'text-green-600 bg-green-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: Order['orderStatus']) => {
        setIsLoading(true);
        try {
            console.log('🔄 Updating order status:', { orderId, newStatus });
            const response = await adminAPI.updateOrderStatus(orderId, newStatus);
            
            if (response.success) {
                const updatedOrders = orders.map(order =>
                    order._id === orderId ? { ...order, orderStatus: newStatus } : order
                );
                setOrders(updatedOrders);
                
                toast({
                    title: "Status Updated",
                    description: `Order status updated successfully`,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update order status",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('💥 Error updating order status:', error);
            toast({
                title: "Error",
                description: "Failed to update order status",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative">
                        <img 
                            src={assets.search_icon} 
                            alt="Search" 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                        />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Delivery Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => {
                                const customerName = typeof order.userId === 'object' ? order.userId.name : 'Unknown';
                                const customerEmail = typeof order.userId === 'object' ? order.userId.email : 'Unknown';
                                
                                return (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{customerName}</div>
                                            <div className="text-sm text-gray-500">{customerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatPrice(order.total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1).replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                            {order.shippingAddress ? (
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900 truncate" title={order.shippingAddress.fullName}>
                                                        {order.shippingAddress.fullName}
                                                    </div>
                                                    <div className="text-gray-500 truncate" title={`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`}>
                                                        {order.shippingAddress.city}, {order.shippingAddress.state}
                                                    </div>
                                                    <div className="text-gray-400 text-xs" title={order.shippingAddress.phone}>
                                                        📞 {order.shippingAddress.phone}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">No address</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(order.createdAt.toString())}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value as Order['orderStatus'])}
                                                disabled={isLoading}
                                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="out-for-delivery">Out for Delivery</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No orders found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
};

// Order Details Modal
const OrderDetailsModal = ({ 
    order, 
    onClose, 
    onStatusUpdate 
}: {
    order: Order;
    onClose: () => void;
    onStatusUpdate: (orderId: string, status: Order['orderStatus']) => void;
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const customerName = typeof order.userId === 'object' ? order.userId.name : 'Unknown';
    const customerEmail = typeof order.userId === 'object' ? order.userId.email : 'Unknown';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Order Details #{order.orderNumber}</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <img src={assets.cross_icon} alt="Close" className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">Customer Information</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p><span className="font-medium">Name:</span> {customerName}</p>
                            <p><span className="font-medium">Email:</span> {customerEmail}</p>
                            <p><span className="font-medium">Phone:</span> {order.shippingAddress.phone}</p>
                            <p><span className="font-medium">Address:</span> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
                        <div className="space-y-3">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Subtotal:</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Delivery Fee:</span>
                                <span>{formatPrice(order.deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Tax:</span>
                                <span>{formatPrice(order.tax)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 pt-2 border-t">
                                <span className="font-medium">Total Amount:</span>
                                <span className="text-xl font-bold text-primary">{formatPrice(order.total)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span>Order Date:</span>
                                <span>{formatDate(order.createdAt.toString())}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span>Payment Method:</span>
                                <span className="uppercase">{order.paymentMethod}</span>
                            </div>
                            {order.estimatedDeliveryTime && (
                                <div className="flex justify-between items-center">
                                    <span>Estimated Delivery:</span>
                                    <span>{formatDate(order.estimatedDeliveryTime.toString())}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">Update Status</h4>
                        <select
                            value={order.orderStatus}
                            onChange={(e) => onStatusUpdate(order._id, e.target.value as Order['orderStatus'])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out-for-delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;