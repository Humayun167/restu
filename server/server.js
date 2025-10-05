import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';
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
const port = process.env.PORT || 4000;


await connectDB();
await connectCloudinary();

const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173', // Vite dev server default port
    'http://localhost:3000', // React dev server alternative port
    process.env.FRONTEND_URL // Add environment variable for dynamic frontend URL
].filter(Boolean);
/// Middleware configaration
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
        if (origin.includes('.vercel.app')) {
            return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));


app.get('/',(req,res)=> res.send("Api is working"));
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/product', productRouter); 
app.use('/api/cart', cartRouter); 
app.use('/api/order', orderRouter);
app.use('/api/address', addressRouter);
app.use('/api/reservation', reservationRouter);
app.use('/api/dashboard', dashboardRouter);

app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`)
}) 