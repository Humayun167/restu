import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    // Customer Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow guest reservations
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    
    // Reservation Details
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Validate time format HH:MM
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Time must be in HH:MM format'
        }
    },
    guests: {
        type: Number,
        required: true,
        min: 1,
        max: 20 // Restaurant capacity limit
    },
    
    // Special Requests
    specialRequests: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Reservation Management
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
        default: 'pending'
    },
    confirmationNumber: {
        type: String,
        unique: true,
        index: true
    },
    tableNumber: {
        type: String,
        trim: true
    },
    
    // Admin Management
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    confirmedAt: {
        type: Date
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ email: 1 });
reservationSchema.index({ confirmationNumber: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ createdAt: -1 });

// Generate confirmation number before saving
reservationSchema.pre('save', function(next) {
    if (this.isNew && !this.confirmationNumber) {
        // Generate a unique confirmation number
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        this.confirmationNumber = `RES-${timestamp}${random}`;
    }
    this.updatedAt = new Date();
    next();
});

// Virtual for formatted date and time
reservationSchema.virtual('formattedDateTime').get(function() {
    const date = this.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const time = new Date(`2000-01-01 ${this.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    return `${date} at ${time}`;
});

// Virtual to check if reservation can be cancelled
reservationSchema.virtual('canBeCancelled').get(function() {
    const now = new Date();
    const reservationDateTime = new Date(`${this.date.toISOString().split('T')[0]} ${this.time}`);
    const twoHoursBeforeReservation = new Date(reservationDateTime.getTime() - (2 * 60 * 60 * 1000));
    
    return now < twoHoursBeforeReservation && 
           this.status !== 'cancelled' && 
           this.status !== 'completed' && 
           this.status !== 'no-show';
});

// Static method to find available time slots
reservationSchema.statics.findAvailableSlots = async function(date, guests = 1) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get all reservations for the date
    const existingReservations = await this.find({
        date: {
            $gte: targetDate,
            $lt: nextDay
        },
        status: { $in: ['pending', 'confirmed'] }
    });
    
    // Define available time slots and table capacity
    const timeSlots = [
        '17:00', '17:30', '18:00', '18:30', '19:00',
        '19:30', '20:00', '20:30', '21:00', '21:30'
    ];
    
    const maxCapacityPerSlot = 40; // Total restaurant capacity per time slot
    const availableSlots = [];
    
    for (const timeSlot of timeSlots) {
        // Calculate occupied capacity for this time slot
        const occupiedCapacity = existingReservations
            .filter(reservation => reservation.time === timeSlot)
            .reduce((total, reservation) => total + reservation.guests, 0);
            
        const availableCapacity = maxCapacityPerSlot - occupiedCapacity;
        
        if (availableCapacity >= guests) {
            const timeSlots = [];
            
            // Parse time for display
            const [hours, minutes] = timeSlot.split(':');
            const timeObj = new Date();
            timeObj.setHours(parseInt(hours), parseInt(minutes));
            
            const displayTime = timeObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            
            availableSlots.push({
                time: timeSlot,
                available: true,
                displayTime: displayTime,
                availableCapacity: availableCapacity
            });
        }
    }
    
    return availableSlots;
};

// Static method to get reservation statistics
reservationSchema.statics.getStatistics = async function(startDate, endDate) {
    const pipeline = [
        {
            $match: {
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalGuests: { $sum: '$guests' }
            }
        }
    ];
    
    const stats = await this.aggregate(pipeline);
    
    // Convert to object format
    const result = {};
    stats.forEach(stat => {
        result[stat._id] = {
            count: stat.count,
            guests: stat.totalGuests
        };
    });
    
    return result;
};

// Instance method to cancel reservation
reservationSchema.methods.cancel = function(reason = '') {
    if (!this.canBeCancelled) {
        throw new Error('Reservation cannot be cancelled at this time');
    }
    
    this.status = 'cancelled';
    this.adminNotes = this.adminNotes ? `${this.adminNotes}\n\nCancelled: ${reason}` : `Cancelled: ${reason}`;
    return this.save();
};

// Instance method to confirm reservation
reservationSchema.methods.confirm = function(adminId, tableNumber = '') {
    this.status = 'confirmed';
    this.confirmedBy = adminId;
    this.confirmedAt = new Date();
    if (tableNumber) {
        this.tableNumber = tableNumber;
    }
    return this.save();
};

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
