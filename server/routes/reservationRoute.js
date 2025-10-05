import express from 'express';
import {
    createReservation,
    getUserReservations,
    getAllReservations,
    updateReservationStatus,
    cancelReservation,
    getAvailableSlots
} from '../controllers/reservationController.js';
import authUser from '../middlewares/authUser.js';
import authAdmin from '../middlewares/authAdmin.js';

const reservationRouter = express.Router();

// Test route to check if reservation routes are working
reservationRouter.get('/test', (req, res) => {
    res.json({ success: true, message: 'Reservation routes are working' });
});



// Public routes
reservationRouter.get('/available-slots', getAvailableSlots);

// Protected routes for users (optional authentication - can create reservation without login)
reservationRouter.post('/create', (req, res, next) => {
    // Optional authentication middleware
    if (req.headers.authorization) {
        authUser(req, res, next);
    } else {
        next();
    }
}, createReservation);

// User routes (require authentication)
reservationRouter.get('/my-reservations', authUser, getUserReservations);
reservationRouter.put('/cancel/:id', authUser, cancelReservation);

// Admin routes (require admin authentication)
reservationRouter.get('/all', authAdmin, getAllReservations);
reservationRouter.put('/update/:id', authAdmin, updateReservationStatus);
reservationRouter.put('/admin-cancel/:id', authAdmin, cancelReservation);

export default reservationRouter;
