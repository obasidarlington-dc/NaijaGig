const prisma = require('../../prisma/client');

exports.getPendingArtisans = async (req, res) => {
  try {
    const artisans = await prisma.user.findMany({
      where: { role: 'ARTISAN', artisanProfile: { isApproved: false } },
      include: { artisanProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: artisans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.approveArtisan = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true or false
    await prisma.artisanProfile.update({
      where: { userId: id },
      data: { isApproved: approved },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, bankAccount: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // status: COMPLETED, FAILED
    await prisma.withdrawalRequest.update({
      where: { id },
      data: { status, notes, processedAt: new Date() },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalArtisans = await prisma.user.count({ where: { role: 'ARTISAN' } });
    const totalClients = await prisma.user.count({ where: { role: 'CLIENT' } });
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    const pendingWithdrawals = await prisma.withdrawalRequest.count({ where: { status: 'PENDING' } });
    const earningsResult = await prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { finalPrice: true },
    });
    const totalEarnings = earningsResult._sum.finalPrice || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalArtisans,
        totalClients,
        totalBookings,
        completedBookings,
        pendingWithdrawals,
        totalEarnings,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { client: { select: { name: true, email: true } }, artisan: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};