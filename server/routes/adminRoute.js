import express from 'express';
import authAdmin from '../middlewares/authAdmin.js';
import { adminLogin, adminLogout, isAdminAuth } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get('/is-auth',authAdmin,isAdminAuth);
adminRouter.get('/logout',authAdmin,adminLogout);

export default adminRouter;