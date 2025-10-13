import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, getUserSalesOrders, placeOrderCOD, getAdminOrdersEnhanced, updateOrderStatus } from '../controllers/orderController.js';
import authAdmin from '../middlewares/authAdmin.js';


const orderRouter = express.Router();

// Log route registration
console.log('📋 Registering order routes...');

orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/user-sales', authUser, getUserSalesOrders)
orderRouter.get('/admin', authAdmin, getAllOrders)
orderRouter.get('/admin-enhanced', authAdmin, getAdminOrdersEnhanced)
orderRouter.post('/status', authAdmin, updateOrderStatus)

console.log('✅ Order routes registered: /cod, /user, /user-sales, /admin, /admin-enhanced, /status');

export default orderRouter;