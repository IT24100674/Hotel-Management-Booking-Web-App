const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Get bookings for a specific user
router.get('/user/:userId', bookingController.getUserBookings);

// Create a new booking
router.post('/', bookingController.createBooking);

// Get statistics (Income, etc.)
router.get('/stats', bookingController.getBookingStats);

// Get all bookings (Admin)
router.get('/', bookingController.getAllBookings);

// Check availability
router.get('/check-availability', bookingController.checkAvailability);

// Cancel Booking
router.put('/cancel/:id', bookingController.cancelBooking);

// Delete Booking
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
