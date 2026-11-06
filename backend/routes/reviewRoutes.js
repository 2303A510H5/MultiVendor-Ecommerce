const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getVendorReviews,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/product/:productId', getProductReviews);
router.get('/vendor/my-reviews', protect, authorize('vendor'), getVendorReviews);

module.exports = router;
