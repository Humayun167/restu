import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create a new reservation
const createReservation = async (req, res) => {
    try {
        const { date, time, guests, name, phone, email, specialRequests } = req.body;

        // Validate required fields
        if (!date || !time || !guests || !name || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Validate date (must be future date)
        const reservationDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (reservationDate < today) {
            return res.status(400).json({
                success: false,
                message: "Reservation date must be in the future"
            });
        }

        // Check if the time slot is available
        const availableSlots = await Reservation.findAvailableSlots(date, guests);
        const isTimeAvailable = availableSlots.some(slot => slot.time === time);
        
        if (!isTimeAvailable) {
            return res.status(400).json({
                success: false,
                message: "Selected time slot is not available for the requested number of guests"
            });
        }

        // Get user ID if authenticated (optional)
        let userId = null;
        if (req.user && req.user.id) {
            userId = req.user.id;
        }

        // Create the reservation
        const reservation = new Reservation({
            userId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            date: reservationDate,
            time,
            guests: parseInt(guests),
            specialRequests: specialRequests?.trim() || "",
            status: 'pending'
        });

        await reservation.save();

        // Populate user information if available
        if (userId) {
            await reservation.populate('userId', 'name email phone');
        }

        res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            reservation: {
                id: reservation._id,
                confirmationNumber: reservation.confirmationNumber,
                name: reservation.name,
                email: reservation.email,
                phone: reservation.phone,
                date: reservation.date,
                time: reservation.time,
                guests: reservation.guests,
                specialRequests: reservation.specialRequests,
                status: reservation.status,
                formattedDateTime: reservation.formattedDateTime,
                createdAt: reservation.createdAt
            }
        });

    } catch (error) {
        console.error("Create reservation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create reservation",
            error: error.message
        });
    }
};

// Get user's reservations
const getUserReservations = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = {
            $or: [
                { userId: req.user.id },
                { email: req.user.email } // Include reservations made before login
            ]
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        const reservations = await Reservation.find(query)
            .populate('userId', 'name email phone')
            .populate('confirmedBy', 'name')
            .sort({ date: -1, time: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Reservation.countDocuments(query);

        res.json({
            success: true,
            reservations: reservations.map(reservation => ({
                id: reservation._id,
                confirmationNumber: reservation.confirmationNumber,
                name: reservation.name,
                email: reservation.email,
                phone: reservation.phone,
                date: reservation.date,
                time: reservation.time,
                guests: reservation.guests,
                specialRequests: reservation.specialRequests,
                status: reservation.status,
                tableNumber: reservation.tableNumber,
                adminNotes: reservation.adminNotes,
                formattedDateTime: reservation.formattedDateTime,
                canBeCancelled: reservation.canBeCancelled,
                createdAt: reservation.createdAt,
                updatedAt: reservation.updatedAt
            })),
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error("Get user reservations error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reservations",
            error: error.message
        });
    }
};

// Get all reservations (Admin only)
const getAllReservations = async (req, res) => {
    try {
        const { 
            status, 
            date, 
            page = 1, 
            limit = 20, 
            search,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { confirmationNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const reservations = await Reservation.find(query)
            .populate('userId', 'name email phone')
            .populate('confirmedBy', 'name')
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Reservation.countDocuments(query);

        // Get today's statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStats = await Reservation.aggregate([
            {
                $match: {
                    date: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    guests: { $sum: '$guests' }
                }
            }
        ]);

        res.json({
            success: true,
            reservations: reservations.map(reservation => ({
                id: reservation._id,
                confirmationNumber: reservation.confirmationNumber,
                name: reservation.name,
                email: reservation.email,
                phone: reservation.phone,
                date: reservation.date,
                time: reservation.time,
                guests: reservation.guests,
                specialRequests: reservation.specialRequests,
                status: reservation.status,
                tableNumber: reservation.tableNumber,
                adminNotes: reservation.adminNotes,
                userId: reservation.userId,
                confirmedBy: reservation.confirmedBy,
                confirmedAt: reservation.confirmedAt,
                formattedDateTime: reservation.formattedDateTime,
                canBeCancelled: reservation.canBeCancelled,
                createdAt: reservation.createdAt,
                updatedAt: reservation.updatedAt
            })),
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            },
            todayStats: todayStats.reduce((acc, stat) => {
                acc[stat._id] = { count: stat.count, guests: stat.guests };
                return acc;
            }, {})
        });

    } catch (error) {
        console.error("Get all reservations error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reservations",
            error: error.message
        });
    }
};

