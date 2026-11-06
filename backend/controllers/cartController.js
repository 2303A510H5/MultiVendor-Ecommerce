const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to calculate totals
const calculateCartTotals = (items) => {
  let subtotal = 0;
  let itemsCount = 0;

  for (const item of items) {
    if (item.product) {
      const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      subtotal += price * item.quantity;
      itemsCount += item.quantity;
    }
  }

  // Shipping flat 50 INR or free over 1000 INR
  const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + shippingFee;

  return { subtotal, shippingFee, grandTotal, itemsCount };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug price discountPrice stock images isActive vendor',
        populate: {
          path: 'vendor',
          select: 'storeName storeLogo rating',
        },
      })
      .populate('items.vendor', 'storeName storeLogo');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out inactive products or deleted ones if any
    cart.items = cart.items.filter((item) => item.product && item.product.isActive);

    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        ...totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or currently unavailable' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. You have ${cart.items[existingIndex].quantity} in cart and only ${product.stock} are in stock.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = itemPrice;
    } else {
      cart.items.push({
        product: product._id,
        vendor: product.vendor,
        quantity: Number(quantity),
        price: itemPrice,
      });
    }

    await cart.save();

    // Populate for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug price discountPrice stock images isActive vendor',
      populate: { path: 'vendor', select: 'storeName storeLogo rating' },
    });

    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      message: 'Product added to cart',
      cart: {
        _id: cart._id,
        items: cart.items,
        ...totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of item in cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug price discountPrice stock images isActive vendor',
      populate: { path: 'vendor', select: 'storeName storeLogo rating' },
    });

    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        ...totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug price discountPrice stock images isActive vendor',
      populate: { path: 'vendor', select: 'storeName storeLogo rating' },
    });

    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        _id: cart._id,
        items: cart.items,
        ...totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({
      success: true,
      message: 'Cart cleared',
      cart: { items: [], subtotal: 0, shippingFee: 0, grandTotal: 0, itemsCount: 0 },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
