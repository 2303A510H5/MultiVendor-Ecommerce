const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Payment = require('../models/Payment');

// @desc    Get Admin Dashboard Platform Statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      pendingVendors,
      approvedVendors,
      totalProducts,
      totalOrders,
      lowStockProducts,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Vendor.countDocuments(),
      Vendor.countDocuments({ status: 'pending' }),
      Vendor.countDocuments({ status: 'approved' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
    ]);

    // Financial calculations
    const salesAggregation = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          grossSales: { $sum: '$totalAmount' },
        },
      },
    ]);

    const commissionAggregation = await VendorOrder.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          platformCommission: { $sum: '$commissionAmount' },
          vendorPayouts: { $sum: '$vendorEarnings' },
        },
      },
    ]);

    const grossSales = salesAggregation[0] ? salesAggregation[0].grossSales : 0;
    const platformCommission = commissionAggregation[0] ? commissionAggregation[0].platformCommission : 0;
    const vendorPayouts = commissionAggregation[0] ? commissionAggregation[0].vendorPayouts : 0;

    // Monthly revenue chart data (past 6-12 months)
    const monthlyData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueChart = monthlyData.map((m) => ({
      name: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      sales: m.sales,
      commission: Math.round(m.sales * 0.1), // average 10%
      orders: m.orders,
    }));

    // Top vendors
    const topVendors = await Vendor.find({ status: 'approved' })
      .select('storeName storeLogo rating totalSales totalOrders')
      .sort({ totalSales: -1 })
      .limit(5);

    // Recent 6 orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalVendors,
        pendingVendors,
        approvedVendors,
        totalProducts,
        totalOrders,
        lowStockProducts,
        grossSales,
        platformCommission,
        vendorPayouts,
      },
      revenueChart,
      topVendors,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for Admin
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active/Deactivated)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User '${user.name}' has been ${user.isActive ? 'activated' : 'deactivated'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllUsers,
  toggleUserStatus,
};
