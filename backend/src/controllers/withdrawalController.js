const prisma = require('../../prisma/client');

exports.getBankAccount = async (req, res) => {
  try {
    const account = await prisma.bankAccount.findUnique({
      where: { userId: req.user.id },
    });
    res.json({ success: true, data: account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.saveBankAccount = async (req, res) => {
  try {
    const { accountName, bankName, accountNumber } = req.body;
    if (!accountName || !bankName || !accountNumber) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }
    const account = await prisma.bankAccount.upsert({
      where: { userId: req.user.id },
      update: { accountName, bankName, accountNumber },
      create: {
        userId: req.user.id,
        accountName,
        bankName,
        accountNumber,
      },
    });
    res.json({ success: true, data: account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteBankAccount = async (req, res) => {
  try {
    await prisma.bankAccount.delete({
      where: { userId: req.user.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.createWithdrawalRequest = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }
    // Check if user has bank account
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { userId: req.user.id },
    });
    if (!bankAccount) {
      return res.status(400).json({ success: false, error: 'Please add a bank account first' });
    }
    // Check balance (total earnings from completed jobs)
    const earnings = await prisma.booking.aggregate({
      where: { artisanId: req.user.id, status: 'COMPLETED', finalPrice: { not: null } },
      _sum: { finalPrice: true },
    });
    const balance = earnings._sum.finalPrice || 0;
    if (amount > balance) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId: req.user.id,
        amount,
        bankAccountId: bankAccount.id,
        status: 'PENDING',
      },
    });
    res.json({ success: true, data: withdrawal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  try {
    const requests = await prisma.withdrawalRequest.findMany({
      where: { userId: req.user.id },
      include: { bankAccount: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};