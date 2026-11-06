const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// Helper to build date range filter
const buildDateFilter = (startDate, endDate, dateField = 'createdAt') => {
  const filter = {};
  if (startDate || endDate) {
    filter[dateField] = {};
    if (startDate) {
      filter[dateField].$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter[dateField].$lte = end;
    }
  }
  return filter;
};

// ==========================================
// REPORT 1: SALES REPORT
// ==========================================
// @desc    Sales Report (Total sales, revenue, orders, monthly/daily breakdown, product-wise sales, trends)
// @route   GET /api/reports/sales
// @access  Private (Admin or Vendor for own sales)
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, vendorId } = req.query;
    const isVendor = req.user.role === 'vendor';
    const effectiveVendorId = isVendor && req.vendor ? req.vendor._id : (vendorId ? new mongoose.Types.ObjectId(vendorId) : null);

    // If scoped to a vendor, calculate from VendorOrder
    if (effectiveVendorId) {
      const matchCriteria = {
        vendor: new mongoose.Types.ObjectId(effectiveVendorId),
        status: { $ne: 'Cancelled' },
        ...buildDateFilter(startDate, endDate),
      };

      const summary = await VendorOrder.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$subtotal' },
            totalOrders: { $sum: 1 },
            platformCommission: { $sum: '$commissionAmount' },
            vendorEarnings: { $sum: '$vendorEarnings' },
          },
        },
      ]);

      const monthlySales = await VendorOrder.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            sales: { $sum: '$subtotal' },
            earnings: { $sum: '$vendorEarnings' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const dailyTrends = await VendorOrder.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$subtotal' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Product-wise sales for this vendor
      const productSales = await Product.find({ vendor: effectiveVendorId })
        .select('name price unitsSold stock')
        .sort({ unitsSold: -1 })
        .limit(10);

      return res.json({
        success: true,
        summary: summary[0] || { totalSales: 0, totalOrders: 0, platformCommission: 0, vendorEarnings: 0 },
        monthlySales: monthlySales.map((m) => ({
          name: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          sales: m.sales,
          earnings: m.earnings,
          orders: m.orders,
        })),
        dailyTrends: dailyTrends.map((d) => ({ date: d._id, sales: d.sales, orders: d.orders })),
        productSales,
      });
    }

    // Platform-wide Sales Report for Admin
    const matchCriteria = {
      orderStatus: { $ne: 'Cancelled' },
      ...buildDateFilter(startDate, endDate),
    };

    const summary = await Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          itemsPrice: { $sum: '$itemsPrice' },
          shippingFee: { $sum: '$shippingFee' },
          discountAmount: { $sum: '$discountAmount' },
        },
      },
    ]);

    // Calculate platform commission from vendor orders
    const commissionSummary = await VendorOrder.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          ...buildDateFilter(startDate, endDate),
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$commissionAmount' },
          totalVendorEarnings: { $sum: '$vendorEarnings' },
        },
      },
    ]);

    const monthlySales = await Order.aggregate([
      { $match: matchCriteria },
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
    ]);

    const dailyTrends = await Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productSales = await Product.find({ isActive: true })
      .populate('vendor', 'storeName')
      .select('name price unitsSold stock vendor')
      .sort({ unitsSold: -1 })
      .limit(10);

    res.json({
      success: true,
      summary: {
        totalSales: summary[0] ? summary[0].totalSales : 0,
        totalOrders: summary[0] ? summary[0].totalOrders : 0,
        totalRevenue: commissionSummary[0] ? commissionSummary[0].totalCommission : 0,
        vendorEarnings: commissionSummary[0] ? commissionSummary[0].totalVendorEarnings : 0,
      },
      monthlySales: monthlySales.map((m) => ({
        name: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        sales: m.sales,
        orders: m.orders,
      })),
      dailyTrends: dailyTrends.map((d) => ({ date: d._id, sales: d.sales, orders: d.orders })),
      productSales,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REPORT 2: VENDOR-WISE SALES REPORT
// ==========================================
// @desc    Vendor-wise sales report with comparison
// @route   GET /api/reports/vendor-sales
// @access  Private (Admin or Vendor)
const getVendorSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const isVendor = req.user.role === 'vendor';

    const matchCriteria = {
      status: { $ne: 'Cancelled' },
      ...buildDateFilter(startDate, endDate),
    };

    if (isVendor && req.vendor) {
      matchCriteria.vendor = new mongoose.Types.ObjectId(req.vendor._id);
    }

    const vendorReport = await VendorOrder.aggregate([
      { $match: matchCriteria },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            vendor: '$vendor',
            orderId: '$_id',
          },
          subtotal: { $first: '$subtotal' },
          commissionAmount: { $first: '$commissionAmount' },
          vendorEarnings: { $first: '$vendorEarnings' },
          itemsCount: { $sum: '$items.quantity' },
        },
      },
      {
        $group: {
          _id: '$_id.vendor',
          totalOrders: { $sum: 1 },
          grossSales: { $sum: '$subtotal' },
          platformCommission: { $sum: '$commissionAmount' },
          vendorEarnings: { $sum: '$vendorEarnings' },
          productsSold: { $sum: '$itemsCount' },
        },
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorDetails',
        },
      },
      { $unwind: '$vendorDetails' },
      {
        $project: {
          vendorId: '$_id',
          vendorName: '$vendorDetails.storeName',
          storeName: '$vendorDetails.storeName',
          businessEmail: '$vendorDetails.businessEmail',
          commissionRate: '$vendorDetails.commissionRate',
          totalOrders: 1,
          productsSold: 1,
          grossSales: 1,
          platformCommission: 1,
          vendorEarnings: 1,
        },
      },
      { $sort: { grossSales: -1 } },
    ]);

    res.json({
      success: true,
      count: vendorReport.length,
      vendors: vendorReport,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REPORT 3: ORDER REPORT
// ==========================================
// @desc    Comprehensive Order Report with filters (date, vendor, status)
// @route   GET /api/reports/orders
// @access  Private (Admin or Vendor)
const getOrderReport = async (req, res, next) => {
  try {
    const { startDate, endDate, vendorId, status, paymentStatus, search } = req.query;
    const isVendor = req.user.role === 'vendor';

    // If requested by a Vendor, report is filtered through VendorOrder
    if (isVendor && req.vendor) {
      const query = {
        vendor: req.vendor._id,
        ...buildDateFilter(startDate, endDate),
      };

      if (status && status !== 'all') query.status = status;
      if (search) query.subOrderNumber = { $regex: search, $options: 'i' };

      const subOrders = await VendorOrder.find(query)
        .populate('customer', 'name email phone')
        .populate('parentOrder', 'orderNumber paymentMethod paymentStatus shippingAddress')
        .sort({ createdAt: -1 });

      const formatted = subOrders.map((so) => ({
        orderId: so.subOrderNumber,
        parentOrderId: so.parentOrder ? so.parentOrder.orderNumber : 'N/A',
        customerName: so.customer ? so.customer.name : 'Unknown',
        orderDate: so.createdAt,
        productsCount: so.items.length,
        productNames: so.items.map((i) => `${i.name} (x${i.quantity})`).join(', '),
        vendorName: req.vendor.storeName,
        orderAmount: so.subtotal,
        commission: so.commissionAmount,
        vendorEarnings: so.vendorEarnings,
        paymentMethod: so.parentOrder ? so.parentOrder.paymentMethod : 'N/A',
        paymentStatus: so.parentOrder ? so.parentOrder.paymentStatus : 'N/A',
        orderStatus: so.status,
        deliveryStatus: so.status,
      }));

      return res.json({
        success: true,
        count: formatted.length,
        orders: formatted,
      });
    }

    // Platform-wide Order Report for Admin
    const query = {
      ...buildDateFilter(startDate, endDate),
    };

    if (status && status !== 'all') query.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate({
        path: 'subOrders',
        populate: { path: 'vendor', select: 'storeName' },
      })
      .sort({ createdAt: -1 });

    const formatted = orders.map((o) => {
      const vendorNames = Array.from(
        new Set(
          (o.subOrders || [])
            .map((so) => (so.vendor ? so.vendor.storeName : null))
            .filter(Boolean)
        )
      ).join(', ');

      return {
        orderId: o.orderNumber,
        customerName: o.customer ? o.customer.name : 'Customer',
        customerEmail: o.customer ? o.customer.email : '',
        orderDate: o.createdAt,
        productsCount: o.items.length,
        productNames: o.items.map((i) => `${i.name} (x${i.quantity})`).join(', '),
        vendorName: vendorNames || 'Direct',
        orderAmount: o.totalAmount,
        itemsPrice: o.itemsPrice,
        shippingFee: o.shippingFee,
        discountAmount: o.discountAmount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        deliveryStatus: o.orderStatus,
        destinationCity: o.shippingAddress ? o.shippingAddress.city : 'N/A',
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      orders: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REPORT 4: INVENTORY REPORT
// ==========================================
// @desc    Inventory Report (stock, units sold, low-stock alerts, valuation)
// @route   GET /api/reports/inventory
// @access  Private (Admin or Vendor)
const getInventoryReport = async (req, res, next) => {
  try {
    const { category, vendorId, stockStatus, search } = req.query;
    const isVendor = req.user.role === 'vendor';

    const query = {};

    if (isVendor && req.vendor) {
      query.vendor = req.vendor._id;
    } else if (vendorId) {
      query.vendor = vendorId;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (stockStatus === 'out_of_stock') {
      query.stock = 0;
    } else if (stockStatus === 'low_stock') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    } else if (stockStatus === 'in_stock') {
      query.$expr = { $gt: ['$stock', '$lowStockThreshold'] };
    }

    const products = await Product.find(query)
      .populate('vendor', 'storeName')
      .populate('category', 'name')
      .sort({ stock: 1 });

    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockUnits = 0;

    const inventoryItems = products.map((p) => {
      const price = p.discountPrice > 0 ? p.discountPrice : p.price;
      const valuation = price * p.stock;
      totalValuation += valuation;
      totalStockUnits += p.stock;

      const isOutOfStock = p.stock === 0;
      const isLowStock = p.stock > 0 && p.stock <= p.lowStockThreshold;

      if (isOutOfStock) outOfStockCount++;
      if (isLowStock) lowStockCount++;

      return {
        _id: p._id,
        productName: p.name,
        sku: p.sku,
        vendorName: p.vendor ? p.vendor.storeName : 'Platform',
        categoryName: p.category ? p.category.name : 'Uncategorized',
        price,
        availableStock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        unitsSold: p.unitsSold,
        inventoryValuation: valuation,
        stockStatus: isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock Alert' : 'In Stock'),
        isActive: p.isActive,
      };
    });

    res.json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalStockUnits,
        totalValuation,
        lowStockCount,
        outOfStockCount,
      },
      inventory: inventoryItems,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REPORT 5: PAYMENT REPORT
// ==========================================
// @desc    Payment Report (Transactions, Order ID, Customer, Method, Amount, Status, Refunds)
// @route   GET /api/reports/payments
// @access  Private (Admin)
const getPaymentReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status, paymentMethod, search } = req.query;

    const query = {
      ...buildDateFilter(startDate, endDate, 'paymentDate'),
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.transactionId = { $regex: search, $options: 'i' };
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .populate('order', 'orderNumber orderStatus shippingAddress')
      .sort({ paymentDate: -1 });

    let totalAmount = 0;
    let successfulAmount = 0;
    let refundedAmount = 0;
    const statusCounts = {
      Pending: 0,
      Successful: 0,
      Failed: 0,
      Refunded: 0,
      'Partially Refunded': 0,
    };

    const formattedPayments = payments.map((p) => {
      totalAmount += p.amount;
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }

      if (p.status === 'Successful') {
        successfulAmount += p.amount;
      } else if (p.status === 'Refunded' || p.status === 'Partially Refunded') {
        const itemRefunded = (p.refunds || []).reduce((acc, r) => acc + r.amount, 0);
        refundedAmount += itemRefunded || p.amount;
      }

      return {
        transactionId: p.transactionId,
        orderId: p.order ? p.order.orderNumber : 'N/A',
        customerName: p.user ? p.user.name : 'Customer',
        customerEmail: p.user ? p.user.email : '',
        paymentMethod: p.paymentMethod,
        transactionAmount: p.amount,
        currency: p.currency,
        paymentDate: p.paymentDate,
        paymentStatus: p.status,
        refundStatus: (p.refunds && p.refunds.length > 0) ? `Refunded (${p.refunds.length})` : (p.status === 'Refunded' ? 'Refunded' : 'None'),
        refunds: p.refunds || [],
      };
    });

    res.json({
      success: true,
      summary: {
        totalTransactions: payments.length,
        totalAmount,
        successfulAmount,
        refundedAmount,
        statusCounts,
      },
      payments: formattedPayments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getVendorSalesReport,
  getOrderReport,
  getInventoryReport,
  getPaymentReport,
};
