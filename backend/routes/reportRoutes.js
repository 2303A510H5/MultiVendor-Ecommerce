const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getVendorSalesReport,
  getOrderReport,
  getInventoryReport,
  getPaymentReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/sales', protect, authorize('admin', 'vendor'), getSalesReport);
router.get('/vendor-sales', protect, authorize('admin', 'vendor'), getVendorSalesReport);
router.get('/orders', protect, authorize('admin', 'vendor'), getOrderReport);
router.get('/inventory', protect, authorize('admin', 'vendor'), getInventoryReport);
router.get('/payments', protect, authorize('admin'), getPaymentReport);

module.exports = router;
