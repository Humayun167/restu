import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String,
        required: true
    }
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: 'USA'
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        required: true,
        enum: ['stripe', 'razorpay', 'cod', 'paypal'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true,
        default: 5.00
    },
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    estimatedDeliveryTime: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    specialInstructions: {
        type: String,
        maxLength: 500
    },
    // Payment related fields
    paymentId: {
        type: String // Stripe payment intent ID, Razorpay order ID, etc.
    },
    refundId: {
        type: String
    },
    refundAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderNumber = `ORD-${timestamp}${random}`;
    }
    next();
});

// Calculate estimated delivery time (default 30-45 minutes for restaurant orders)
orderSchema.pre('save', function(next) {
    if (this.isNew && !this.estimatedDeliveryTime) {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + (40 * 60 * 1000)); // 40 minutes from now
        this.estimatedDeliveryTime = deliveryTime;
    }
    next();
});

// Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;