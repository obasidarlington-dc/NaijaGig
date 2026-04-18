const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact support.',
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
};

// Check if user is an artisan
const isArtisan = (req, res, next) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Artisan role required.',
    });
  }
  next();
};

// Check if user is a client
const isClient = (req, res, next) => {
  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Client role required.',
    });
  }
  next();
};

// Check if user is an admin
// const isAdmin = (req, res, next) => {
//   if (req.user.role !== 'ADMIN') {
//     return res.status(403).json({
//       success: false,
//       error: 'Access denied. Admin role required.',
//     });
//   }
//   next();
// };

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticate,
  isArtisan,
  isClient,
  isAdmin,
};