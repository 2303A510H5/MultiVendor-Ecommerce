const Return = require('../models/Return');
const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @desc    Submit return request
// @route   POST /api/returns
// @access  Private (Customer)
const createReturnRequest = async (req, res, next) => {
  try {
    const { orderId, vendorOrderId, productId, quantity = 1, reason, detailedExplanation, images } = req.body;

    if (!orderId || !vendorOrderId || !productId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderId, vendorOrderId, productId, and a valid reason',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    const vendorOrder = await VendorOrder.findById(vendorOrderId);
    if (!vendorOrder) {
      return res.status(404).json({ success: false, message: 'Vendor suborder not found' });
    }

    // Check if item exists in vendor suborder
    const item = vendorOrder.items.find(
      (it) => it.product.toString() === productId.toString()
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found in this suborder' });
    }

    // Check if return request already exists
    const existingReturn = await Return.findOne({
      order: orderId,
      product: productId,
      status: { $nin: ['Rejected'] },
    });
    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: 'A return request for this item is already submitted or in progress',
      });
    }

    const refundAmount = item.price * Number(quantity);

    const returnReq = await Return.create({
      order: orderId,
      vendorOrder: vendorOrderId,
      customer: req.user._id,
      vendor: vendorOrder.vendor,
      product: productId,
      quantity: Number(quantity),
      reason,
      detailedExplanation: detailedExplanation || '',
      images: images || [],
      refundAmount,
      status: 'Pending',
    });

    // Update vendor suborder status
    vendorOrder.status = 'Return Requested';
    vendorOrder.statusHistory.push({
      status: 'Return Requested',
      timestamp: new Date(),
      note: `Customer requested return: ${reason}`,
    });
    await vendorOrder.save();

    // Update parent order status
    order.orderStatus = 'Return Requested';
    order.statusHistory.push({
      status: 'Return Requested',
      timestamp: new Date(),
      note: `Return requested for item ${item.name}`,
      updatedBy: req.user.name,
    });
    await order.save();

    // Notify vendor
    await Notification.create({
      user: vendorOrder.vendor,
      title: 'New Return Request',
      message: `Customer requested a return on suborder #${vendorOrder.subOrderNumber}. Reason: ${reason}`,
      type: 'return',
      link: '/vendor/returns',
    });

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully',
      returnRequest: returnReq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's return requests
// @route   GET /api/returns/my-returns
// @access  Private (Customer)
const getMyReturns = async (req, res, next) => {
  try {
    const returns = await Return.find({ customer: req.user._id })
      .populate('order', 'orderNumber createdAt')
      .populate('vendorOrder', 'subOrderNumber')
      .populate('product', 'name price images')
      .populate('vendor', 'storeName storeLogo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor's return requests
// @route   GET /api/returns/vendor/returns
// @access  Private (Vendor)
const getVendorReturns = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(403).json({ success: false, message: 'Vendor profile not found' });
    }

    const returns = await Return.find({ vendor: req.vendor._id })
      .populate('customer', 'name email phone avatar')
      .populate('order', 'orderNumber paymentMethod createdAt')
      .populate('vendorOrder', 'subOrderNumber')
      .populate('product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update return request status (Vendor or Admin)
// @route   PUT /api/returns/:id/status
// @access  Private (Vendor or Admin)
const updateReturnStatus = async (req, res, next) => {
  try {
    const { status, comments, refundTransactionId } = req.body;
    const returnReq = await Return.findById(req.params.id)
      .populate('vendor')
      .populate('order');

    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    // Role check
    if (
      req.user.role !== 'admin' &&
      (!req.vendor || returnReq.vendor._id.toString() !== req.vendor._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this return' });
    }

    returnReq.status = status;
    if (req.user.role === 'admin') {
      returnReq.adminComments = comments || returnReq.adminComments;
    } else {
      returnReq.vendorComments = comments || returnReq.vendorComments;
    }

    if (refundTransactionId) {
      returnReq.refundTransactionId = refundTransactionId;
    }

    // If status marked as Refunded
    if (status === 'Refunded') {
      const refundId = refundTransactionId || `REF-${Date.now()}`;
      returnReq.refundTransactionId = refundId;

      // Update payment record with refund
      await Payment.findOneAndUpdate(
        { order: returnReq.order._id },
        {
          status: 'Refunded',
          $push: {
            refunds: {
              refundId,
              amount: returnReq.refundAmount,
              status: 'Refunded',
              reason: returnReq.reason,
              createdAt: new Date(),
            },
          },
        }
      );

      // Update suborder and parent order
      await VendorOrder.findByIdAndUpdate(returnReq.vendorOrder, {
        status: 'Refunded',
        $push: {
          statusHistory: {
            status: 'Refunded',
            timestamp: new Date(),
            note: `Refund of ₹${returnReq.refundAmount} issued. Ref: ${refundId}`,
          },
        },
      });

      await Order.findByIdAndUpdate(returnReq.order._id, {
        orderStatus: 'Refunded',
        paymentStatus: 'Refunded',
        $push: {
          statusHistory: {
            status: 'Refunded',
            timestamp: new Date(),
            note: `Refund of ₹${returnReq.refundAmount} successfully processed`,
            updatedBy: req.user.name,
          },
        },
      });
    } else if (status === 'Approved') {
      await VendorOrder.findByIdAndUpdate(returnReq.vendorOrder, {
        status: 'Returned',
      });
    }

    await returnReq.save();

    // Notify customer
    await Notification.create({
      user: returnReq.customer,
      title: `Return Request ${status}`,
      message: `Your return request for product has been updated to '${status}'. ${comments ? `Note: ${comments}` : ''}`,
      type: 'return',
      link: '/profile',
    });

    res.json({
      success: true,
      message: `Return request status updated to ${status}`,
      returnRequest: returnReq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all returns for Admin
// @route   GET /api/returns/admin/all
// @access  Private (Admin)
const getAllReturnsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Return.countDocuments(query);
    const returns = await Return.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('vendor', 'storeName businessEmail')
      .populate('order', 'orderNumber totalAmount paymentMethod')
      .populate('product', 'name price images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: returns.length,
      total,
      returns,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReturnRequest,
  getMyReturns,
  getVendorReturns,
  updateReturnStatus,
  getAllReturnsAdmin,
};
