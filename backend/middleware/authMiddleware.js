const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'multivendor_secret_jwt_key_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found with this token' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }

      req.user = user;

      // If user is a vendor, attach vendor document
      if (user.role === 'vendor') {
        const vendor = await Vendor.findOne({ user: user._id });
        if (vendor) {
          req.vendor = vendor;
        }
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

// Ensure vendor is approved
const requireApprovedVendor = (req, res, next) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied. Vendor role required' });
  }
  if (!req.vendor) {
    return res.status(404).json({ success: false, message: 'Vendor profile not found. Please complete registration.' });
  }
  if (req.vendor.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: `Your vendor account status is '${req.vendor.status}'. Store features are unlocked once approved by Admin.`,
      status: req.vendor.status,
    });
  }
  next();
};

module.exports = { protect, authorize, requireApprovedVendor };
