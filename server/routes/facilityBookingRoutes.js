const express = require('express');
const router = express.Router();
const facilityBookingController = require('../controllers/facilityBookingController');

// Create a new facility booking
router.post('/', facilityBookingController.createBooking);

// Get all facility bookings (Admin)
router.get('/', facilityBookingController.getBookings);
router.get('/user/:userId', facilityBookingController.getBookingsByUser);
router.get('/check-availability', facilityBookingController.checkAvailability);

// Delete a facility booking
router.delete('/:id', facilityBookingController.deleteBooking);

module.exports = router;
