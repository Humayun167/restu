import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

// Import routes
import userRouter from '../routes/userRoute.js';
import adminRouter from '../routes/adminRoute.js';
import cartRouter from '../routes/cartRoute.js';
import productRouter from '../routes/productRoute.js';
import orderRouter from '../routes/orderRoute.js';
import addressRouter from '../routes/addressRoute.js';
import reservationRouter from '../routes/reservationRoute.js';
import dashboardRouter from '../routes/dashboardRoute.js';

const app = express();

// Database and cloudinary connection
let dbConnected = false;
let cloudinaryConnected = false;
let initialized = false;

async function connectServices() {
    if (!dbConnected) {
        try {
            const { default: connectDB } = await import('../configs/db.js');
            await connectDB();
            dbConnected = true;
            console.log('Database connected');
        } catch (error) {
            console.error('Database connection failed:', error);
        }
    }
    
    if (!cloudinaryConnected) {
        try {
            const { default: connectCloudinary } = await import('../configs/cloudinary.js');
            await connectCloudinary();
            cloudinaryConnected = true;
            console.log('Cloudinary connected');
        } catch (error) {
            console.error('Cloudinary connection failed:', error);
        }
    }
}

async function initializeApp() {
    if (!initialized) {
        await connectServices();
        initialized = true;
    }
}

const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

// Middleware configuration
app.use(express.json());
app.use(cookieParser());

// Enhanced CORS configuration for Vercel deployment
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow configured origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow any vercel.app subdomain or localhost
        if (origin && (origin.includes('.vercel.app') || origin.includes('localhost'))) {
            return callback(null, true);
        }
        
        console.log('CORS rejected origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
    preflightContinue: false
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

// API routes
try {
    app.use('/api/user', userRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/product', productRouter); 
    app.use('/api/cart', cartRouter); 
    app.use('/api/order', orderRouter);
    app.use('/api/address', addressRouter);
    app.use('/api/reservation', reservationRouter);
    app.use('/api/dashboard', dashboardRouter);
} catch (error) {
    console.error('Router setup error:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// 404 handler - use a catch-all route instead of '*'
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

export default async function handler(req, res) {
    try {
        await initializeApp();
        app(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
}