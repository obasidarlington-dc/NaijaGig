const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/client');

const {
  register,
  verifyEmail,
  resendCode,
  login,
  getMe,
  completeArtisanSetup,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// ─────────────────────────────────────────
// Public Routes (no token required)
// ─────────────────────────────────────────

// POST /api/auth/register
// Register new user (client or artisan)
router.post('/register', register);

// POST /api/auth/verify-email
// Verify email with 6-digit OTP code
router.post('/verify-email', verifyEmail);

// POST /api/auth/resend-code
// Resend verification code to email
router.post('/resend-code', resendCode);

// POST /api/auth/login
// Login with email and password
router.post('/login', login);

// ─────────────────────────────────────────
// Private Routes (token required)
// ─────────────────────────────────────────

// GET /api/auth/me
// Get current logged-in user data
router.get('/me', authenticate, getMe);

//artisan setup -complete profile after email verification
router.post('/complete-artisan-setup', completeArtisanSetup);

// POST /api/users/push-token
router.post('/users/push-token', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { expoPushToken: token },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', authenticate, async (req, res) => {
  try {
    const { phone, address } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { phone },
    });
    // Also update address 
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// TEMPORARY DEBUG - somethings just dey rack my head  
router.get('/debug-code/:email', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.params.email.toLowerCase() } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ code: user.verificationCode, expires: user.codeExpiresAt });
});

module.exports = router;