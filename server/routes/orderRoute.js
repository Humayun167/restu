import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, getUserSalesOrders, placeOrderCOD, getAdminOrdersEnhanced } from '../controllers/orderController.js';
import authAdmin from '../middlewares/authAdmin.js';


const orderRouter = express.Router();


orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/user-sales', authUser, getUserSalesOrders)
orderRouter.get('/admin', authAdmin, getAllOrders)
orderRouter.get('/admin-enhanced', authAdmin, getAdminOrdersEnhanced)

export default orderRouter;