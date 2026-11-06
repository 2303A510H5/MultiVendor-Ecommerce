const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize, requireApprovedVendor } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/vendor/my-products', protect, authorize('vendor'), requireApprovedVendor, getVendorProducts);
router.get('/:id', getProductById);

router.post('/', protect, authorize('vendor'), requireApprovedVendor, createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
