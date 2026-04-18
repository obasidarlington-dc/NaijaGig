const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getDashboardStats,
  getBookings,
  acceptBooking,
  declineBooking,
  startJob,
  completeJob,
  getEarnings,
} = require('../controllers/artisanController');

// All routes require authentication
router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getBookings);
router.post('/bookings/:id/accept', acceptBooking);
router.post('/bookings/:id/decline', declineBooking);
router.post('/bookings/:id/start', startJob);
router.post('/bookings/:id/complete', completeJob);
router.get('/earnings', getEarnings);

module.exports = router;