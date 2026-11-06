const Address = require('../models/Address');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');

// ================= ADDRESS MANAGEMENT =================
const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, count: addresses.length, addresses });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, city, state, postalCode, country, addressType, isDefault } = req.body;

    // If first address, make default
    const count = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = count === 0 ? true : Boolean(isDefault);

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country: country || 'India',
      addressType: addressType || 'Home',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({ success: true, message: 'Address added successfully', address });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const { fullName, phone, street, city, state, postalCode, country, addressType, isDefault } = req.body;

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (addressType) address.addressType = addressType;
    if (isDefault !== undefined) address.isDefault = Boolean(isDefault);

    await address.save();
    res.json({ success: true, message: 'Address updated successfully', address });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ================= WISHLIST =================
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price discountPrice stock images rating numReviews vendor',
      populate: { path: 'vendor', select: 'storeName' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json({ success: true, count: wishlist.products.length, products: wishlist.products });
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex((p) => p.toString() === productId);
    let action = '';

    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.products.push(productId);
      action = 'added';
    }

    await wishlist.save();

    res.json({
      success: true,
      message: `Product ${action} wishlist`,
      isInWishlist: action === 'added',
      productsCount: wishlist.products.length,
    });
  } catch (error) {
    next(error);
  }
};

// ================= NOTIFICATIONS =================
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  getMyNotifications,
  markNotificationRead,
};
