import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import adminRouter from './routes/adminRoute.js';
import cartRouter from './routes/cartRoute.js';
import productRouter from './routes/productRoute.js';
import orderRouter from './routes/orderRoute.js';
import addressRouter from './routes/addressRoute.js';
import reservationRouter from './routes/reservationRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';

const app = express();

// Database and cloudinary connection
let dbConnected = false;
let cloudinaryConnected = false;

async function connectServices() {
    if (!dbConnected) {
        try {
            const { default: connectDB } = await import('./configs/db.js');
            await connectDB();
            dbConnected = true;
            console.log('Database connected');
        } catch (error) {
            console.error('Database connection failed:', error);
            // Don't throw error, just log it - the app should still work for non-DB routes
        }
    }
    
    if (!cloudinaryConnected) {
        try {
            const { default: connectCloudinary } = await import('./configs/cloudinary.js');
            await connectCloudinary();
            cloudinaryConnected = true;
            console.log('Cloudinary connected');
        } catch (error) {
            console.error('Cloudinary connection failed:', error);
            // Don't throw error, just log it - the app should still work for non-Cloudinary routes
        }
    }
}

const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173', // Vite dev server default port
    'http://localhost:3000', // React dev server alternative port
    process.env.FRONTEND_URL // Add environment variable for dynamic frontend URL
].filter(Boolean);

// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Also allow any vercel deployment URLs
        if (origin && (origin.includes('.vercel.app') || origin.includes('localhost'))) {
            return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: "API is working",
        timestamp: new Date().toISOString(),
        services: {
            database: dbConnected,
            cloudinary: cloudinaryConnected
        }
    });
});
app.get('/api', (req, res) => res.json({ message: "API is working" }));
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: dbConnected,
            cloudinary: cloudinaryConnected
        }
    });
});

app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/product', productRouter); 
app.use('/api/cart', cartRouter); 
app.use('/api/order', orderRouter);
app.use('/api/address', addressRouter);
app.use('/api/reservation', reservationRouter);
app.use('/api/dashboard', dashboardRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Export the Express API for Vercel
export default async function handler(req, res) {
    try {
        // Connect to services before handling requests
        await connectServices();
        
        // Handle the request with Express
        return app(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000;
    
    (async () => {
        await connectServices();
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })();
}