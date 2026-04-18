const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getBankAccount,
  saveBankAccount,
  deleteBankAccount,
  createWithdrawalRequest,
  getWithdrawalHistory,
} = require('../controllers/withdrawalController');

router.use(authenticate);

router.get('/bank-account', getBankAccount);
router.post('/bank-account', saveBankAccount);
router.delete('/bank-account', deleteBankAccount);
router.post('/requests', createWithdrawalRequest);
router.get('/requests', getWithdrawalHistory);

module.exports = router;