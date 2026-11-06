const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getVendorOrders,
  updateVendorOrderStatus,
  getAllOrdersAdmin,
} = require('../controllers/orderController');
const { protect, authorize, requireApprovedVendor } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/vendor/all', protect, authorize('vendor'), requireApprovedVendor, getVendorOrders);
router.put('/vendor/:id/status', protect, authorize('vendor', 'admin'), updateVendorOrderStatus);
router.get('/admin/all', protect, authorize('admin'), getAllOrdersAdmin);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
