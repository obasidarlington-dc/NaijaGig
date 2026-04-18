const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');
const {
  generateVerificationCode,
  sendVerificationEmail,
} = require('../utils/email');

// ─────────────────────────────────────────
// Helper: Generate JWT Token
// ─────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user (client or artisan)
// @access  Public
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // --- Validation ---
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    // Validate role
    const validRoles = ['CLIENT', 'ARTISAN'];
    const userRole = role && validRoles.includes(role.toUpperCase())
      ? role.toUpperCase()
      : 'CLIENT';

    // --- Check if email already exists ---
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // If user exists but not verified, allow re-registration
      if (!existingUser.isEmailVerified) {
        // Generate new code and resend
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: {
            verificationCode: code,
            codeExpiresAt: expiresAt,
          },
        });

        await sendVerificationEmail(email, existingUser.name, code);
console.log(`📧 OTP for ${email}: ${code}`);
        return res.status(200).json({
          success: true,
          message: 'Verification code resent. Please check your email.',
          data: { email: email.toLowerCase() },
        });
      }

      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists.',
      });
    }

    // --- Hash password ---
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // --- Generate verification code ---
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // --- Create user ---
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        phone: phone || null,
        role: userRole,
        verificationCode: code,
        codeExpiresAt: expiresAt,
        isEmailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // --- Send verification email ---
    await sendVerificationEmail(email, name, code);

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email for the verification code.',
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
    });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP code
// @access  Public
// ─────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and verification code.',
      });
    }

    // --- Find user ---
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified. Please login.',
      });
    }

    // --- Check code ---
    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code. Please try again.',
      });
    }

    // --- Check expiry ---
    if (!user.codeExpiresAt || new Date() > user.codeExpiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new one.',
      });
    }

    // --- Mark as verified ---
    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        codeExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileImage: true,
        isEmailVerified: true,
      },
    });

    // --- Generate JWT token ---
    const token = generateToken(updatedUser.id, updatedUser.role);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to ArtisanConnect.',
      data: {
        token,
        user: updatedUser,
      },
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed. Please try again.',
    });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/resend-code
// @desc    Resend verification code
// @access  Public
// ─────────────────────────────────────────
// const resendCode = async (req, res) => {
//   console.log('🔵 resendCode called with email:', req.body.email); 
//   try {
//     const { email } = req.body;

//     if (!email) {
//       console.log('❌ No email provided'); 
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide your email address.',
//       });
//     }

//     // --- Find user ---
//     const user = await prisma.user.findUnique({
//       where: { email: email.toLowerCase() },
//     });
//      console.log('📦 User found?', user ? 'yes' : 'no');  

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'No account found with this email.',
//       });
//     }

//     if (user.isEmailVerified) {
//       return res.status(400).json({
//         success: false,
//         error: 'Email is already verified.',
//       });
//     }

//     // --- Generate new code ---
//     const code = generateVerificationCode();
//     const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
//      console.log('📝 New code generated:', code); 

//     await prisma.user.update({
//       where: { email: email.toLowerCase() },
//       data: {
//         verificationCode: code,
//         codeExpiresAt: expiresAt,
//       },
//     });

//     // --- Send new email ---
//     await sendVerificationEmail(email, user.name, code);
//      console.log('✅ Email sent');

//     res.status(200).json({
//       success: true,
//       message: 'New verification code sent. Please check your email.',
//       data: { email: email.toLowerCase() },
//     });

//   } catch (error) {
//     console.error('Resend code error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to resend code. Please try again.',
//     });
//   }
// };

const resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email required' });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, error: 'Already verified' });
    }
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: code, codeExpiresAt: expiresAt }
    });
    await sendVerificationEmail(email, user.name, code);
    res.json({ success: true, message: 'New code sent' });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password.',
      });
    }

    // --- Find user ---
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        artisanProfile: {
          select: {
            id: true,
            serviceCategory: true,
            bio: true,
            hourlyRate: true,
            yearsExperience: true,
            address: true,
            serviceArea: true,
            isApproved: true,
            isVerified: true,
            averageRating: true,
            totalJobs: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // --- Check account is active ---
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact support.',
      });
    }

    // --- Check email is verified ---
    if (!user.isEmailVerified) {
      // Auto-resend verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: code,
          codeExpiresAt: expiresAt,
        },
      });

      await sendVerificationEmail(user.email, user.name, code);

      return res.status(403).json({
        success: false,
        error: 'Please verify your email first. A new code has been sent to your email.',
        data: { email: user.email, requiresVerification: true },
      });
    }

    // --- Check password ---
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // --- Generate token ---
    const token = generateToken(user.id, user.role);

    // --- Return user data (I am excluding sensitive fields) ---
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      artisanProfile: user.artisanProfile || null,
    };

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        token,
        user: userData,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
    });
  }
};



// @route   POST /api/auth/complete-artisan-setup
// @desc    Complete artisan profile (location, phone, 2FA)
// @access  Public (email passed, but you may add token later)
const completeArtisanSetup = async (req, res) => {
  try {
    const { email, phoneNumber, twoFactorEnabled, address, apartment, latitude, longitude } = req.body;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role !== 'ARTISAN') return res.status(400). json({ success: false, error: 'Not an artisan' });

    // Update user with phone and 2FA preference (store 2FA in a separate field if needed)
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: phoneNumber },
    });

    // Update or create artisan profile with location
    const fullAddress = apartment ? `${address}, ${apartment}` : address;
    await prisma.artisanProfile.upsert({
      where: { userId: user.id },
      update: {
        address: fullAddress,
        latitude: latitude || 0,
        longitude: longitude || 0,
      },
      create: {
        userId: user.id,
        address: fullAddress,
        latitude: latitude || 0,
        longitude: longitude || 0,
        serviceCategory: 'OTHER', // default; artisan can update later
      },
    });

    // If you have a twoFactorEnabled field on User, add it (optional)
    // For now, we just return success.

    res.json({ success: true, message: 'Artisan setup complete' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};




// ─────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
// ─────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        profileImage: true,
        isEmailVerified: true,
        createdAt: true,
        artisanProfile: {
          select: {
            id: true,
            serviceCategory: true,
            bio: true,
            hourlyRate: true,
            yearsExperience: true,
            address: true,
            serviceArea: true,
            isVerified: true,
            isApproved: true,
            averageRating: true,
            totalJobs: true,
          },
        },
      },
    });
    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to get user data.' });
  }
};




module.exports = {
  register,
  verifyEmail,
  resendCode,
  login,
  getMe,
  completeArtisanSetup, 
};