// Update reservation status (Admin only)
const updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tableNumber, adminNotes } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation ID"
            });
        }

        const reservation = await Reservation.findById(id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            });
        }

        // Update reservation fields
        if (status) {
            reservation.status = status;
            
            // Set confirmation details if confirming
            if (status === 'confirmed' && reservation.status !== 'confirmed') {
                reservation.confirmedBy = req.user?.id;
                reservation.confirmedAt = new Date();
            }
        }

        if (tableNumber !== undefined) {
            reservation.tableNumber = tableNumber.trim();
        }

        if (adminNotes !== undefined) {
            reservation.adminNotes = adminNotes.trim();
        }

        await reservation.save();

        res.json({
            success: true,
            message: "Reservation updated successfully",
            reservation: {
                id: reservation._id,
                confirmationNumber: reservation.confirmationNumber,
                name: reservation.name,
                email: reservation.email,
                phone: reservation.phone,
                date: reservation.date,
                time: reservation.time,
                guests: reservation.guests,
                status: reservation.status,
                tableNumber: reservation.tableNumber,
                adminNotes: reservation.adminNotes,
                updatedAt: reservation.updatedAt
            }
        });

    } catch (error) {
        console.error("Update reservation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update reservation",
            error: error.message
        });
    }
};

// Cancel reservation (User or Admin)
const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason = 'Cancelled by customer' } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation ID"
            });
        }

        const reservation = await Reservation.findById(id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            });
        }

        // Check if user can cancel this reservation
        if (req.user && req.user.id) {
            const isOwner = reservation.userId?.toString() === req.user.id || 
                           reservation.email === req.user.email;
            const isAdmin = req.user.role === 'admin'; // Assuming admin role checking
            
            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to cancel this reservation"
                });
            }
        }

        try {
            await reservation.cancel(reason);
            
            res.json({
                success: true,
                message: "Reservation cancelled successfully",
                reservation: {
                    id: reservation._id,
                    confirmationNumber: reservation.confirmationNumber,
                    status: reservation.status,
                    updatedAt: reservation.updatedAt
                }
            });
        } catch (cancelError) {
            return res.status(400).json({
                success: false,
                message: cancelError.message
            });
        }

    } catch (error) {
        console.error("Cancel reservation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel reservation",
            error: error.message
        });
    }
};

// Get available time slots
const getAvailableSlots = async (req, res) => {
    try {
        const { date, guests = 1 } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }

        // Validate date format and ensure it's in the future
        const reservationDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(reservationDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format"
            });
        }

        if (reservationDate < today) {
            return res.status(400).json({
                success: false,
                message: "Cannot get availability for past dates"
            });
        }

        const guestCount = parseInt(guests);
        if (guestCount < 1 || guestCount > 20) {
            return res.status(400).json({
                success: false,
                message: "Guest count must be between 1 and 20"
            });
        }

        const availableSlots = await Reservation.findAvailableSlots(date, guestCount);

        res.json({
            success: true,
            date: date,
            guests: guestCount,
            availableSlots: availableSlots
        });

    } catch (error) {
        console.error("Get available slots error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available time slots",
            error: error.message
        });
    }
};

export {
    createReservation,
    getUserReservations,
    getAllReservations,
    updateReservationStatus,
    cancelReservation,
    getAvailableSlots
};
