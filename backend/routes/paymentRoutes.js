const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getMyPayments,
  getAllPaymentsAdmin,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/admin/all', protect, authorize('admin'), getAllPaymentsAdmin);

module.exports = router;
