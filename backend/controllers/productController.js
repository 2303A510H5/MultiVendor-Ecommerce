const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// @desc    Get all active products with search, filter, sort, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      vendor,
      minPrice,
      maxPrice,
      minRating,
      sort,
      inStock,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Search keyword
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
      ];
    }

    // Category filter
    if (category) {
      // Check if it's an ObjectId or slug
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) query.category = catDoc._id;
      }
    }

    // Vendor filter
    if (vendor) {
      query.vendor = vendor;
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    // Minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // In stock filter
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1, numReviews: -1 };
    else if (sort === 'popular') sortOption = { unitsSold: -1, rating: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('vendor', 'storeName storeLogo rating')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .populate('vendor', 'storeName storeLogo rating')
      .limit(8);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const isId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: req.params.id } : { slug: req.params.id };

    const product = await Product.findOne(query)
      .populate('category', 'name slug description')
      .populate('vendor', 'storeName storeLogo storeBanner rating totalSales businessEmail address');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      product,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products belonging to current vendor
// @route   GET /api/products/vendor/my-products
// @access  Private (Vendor)
const getVendorProducts = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(403).json({ success: false, message: 'Vendor profile not found' });
    }

    const { keyword, category, status } = req.query;
    const query = { vendor: req.vendor._id };

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor)
const createProduct = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(403).json({ success: false, message: 'Only vendors can create products' });
    }

    const {
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      lowStockThreshold,
      images,
      tags,
      isFeatured,
    } = req.body;

    if (!name || !description || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, category, price, and stock quantity',
      });
    }

    // Default image fallback if none provided
    const productImages =
      images && images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'];

    const product = await Product.create({
      vendor: req.vendor._id,
      name,
      description,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: Number(stock),
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 10,
      images: productImages,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
      isFeatured: Boolean(isFeatured),
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor owner or Admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership unless admin
    if (
      req.user.role !== 'admin' &&
      (!req.vendor || product.vendor.toString() !== req.vendor._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this product' });
    }

    const {
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      lowStockThreshold,
      images,
      tags,
      isActive,
      isFeatured,
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (images && images.length > 0) product.images = images;
    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }
    if (isActive !== undefined) product.isActive = Boolean(isActive);
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor owner or Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership unless admin
    if (
      req.user.role !== 'admin' &&
      (!req.vendor || product.vendor.toString() !== req.vendor._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
