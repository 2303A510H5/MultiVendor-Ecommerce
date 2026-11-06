const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @desc    Register a new vendor (store application)
// @route   POST /api/vendors/register
// @access  Private (or Public with new user registration)
const registerVendor = async (req, res, next) => {
  try {
    const {
      storeName,
      storeDescription,
      storeLogo,
      storeBanner,
      businessEmail,
      businessPhone,
      street,
      city,
      state,
      postalCode,
      country,
      bankAccountHolder,
      bankAccountNumber,
      bankIfsc,
      bankName,
    } = req.body;

    const existingVendor = await Vendor.findOne({
      $or: [{ user: req.user._id }, { storeName: { $regex: new RegExp(`^${storeName}$`, 'i') } }],
    });

    if (existingVendor) {
      if (existingVendor.user.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'You have already applied or registered as a vendor' });
      }
      return res.status(400).json({ success: false, message: 'Store name is already taken. Please choose another' });
    }

    // Update user role to vendor if not already
    await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

    const vendor = await Vendor.create({
      user: req.user._id,
      storeName,
      storeDescription: storeDescription || '',
      storeLogo: storeLogo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=250&q=80',
      storeBanner: storeBanner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      businessEmail: businessEmail || req.user.email,
      businessPhone: businessPhone || req.user.phone || '',
      address: {
        street: street || '',
        city: city || '',
        state: state || '',
        postalCode: postalCode || '',
        country: country || 'India',
      },
      bankDetails: {
        accountHolderName: bankAccountHolder || '',
        accountNumber: bankAccountNumber || '',
        ifscOrRouting: bankIfsc || '',
        bankName: bankName || '',
      },
      status: 'pending',
    });

    // Notify admins of new application
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Vendor Registration Application',
        message: `${storeName} has applied for a vendor account and awaits approval.`,
        type: 'vendor_approval',
        link: '/admin/vendors',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vendor application submitted successfully. It will be reviewed by the admin shortly.',
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vendors (public returns approved only, admin returns all)
// @route   GET /api/vendors
// @access  Public
const getAllVendors = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    // If request has no user or not admin, only show approved vendors
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'approved';
    } else if (status) {
      filter.status = status;
    }

    if (search) {
      filter.storeName = { $regex: search, $options: 'i' };
    }

    const vendors = await Vendor.find(filter)
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor storefront details with public products
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email avatar');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const products = await Product.find({
      vendor: vendor._id,
      isActive: true,
    }).populate('category', 'name slug');

    res.json({
      success: true,
      vendor,
      productsCount: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current vendor profile (for logged in vendor)
// @route   GET /api/vendors/me/profile
// @access  Private (Vendor)
const getMyVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    res.json({
      success: true,
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor profile / storefront
// @route   PUT /api/vendors/me/profile
// @access  Private (Vendor)
const updateVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const {
      storeName,
      storeDescription,
      storeLogo,
      storeBanner,
      businessEmail,
      businessPhone,
      street,
      city,
      state,
      postalCode,
      country,
      bankAccountHolder,
      bankAccountNumber,
      bankIfsc,
      bankName,
    } = req.body;

    if (storeName && storeName !== vendor.storeName) {
      const exists = await Vendor.findOne({ storeName: { $regex: new RegExp(`^${storeName}$`, 'i') } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Store name is already taken' });
      }
      vendor.storeName = storeName;
    }

    if (storeDescription !== undefined) vendor.storeDescription = storeDescription;
    if (storeLogo !== undefined) vendor.storeLogo = storeLogo;
    if (storeBanner !== undefined) vendor.storeBanner = storeBanner;
    if (businessEmail !== undefined) vendor.businessEmail = businessEmail;
    if (businessPhone !== undefined) vendor.businessPhone = businessPhone;

    if (street || city || state || postalCode || country) {
      vendor.address = {
        street: street !== undefined ? street : vendor.address.street,
        city: city !== undefined ? city : vendor.address.city,
        state: state !== undefined ? state : vendor.address.state,
        postalCode: postalCode !== undefined ? postalCode : vendor.address.postalCode,
        country: country !== undefined ? country : vendor.address.country,
      };
    }

    if (bankAccountHolder || bankAccountNumber || bankIfsc || bankName) {
      vendor.bankDetails = {
        accountHolderName: bankAccountHolder !== undefined ? bankAccountHolder : vendor.bankDetails.accountHolderName,
        accountNumber: bankAccountNumber !== undefined ? bankAccountNumber : vendor.bankDetails.accountNumber,
        ifscOrRouting: bankIfsc !== undefined ? bankIfsc : vendor.bankDetails.ifscOrRouting,
        bankName: bankName !== undefined ? bankName : vendor.bankDetails.bankName,
      };
    }

    const updatedVendor = await vendor.save();

    res.json({
      success: true,
      message: 'Storefront updated successfully',
      vendor: updatedVendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin approve vendor
// @route   PUT /api/vendors/:id/approve
// @access  Private (Admin)
const approveVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendor.status = 'approved';
    vendor.statusReason = 'Approved by administrator';
    if (req.body.commissionRate !== undefined) {
      vendor.commissionRate = req.body.commissionRate;
    }
    await vendor.save();

    // Create notification for vendor
    await Notification.create({
      user: vendor.user,
      title: 'Vendor Store Approved!',
      message: `Congratulations! Your store '${vendor.storeName}' has been approved. You can now add products and manage your storefront.`,
      type: 'vendor_approval',
      link: '/vendor/dashboard',
    });

    res.json({
      success: true,
      message: `Vendor '${vendor.storeName}' has been approved successfully.`,
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin reject vendor
// @route   PUT /api/vendors/:id/reject
// @access  Private (Admin)
const rejectVendor = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendor.status = 'rejected';
    vendor.statusReason = reason || 'Does not meet platform guidelines';
    await vendor.save();

    await Notification.create({
      user: vendor.user,
      title: 'Vendor Store Application Rejected',
      message: `Your store application '${vendor.storeName}' was rejected. Reason: ${vendor.statusReason}`,
      type: 'vendor_approval',
      link: '/profile',
    });

    res.json({
      success: true,
      message: `Vendor '${vendor.storeName}' has been rejected.`,
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin toggle vendor status (suspend/activate)
// @route   PUT /api/vendors/:id/toggle-status
// @access  Private (Admin)
const toggleVendorStatus = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (vendor.status === 'approved') {
      vendor.status = 'suspended';
      vendor.statusReason = req.body.reason || 'Suspended by admin for policy review';
    } else if (vendor.status === 'suspended') {
      vendor.status = 'approved';
      vendor.statusReason = 'Account reactivated by administrator';
    } else {
      return res.status(400).json({ success: false, message: `Cannot toggle vendor in '${vendor.status}' state. Use approve/reject instead.` });
    }

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor status changed to '${vendor.status}'`,
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerVendor,
  getAllVendors,
  getVendorById,
  getMyVendorProfile,
  updateVendorProfile,
  approveVendor,
  rejectVendor,
  toggleVendorStatus,
};
