const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const {
  getPendingArtisans,
  approveArtisan,
  getWithdrawals,
  processWithdrawal,
  getAnalytics,
  getBookings,
  toggleUserActive,
   getAllUsers,
} = require('../controllers/adminController');

router.use(authenticate, isAdmin); // all admin routes require admin role

router.get('/artisans/pending', getPendingArtisans);
router.put('/artisans/:id/approve', approveArtisan);
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id/process', processWithdrawal);
router.get('/analytics', getAnalytics);
router.get('/bookings', getBookings);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/users', getAllUsers);

module.exports = router;