const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create product review
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide product, rating, and comment' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      vendor: product.vendor,
      rating: Number(rating),
      title: title || '',
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for vendor products
// @route   GET /api/reviews/vendor/my-reviews
// @access  Private (Vendor)
const getVendorReviews = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(403).json({ success: false, message: 'Vendor profile not found' });
    }

    const reviews = await Review.find({ vendor: req.vendor._id })
      .populate('user', 'name avatar')
      .populate('product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getVendorReviews,
};
