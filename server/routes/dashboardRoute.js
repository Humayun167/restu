import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import authAdmin from '../middlewares/authAdmin.js';

const dashboardRouter = express.Router();

// Get dashboard statistics (Admin only)
dashboardRouter.get('/stats', authAdmin, getDashboardStats);

export default dashboardRouter;