const express = require('express');
const router = express.Router();
const eventBookingController = require('../controllers/eventBookingController');

router.get('/', eventBookingController.getAllEventBookings);
router.post('/', eventBookingController.createEventBooking);
router.get('/user/:userId', eventBookingController.getUserEventBookings);
router.get('/check-availability', eventBookingController.checkEventAvailability);
router.put('/cancel/:id', eventBookingController.cancelEventBooking);
router.delete('/:id', eventBookingController.deleteEventBooking);

module.exports = router;
