const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAllUsers,
  toggleUserStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
