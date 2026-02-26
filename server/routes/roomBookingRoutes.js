const express = require('express');
const router = express.Router();
const roomBookingController = require('../controllers/roomBookingController');

router.get('/user/:userId', roomBookingController.getUserRoomBookings);
router.post('/', roomBookingController.createRoomBooking);
router.get('/stats', roomBookingController.getRoomBookingStats);
router.get('/', roomBookingController.getAllRoomBookings);
router.get('/check-availability', roomBookingController.checkRoomAvailability);
router.put('/cancel/:id', roomBookingController.cancelRoomBooking);
router.delete('/:id', roomBookingController.deleteRoomBooking);

module.exports = router;
