// place order cod: /api/order/cod

import Order from "../models/Order.js";
import Product from "../models/product.js";
import User from "../models/User.js";

export const placeOrderCOD = async (req, res) => {
    try {
        console.log('📦 COD Order request received:', req.body);
        const { items, address } = req.body;
        const userId = req.userId;
        
        console.log('👤 User ID:', userId);
        console.log('📋 Items count:', items?.length);
        console.log('🏠 Address:', address);
        
        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: "Invalid order data" });
        }

        // Validate required address fields
        const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'zipCode'];
        for (const field of requiredFields) {
            if (!address[field]) {
                return res.json({ success: false, message: `Missing required field: ${field}` });
            }
        }

        // Calculate amounts
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.json({ success: false, message: `Product not found: ${item.productId}` });
            }
            
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            
            orderItems.push({
                productId: item.productId,
                name: item.name,
                price: product.price,
                quantity: item.quantity,
                image: item.image
            });
        }

        const deliveryFee = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + deliveryFee + tax;

        // Generate order number manually to ensure it's set
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `ORD-${timestamp}${random}`;

        // Calculate estimated delivery time
        const estimatedDeliveryTime = new Date(Date.now() + (40 * 60 * 1000)); // 40 minutes from now

        // Create order
        console.log('📝 Creating order with data:', {
            userId,
            orderItemsCount: orderItems.length,
            subtotal,
            deliveryFee,
            tax,
            total,
            orderNumber,
            paymentMethod: 'cod'
        });

        let newOrder;
        try {
            newOrder = await Order.create({
                userId,
                orderItems,
                shippingAddress: {
                    ...address,
                    country: address.country || 'USA'
                },
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                orderStatus: 'pending',
                subtotal,
                deliveryFee,
                tax,
                total,
                orderNumber,
                estimatedDeliveryTime
            });
        } catch (orderError) {
            console.error('💥 Order creation failed:', orderError);
            console.error('📋 Order validation details:', orderError.errors);
            return res.json({ 
                success: false, 
                message: `Order creation failed: ${orderError.message}`,
                details: orderError.errors 
            });
        }

        console.log('✅ Order created with ID:', newOrder._id);
        console.log('📋 Order number generated:', newOrder.orderNumber);

        // Clear user's cart after successful order
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        console.log('✅ COD Order created successfully:', newOrder.orderNumber);
        return res.json({ 
            success: true, 
            message: "Order placed successfully", 
            orderNumber: newOrder.orderNumber,
            estimatedDeliveryTime: newOrder.estimatedDeliveryTime
        });
 
    } catch (error) {
        console.error('❌ COD Order error:', error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Get orders by userId: /api/order/user

export const getUserOrders = async (req, res) => {
      try {
         const userId = req.userId;
         console.log('📋 Fetching orders for user:', userId);
         
         const orders = await Order.find({
            userId,
            $or:[{paymentMethod: "cod"},{paymentStatus: "paid"}]
         }).populate("orderItems.productId").sort({createdAt:-1});
         
         console.log(`📦 Found ${orders.length} orders for user ${userId}`);
         return res.json({ success: true, orders });
      } catch (error) {
           console.error('❌ Error fetching user orders:', error.message);
           res.json({ success: false, message: error.message });
      }
}

export const getAllOrders = async (req, res) => {
    try {
        console.log('📋 Admin fetching all orders...');
        const orders = await Order.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        
        console.log(`📦 Found ${orders.length} orders for admin`);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('❌ Error fetching admin orders:', error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get pending orders for products originally submitted by a user: /api/order/user-sales
export const getUserSalesOrders = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Find all orders where items contain products originally submitted by this user
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate({
            path: "items.productId",
            match: { originalSubmitterId: userId },
            select: "name category offerPrice image originalSubmitterId"
        }).populate("address").populate("userId", "name email").sort({ createdAt: -1 });

        // Filter out orders that don't have any products from this user
        const filteredOrders = orders.filter(order => 
            order.items.some(item => item.productId && item.productId.originalSubmitterId && item.productId.originalSubmitterId.toString() === userId)
        );

        return res.json({ success: true, orders: filteredOrders });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Get all orders with user submission info for admin: /api/order/admin-enhanced
export const getAdminOrdersEnhanced = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate({
            path: "items.productId",
            select: "name category offerPrice image originalSubmitterId",
            populate: {
                path: "originalSubmitterId",
                select: "name email"
            }
        }).populate("address").populate("userId", "name email").sort({ createdAt: -1 });

        // Add metadata about user-submitted products
        const enhancedOrders = orders.map(order => ({
            ...order.toObject(),
            hasUserSubmittedProducts: order.items.some(item => 
                item.productId && item.productId.originalSubmitterId
            ),
            userSubmittedItems: order.items.filter(item => 
                item.productId && item.productId.originalSubmitterId
            )
        }));

        res.json({ success: true, orders: enhancedOrders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

