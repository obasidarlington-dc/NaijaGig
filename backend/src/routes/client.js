const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getArtisans,
  getArtisanDetails,
  createBooking,
  getClientBookings,
  addReview,
} = require('../controllers/clientController');

// All client routes require authentication
router.use(authenticate);

router.get('/artisans', getArtisans);
router.get('/artisans/:id', getArtisanDetails);
router.post('/bookings', createBooking);
router.get('/bookings', getClientBookings);
router.post('/reviews', addReview);

module.exports = router;