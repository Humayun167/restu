import express from 'express';
import { isAuth, login, logout, register, uploadAvatar } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', register )
userRouter.post('/login', login )
userRouter.get('/is-auth',authUser,isAuth )
userRouter.get('/logout', authUser, logout )
userRouter.post('/upload-avatar', authUser, upload.single('avatar'), uploadAvatar)

// Test endpoint for debugging
userRouter.get('/test-upload', authUser, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Upload endpoint is accessible',
        user: req.user ? { id: req.user.id } : null 
    });
})
export default userRouter; 