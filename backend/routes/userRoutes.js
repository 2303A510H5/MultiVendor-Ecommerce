const express = require('express');
const router = express.Router();
const {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  getMyNotifications,
  markNotificationRead,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/addresses', getMyAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);

router.get('/notifications', getMyNotifications);
router.put('/notifications/mark-read', markNotificationRead);

module.exports = router;
