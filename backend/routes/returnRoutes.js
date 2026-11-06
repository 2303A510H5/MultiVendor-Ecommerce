const express = require('express');
const router = express.Router();
const {
  createReturnRequest,
  getMyReturns,
  getVendorReturns,
  updateReturnStatus,
  getAllReturnsAdmin,
} = require('../controllers/returnController');
const { protect, authorize, requireApprovedVendor } = require('../middleware/authMiddleware');

router.post('/', protect, createReturnRequest);
router.get('/my-returns', protect, getMyReturns);
router.get('/vendor/all', protect, authorize('vendor'), requireApprovedVendor, getVendorReturns);
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateReturnStatus);
router.get('/admin/all', protect, authorize('admin'), getAllReturnsAdmin);

module.exports = router;
