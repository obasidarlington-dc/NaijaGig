const prisma = require('../../prisma/client');
const { sendPushNotification } = require('../utils/notifications');

exports.saveArtisanProfile = async (req, res) => {
  try {
    const { 
      userId, 
      serviceCategory, 
      bio, 
      hourlyRate, 
      yearsExperience, 
      address, 
      serviceArea, 
      profileImage 
    } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    if (profileImage) {
      await prisma.user.update({
        where: { id: userId },
        data: { profileImage },
      });
    }

    const updated = await prisma.artisanProfile.upsert({
      where: { userId },
      update: {
        serviceCategory,
        bio,
        hourlyRate: parseFloat(hourlyRate),
        yearsExperience: parseInt(yearsExperience),
        address,
        serviceArea,
        latitude: 0,
        longitude: 0,
      },
      create: {
        userId,
        serviceCategory,
        bio,
        hourlyRate: parseFloat(hourlyRate),
        yearsExperience: parseInt(yearsExperience),
        address,
        serviceArea,
        latitude: 0,
        longitude: 0,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ Error saving profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAverageRating = async (userId) => {
  const result = await prisma.review.aggregate({
    where: { recipientId: userId },
    _avg: { rating: true },
  });
  return result._avg.rating || 0;
};

// GET /api/artisan/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ fixed from userId to id

    const totalJobs = await prisma.booking.count({
      where: { artisanId: userId, status: 'COMPLETED' },
    });
    const pendingRequests = await prisma.booking.count({
      where: { artisanId: userId, status: 'PENDING' },
    });
    const activeJobs = await prisma.booking.count({
      where: { artisanId: userId, status: { in: ['ACCEPTED', 'IN_PROGRESS'] } },
    });
    const earningsResult = await prisma.booking.aggregate({
      where: { artisanId: userId, status: 'COMPLETED', finalPrice: { not: null } },
      _sum: { finalPrice: true },
    });
    const totalEarnings = earningsResult._sum.finalPrice || 0;
    
    const averageRatingResult = await prisma.review.aggregate({
      where: { recipientId: userId },
      _avg: { rating: true },
    });
    const averageRating = averageRatingResult._avg.rating || 0;

    res.json({
      success: true,
      data: {
        totalJobs,
        pendingRequests,
        activeJobs,
        totalEarnings,
        averageRating,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /api/artisan/bookings
exports.getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let statusFilter = {};
    if (status === 'pending') statusFilter = { status: 'PENDING' };
    else if (status === 'active') statusFilter = { status: { in: ['ACCEPTED', 'IN_PROGRESS'] } };
    else if (status === 'completed') statusFilter = { status: 'COMPLETED' };
    else statusFilter = {};

    const bookings = await prisma.booking.findMany({
      where: { artisanId: userId, ...statusFilter },
      include: {
        client: { select: { id: true, name: true, email: true, profileImage: true } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/artisan/bookings/:id/accept
exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { agreedRate } = req.body;
    const artisanId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, artisanId, status: 'PENDING' },
    });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found or not pending' });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'ACCEPTED',
        finalPrice: agreedRate || booking.estimatedPrice,
      },
    });

    // Send push notification to client
    const artisan = await prisma.user.findUnique({ where: { id: artisanId }, select: { name: true } });
    await sendPushNotification(
      booking.clientId,
      'Booking Accepted',
      `${artisan.name} has accepted your booking. They will contact you soon.`
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/artisan/bookings/:id/decline
exports.declineBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const artisanId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, artisanId, status: 'PENDING' },
    });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    const artisan = await prisma.user.findUnique({ where: { id: artisanId }, select: { name: true } });
    await sendPushNotification(
      booking.clientId,
      'Booking Declined',
      `${artisan.name} cannot take your booking at this time. Please try another artisan.`
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/artisan/bookings/:id/start
exports.startJob = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const artisanId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, artisanId, status: 'ACCEPTED' },
    });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found or not accepted' });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'IN_PROGRESS' },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/artisan/bookings/:id/complete
exports.completeJob = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const artisanId = req.user.id;
    const { finalAmount, workSummary, photoUrls } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, artisanId, status: 'IN_PROGRESS' },
    });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found or not in progress' });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        finalPrice: finalAmount,
        completedAt: new Date(),
        completionNotes: workSummary,
        completionPhotos: photoUrls ? JSON.stringify(photoUrls) : null,
      },
    });

    const artisan = await prisma.user.findUnique({ where: { id: artisanId }, select: { name: true } });
    await sendPushNotification(
      booking.clientId,
      'Job Completed',
      `Your job with ${artisan.name} is complete. Please leave a review!`,
      { bookingId: booking.id }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /api/artisan/earnings
exports.getEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const completedBookings = await prisma.booking.findMany({
      where: { artisanId: userId, status: 'COMPLETED', finalPrice: { not: null } },
      select: { finalPrice: true, createdAt: true, client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
    res.json({
      success: true,
      data: {
        totalEarnings,
        transactions: completedBookings.map(b => ({
          amount: b.finalPrice,
          date: b.createdAt,
          clientName: b.client.name,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// const prisma = require('../../prisma/client');
// const { sendPushNotification } = require('../utils/notifications');

// exports.saveArtisanProfile = async (req, res) => {
//   try {
//     const { 
//       userId, 
//       serviceCategory, 
//       bio, 
//       hourlyRate, 
//       yearsExperience, 
//       address, 
//       serviceArea, 
//       profileImage 
//     } = req.body;

//     if (!userId) {
//       return res.status(400).json({ success: false, error: 'User ID required' });
//     }

//     // 1. Update profile image on User model (if provided)
//     if (profileImage) {
//       await prisma.user.update({
//         where: { id: userId },
//         data: { profileImage },
//       });
//     }

//     // 2. Upsert artisan profile (without profileImage)
//     const updated = await prisma.artisanProfile.upsert({
//       where: { userId },
//       update: {
//         serviceCategory,
//         bio,
//         hourlyRate: parseFloat(hourlyRate),
//         yearsExperience: parseInt(yearsExperience),
//         address,
//         serviceArea,
//         latitude: 0,      // default; user can update later via map
//         longitude: 0,
//       },
//       create: {
//         userId,
//         serviceCategory,
//         bio,
//         hourlyRate: parseFloat(hourlyRate),
//         yearsExperience: parseInt(yearsExperience),
//         address,
//         serviceArea,
//         latitude: 0,
//         longitude: 0,
//       },
//     });

//     res.json({ success: true, data: updated });
//   } catch (error) {
//     console.error('❌ Error saving profile:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



// // Helper to calculate average rating
// const getAverageRating = async (userId) => {
//   const result = await prisma.review.aggregate({
//     where: { recipientId: userId },
//     _avg: { rating: true },
//   });
//   return result._avg.rating || 0;
// };

// // GET /api/artisan/dashboard

// exports.getDashboardStats = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const totalJobs = await prisma.booking.count({
//       where: { artisanId: userId, status: 'COMPLETED' },
//     });
//     const pendingRequests = await prisma.booking.count({
//       where: { artisanId: userId, status: 'PENDING' },
//     });
//     const activeJobs = await prisma.booking.count({
//       where: { artisanId: userId, status: { in: ['ACCEPTED', 'IN_PROGRESS'] } },
//     });
//     const earningsResult = await prisma.booking.aggregate({
//       where: { artisanId: userId, status: 'COMPLETED', finalPrice: { not: null } },
//       _sum: { finalPrice: true },
//     });
//     const totalEarnings = earningsResult._sum.finalPrice || 0;
    
//     const averageRatingResult = await prisma.review.aggregate({
//       where: { recipientId: userId },
//       _avg: { rating: true },
//     });
//     const averageRating = averageRatingResult._avg.rating || 0;

//     res.json({
//       success: true,
//       data: {
//         totalJobs,
//         pendingRequests,
//         activeJobs,
//         totalEarnings,
//         averageRating,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// // GET /api/artisan/bookings?status=pending|active|completed
// exports.getBookings = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { status } = req.query; // 'pending', 'active' (ACCEPTED/IN_PROGRESS), 'completed'

//     let statusFilter = {};
//     if (status === 'pending') statusFilter = { status: 'PENDING' };
//     else if (status === 'active') statusFilter = { status: { in: ['ACCEPTED', 'IN_PROGRESS'] } };
//     else if (status === 'completed') statusFilter = { status: 'COMPLETED' };
//     else statusFilter = {}; // all

//     const bookings = await prisma.booking.findMany({
//       where: { artisanId: userId, ...statusFilter },
//       include: {
//         client: { select: { id: true, name: true, email: true, profileImage: true } },
//         review: true,
//       },
//       orderBy: { createdAt: 'desc' },
//     });
//     res.json({ success: true, data: bookings });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// // POST /api/artisan/bookings/:id/accept
// exports.acceptBooking = async (req, res) => {
//   try {
//     const bookingId = req.params.id;
//     const { agreedRate } = req.body;
//     const artisanId = req.user.userId;

//     const booking = await prisma.booking.findFirst({
//       where: { id: bookingId, artisanId, status: 'PENDING' },
//     });
//     if (!booking) return res.status(404).json({ success: false, error: 'Booking not found or not pending' });

//     const updated = await prisma.booking.update({
//       where: { id: bookingId },
//       data: {
//         status: 'ACCEPTED',
//         finalPrice: agreedRate || booking.estimatedPrice,
//       },
//     });
//     res.json({ success: true, data: updated });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// // POST /api/artisan/bookings/:id/decline
// exports.declineBooking = async (req, res) => {
//   try {
//     const bookingId = req.params.id;
//     const artisanId = req.user.userId;

//     const booking = await prisma.booking.findFirst({
//       where: { id: bookingId, artisanId, status: 'PENDING' },
//     });
//     if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

//     const updated = await prisma.booking.update({
//       where: { id: bookingId },
//       data: { status: 'CANCELLED' },
//     });
//     res.json({ success: true, data: updated });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// // POST /api/artisan/bookings/:id/start
// exports.startJob = async (req, res) => {
//   try {
//     const bookingId = req.params.id;
//     const artisanId = req.user.userId;

//     const booking = await prisma.booking.findFirst({
//       where: { id: bookingId, artisanId, status: 'ACCEPTED' },
//     });
//     if (!booking) return res.status(404).json({ success: false, error: 'Booking not found or not accepted' });

//     const updated = await prisma.booking.update({
//       where: { id: bookingId },
//       data: { status: 'IN_PROGRESS' },
//     });
//     res.json({ success: true, data: updated });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// // POST /api/artisan/bookings/:id/complete
// // exports.completeJob = async (req, res) => {
// //   try {
// //     const bookingId = req.params.id;
// //     const artisanId = req.user.userId;
// //     const { finalAmount, workSummary, photoUrls } = req.body;

// //     const booking = await prisma.booking.findFirst({
// //       where: { id: bookingId, artisanId, status: 'IN_PROGRESS' },
// //     });
// //     if (!booking) return res.status(404).json({ success: false, error: 'Booking not found or not in progress' });

// //     const updated = await prisma.booking.update({
// //       where: { id: bookingId },
// //       data: {
// //         status: 'COMPLETED',
// //         finalPrice: finalAmount,
// //         completedAt: new Date(),
// //         completionNotes: workSummary,
// //         completionPhotos: photoUrls ? JSON.stringify(photoUrls) : null, // store as JSON string
// //       },
// //     });
// //     res.json({ success: true, data: updated });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ success: false, error: 'Server error' });
// //   }
// // };

// exports.completeJob = async (req, res) => {
//   try {
//     const bookingId = req.params.id;
//     const artisanId = req.user.id;
//     const { finalAmount, workSummary, photoUrls } = req.body;

//     const booking = await prisma.booking.findFirst({
//       where: { id: bookingId, artisanId, status: 'IN_PROGRESS' },
//     });
//     if (!booking) return res.status(404).json({ success: false, error: 'Booking not found or not in progress' });

//     const updated = await prisma.booking.update({
//       where: { id: bookingId },
//       data: {
//         status: 'COMPLETED',
//         finalPrice: finalAmount,
//         completedAt: new Date(),
//         completionNotes: workSummary,
//         completionPhotos: photoUrls ? JSON.stringify(photoUrls) : null,
//       },
//     });
//     res.json({ success: true, data: updated });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// // GET /api/artisan/earnings
// exports.getEarnings = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const completedBookings = await prisma.booking.findMany({
//       where: { artisanId: userId, status: 'COMPLETED', finalPrice: { not: null } },
//       select: { finalPrice: true, createdAt: true, client: { select: { name: true } } },
//       orderBy: { createdAt: 'desc' },
//     });
//     const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
//     res.json({
//       success: true,
//       data: {
//         totalEarnings,
//         transactions: completedBookings.map(b => ({
//           amount: b.finalPrice,
//           date: b.createdAt,
//           clientName: b.client.name,
//         })),
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };