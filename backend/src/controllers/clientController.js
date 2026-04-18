const prisma = require('../../prisma/client');
const { ServiceCategory } = require('@prisma/client');
const { sendPushNotification } = require('../utils/notifications');

// Helper: Haversine distance
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.getArtisans = async (req, res) => {
  try {
    const { lat, lng, category, minRating, maxPrice, search } = req.query;
    const where = {
      role: 'ARTISAN',
      isEmailVerified: true,
      artisanProfile: { isApproved: true },
    };
    if (category && category !== 'All') {
      where.artisanProfile = { ...where.artisanProfile, serviceCategory: category.toUpperCase() };
    }
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      const matchedCategory = Object.values(ServiceCategory).find(cat =>
        cat.toLowerCase().includes(searchLower)
      );
      if (matchedCategory) {
        where.artisanProfile = { ...where.artisanProfile, serviceCategory: matchedCategory };
      } else {
        where.name = { contains: search, mode: 'insensitive' };
      }
    }
    if (minRating) {
      where.artisanProfile = { ...where.artisanProfile, averageRating: { gte: parseFloat(minRating) } };
    }
    if (maxPrice) {
      where.artisanProfile = { ...where.artisanProfile, hourlyRate: { lte: parseFloat(maxPrice) } };
    }
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        profileImage: true,
        artisanProfile: {
          select: {
            serviceCategory: true,
            bio: true,
            hourlyRate: true,
            averageRating: true,
            totalJobs: true,
            latitude: true,
            longitude: true,
            address: true,
          },
        },
      },
    });
    let artisans = users.map(u => ({ ...u, distance: null }));
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      artisans = artisans.map(a => {
        if (a.artisanProfile?.latitude && a.artisanProfile?.longitude) {
          const dist = getDistance(latNum, lngNum, a.artisanProfile.latitude, a.artisanProfile.longitude);
          return { ...a, distance: dist };
        }
        return a;
      });
      artisans.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    res.json({ success: true, data: artisans });
  } catch (error) {
    console.error('getArtisans error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

exports.getArtisanDetails = async (req, res) => {
  try {
    const artisan = await prisma.user.findUnique({
      where: { id: req.params.id, role: 'ARTISAN' },
      include: {
        artisanProfile: true,
        reviewsReceived: {
          include: { author: { select: { name: true, profileImage: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!artisan) return res.status(404).json({ success: false, error: 'Artisan not found' });
    res.json({ success: true, data: artisan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { artisanId, serviceType, description, scheduledDate, address, latitude, longitude, estimatedPrice } = req.body;
    const booking = await prisma.booking.create({
      data: {
        clientId: req.user.id,
        artisanId,
        serviceType,
        description,
        scheduledDate: new Date(scheduledDate),
        address,
        latitude: latitude || 0,
        longitude: longitude || 0,
        estimatedPrice,
        status: 'PENDING',
      },
    });
    await prisma.conversation.create({
      data: { bookingId: booking.id },
    });

    // Send push notification to artisan
    const client = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true } });
    await sendPushNotification(
      artisanId,
      'New Booking Request',
      `${client.name} requested you for ${serviceType}. Check your requests.`
    );

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getClientBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { clientId: req.user.id },
      include: {
        artisan: { select: { id: true, name: true, profileImage: true } },
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

exports.addReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, clientId: req.user.id, status: 'COMPLETED' },
    });
    if (!booking) {
      return res.status(403).json({ success: false, error: 'Cannot review this booking' });
    }
    const existingReview = await prisma.review.findUnique({ where: { bookingId } });
    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this job' });
    }
    const review = await prisma.review.create({
      data: {
        bookingId,
        authorId: req.user.id,
        recipientId: booking.artisanId,
        rating,
        comment,
      },
    });
    const avg = await prisma.review.aggregate({
      where: { recipientId: booking.artisanId },
      _avg: { rating: true },
    });
    await prisma.artisanProfile.update({
      where: { userId: booking.artisanId },
      data: { averageRating: avg._avg.rating },
    });
    res.json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// const prisma = require('../../prisma/client');
// const { ServiceCategory } = require('@prisma/client');

// const getDistance = (lat1, lon1, lat2, lon2) => {
//   const toRad = (value) => (value * Math.PI) / 180;
//   const R = 6371;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a = Math.sin(dLat / 2) ** 2 +
//             Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//             Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// exports.getArtisans = async (req, res) => {
//   try {
//     const { lat, lng, category, minRating, maxPrice, search } = req.query;
//     const where = {
//       role: 'ARTISAN',
//       isEmailVerified: true,
//       artisanProfile: { isApproved: true },
//     };
//     if (category && category !== 'All') {
//       where.artisanProfile = { ...where.artisanProfile, serviceCategory: category.toUpperCase() };
//     }
//     if (search && search.trim()) {
//       const searchLower = search.toLowerCase();
//       const matchedCategory = Object.values(ServiceCategory).find(cat =>
//         cat.toLowerCase().includes(searchLower)
//       );
//       if (matchedCategory) {
//         where.artisanProfile = { ...where.artisanProfile, serviceCategory: matchedCategory };
//       } else {
//         where.name = { contains: search, mode: 'insensitive' };
//       }
//     }
//     if (minRating) {
//       where.artisanProfile = { ...where.artisanProfile, averageRating: { gte: parseFloat(minRating) } };
//     }
//     if (maxPrice) {
//       where.artisanProfile = { ...where.artisanProfile, hourlyRate: { lte: parseFloat(maxPrice) } };
//     }
//     const users = await prisma.user.findMany({
//       where,
//       select: {
//         id: true,
//         name: true,
//         profileImage: true,
//         artisanProfile: {
//           select: {
//             serviceCategory: true,
//             bio: true,
//             hourlyRate: true,
//             averageRating: true,
//             totalJobs: true,
//             latitude: true,
//             longitude: true,
//             address: true,
//           },
//         },
//       },
//     });
//     let artisans = users.map(u => ({ ...u, distance: null }));
//     if (lat && lng) {
//       const latNum = parseFloat(lat);
//       const lngNum = parseFloat(lng);
//       artisans = artisans.map(a => {
//         if (a.artisanProfile?.latitude && a.artisanProfile?.longitude) {
//           const dist = getDistance(latNum, lngNum, a.artisanProfile.latitude, a.artisanProfile.longitude);
//           return { ...a, distance: dist };
//         }
//         return a;
//       });
//       artisans.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
//     }
//     res.json({ success: true, data: artisans });
//   } catch (error) {
//     console.error('getArtisans error:', error);
//     res.status(500).json({ success: false, error: error.message || 'Server error' });
//   }
// };

// exports.getArtisanDetails = async (req, res) => {
//   try {
//     const artisan = await prisma.user.findUnique({
//       where: { id: req.params.id, role: 'ARTISAN' },
//       include: {
//         artisanProfile: true,
//         reviewsReceived: {
//           include: { author: { select: { name: true, profileImage: true } } },
//           orderBy: { createdAt: 'desc' },
//         },
//       },
//     });
//     if (!artisan) return res.status(404).json({ success: false, error: 'Artisan not found' });
//     res.json({ success: true, data: artisan });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// exports.createBooking = async (req, res) => {
//   try {
//     const { artisanId, serviceType, description, scheduledDate, address, latitude, longitude, estimatedPrice } = req.body;
//     const booking = await prisma.booking.create({
//       data: {
//         clientId: req.user.id,        // ✅ FIXED
//         artisanId,
//         serviceType,
//         description,
//         scheduledDate: new Date(scheduledDate),
//         address,
//         latitude: latitude || 0,
//         longitude: longitude || 0,
//         estimatedPrice,
//         status: 'PENDING',
//       },
//     });
//     await prisma.conversation.create({
//       data: { bookingId: booking.id },
//     });
//     res.json({ success: true, data: booking });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// exports.getClientBookings = async (req, res) => {
//   try {
//     const bookings = await prisma.booking.findMany({
//       where: { clientId: req.user.id },   // ✅ FIXED
//       include: {
//         artisan: { select: { id: true, name: true, profileImage: true } },
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

// exports.addReview = async (req, res) => {
//   try {
//     const { bookingId, rating, comment } = req.body;
//     const booking = await prisma.booking.findFirst({
//       where: { id: bookingId, clientId: req.user.id, status: 'COMPLETED' },
//     });
//     if (!booking) {
//       return res.status(403).json({ success: false, error: 'Cannot review this booking' });
//     }
//     const existingReview = await prisma.review.findUnique({
//       where: { bookingId },
//     });
//     if (existingReview) {
//       return res.status(400).json({ success: false, error: 'You have already reviewed this job' });
//     }
//     const review = await prisma.review.create({
//       data: {
//         bookingId,
//         authorId: req.user.id,
//         recipientId: booking.artisanId,
//         rating,
//         comment,
//       },
//     });
//     const avg = await prisma.review.aggregate({
//       where: { recipientId: booking.artisanId },
//       _avg: { rating: true },
//     });
//     await prisma.artisanProfile.update({
//       where: { userId: booking.artisanId },
//       data: { averageRating: avg._avg.rating },
//     });
//     res.json({ success: true, data: review });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };