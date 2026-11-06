const express = require('express');
const router = express.Router();
const {
  registerVendor,
  getAllVendors,
  getVendorById,
  getMyVendorProfile,
  updateVendorProfile,
  approveVendor,
  rejectVendor,
  toggleVendorStatus,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', protect, registerVendor);
router.get('/', getAllVendors);
router.get('/me/profile', protect, authorize('vendor'), getMyVendorProfile);
router.put('/me/profile', protect, authorize('vendor'), updateVendorProfile);
router.get('/:id', getVendorById);

// Admin routes
router.put('/:id/approve', protect, authorize('admin'), approveVendor);
router.put('/:id/reject', protect, authorize('admin'), rejectVendor);
router.put('/:id/toggle-status', protect, authorize('admin'), toggleVendorStatus);

module.exports = router;
