const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Vendor = require('../models/Vendor');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

// @desc    Create new multi-vendor order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, notes } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Please provide complete shipping address' });
    }

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'vendor' },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
    }

    // Validate inventory and prepare items
    const orderItems = [];
    const vendorBuckets = {}; // Group items by vendorId

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product '${item.product.name}' is no longer available. Please remove from cart.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, in cart: ${item.quantity}`,
        });
      }

      const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      const subtotal = itemPrice * item.quantity;
      const vendorId = product.vendor.toString();

      const orderItem = {
        product: product._id,
        vendor: product.vendor,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        subtotal,
      };

      orderItems.push(orderItem);

      if (!vendorBuckets[vendorId]) {
        vendorBuckets[vendorId] = [];
      }
      vendorBuckets[vendorId].push(orderItem);

      // Deduct inventory and update units sold
      product.stock -= item.quantity;
      product.unitsSold += item.quantity;
      await product.save();
    }

    const itemsPrice = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
    const shippingFee = itemsPrice > 1000 ? 0 : 50;
    let discountAmount = 0;

    // Optional coupon check
    if (couponCode && couponCode.toUpperCase() === 'WELCOME10') {
      discountAmount = Math.min(Math.round(itemsPrice * 0.1), 500);
    }

    const totalAmount = Math.max(0, itemsPrice + shippingFee - discountAmount);
    const orderNumber = generateOrderNumber();

    const isOnlinePayment = paymentMethod === 'Razorpay' || paymentMethod === 'Card' || paymentMethod === 'UPI';
    const initialPaymentStatus = isOnlinePayment ? 'Successful' : 'Pending';
    const initialOrderStatus = 'Confirmed';

    // Create Parent Order
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Razorpay',
      paymentStatus: initialPaymentStatus,
      paymentResult: {
        id: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: initialPaymentStatus,
        updateTime: new Date().toISOString(),
        paymentGateway: paymentMethod === 'Cash on Delivery' ? 'COD' : 'Razorpay Sandbox',
      },
      itemsPrice,
      shippingFee,
      discountAmount,
      couponApplied: couponCode || '',
      totalAmount,
      orderStatus: initialOrderStatus,
      statusHistory: [
        {
          status: 'Confirmed',
          timestamp: new Date(),
          note: `Order placed via ${paymentMethod || 'Razorpay'}`,
          updatedBy: req.user.name,
        },
      ],
    });

    // Create Vendor-specific Suborders
    const subOrderIds = [];
    let subOrderIndex = 1;

    for (const [vendorId, vItems] of Object.entries(vendorBuckets)) {
      const vendorDoc = await Vendor.findById(vendorId);
      const commissionRate = vendorDoc ? vendorDoc.commissionRate || 10 : 10;
      const vSubtotal = vItems.reduce((sum, it) => sum + it.subtotal, 0);
      const commissionAmount = Math.round((vSubtotal * commissionRate) / 100);
      const vendorEarnings = vSubtotal - commissionAmount;

      const subOrder = await VendorOrder.create({
        subOrderNumber: `${orderNumber}-V${subOrderIndex++}`,
        parentOrder: order._id,
        vendor: vendorId,
        customer: req.user._id,
        items: vItems,
        subtotal: vSubtotal,
        commissionRate,
        commissionAmount,
        vendorEarnings,
        status: 'Confirmed',
        statusHistory: [
          {
            status: 'Confirmed',
            timestamp: new Date(),
            note: 'Order confirmed by customer purchase',
          },
        ],
      });

      subOrderIds.push(subOrder._id);

      // Update vendor stats
      if (vendorDoc) {
        vendorDoc.totalSales += vSubtotal;
        vendorDoc.totalOrders += 1;
        vendorDoc.totalEarnings += vendorEarnings;
        await vendorDoc.save();

        // Notify vendor
        await Notification.create({
          user: vendorDoc.user,
          title: 'New Order Received',
          message: `You received suborder #${subOrder.subOrderNumber} worth ₹${vSubtotal}.`,
          type: 'order',
          link: '/vendor/orders',
        });
      }
    }

    // Link suborders to parent order
    order.subOrders = subOrderIds;
    await order.save();

    // Create Payment Record
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await Payment.create({
      order: order._id,
      user: req.user._id,
      transactionId,
      paymentMethod: paymentMethod || 'Razorpay',
      amount: totalAmount,
      currency: 'INR',
      status: initialPaymentStatus,
      paymentDate: new Date(),
    });

    // Clear customer cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate({
        path: 'subOrders',
        populate: { path: 'vendor', select: 'storeName storeLogo' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private (Customer, Vendor of suborder, or Admin)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate({
        path: 'subOrders',
        populate: { path: 'vendor', select: 'storeName storeLogo storeBanner businessPhone' },
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role verification
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer cancels order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('subOrders');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.orderStatus}' status. Items may have already shipped.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: reason || 'Customer requested cancellation',
      updatedBy: req.user.name,
    });

    if (order.paymentStatus === 'Successful') {
      order.paymentStatus = 'Refunded';
      // Record refund in Payment model
      await Payment.findOneAndUpdate(
        { order: order._id },
        {
          status: 'Refunded',
          $push: {
            refunds: {
              refundId: `REF-${Date.now()}`,
              amount: order.totalAmount,
              status: 'Refunded',
              reason: 'Order cancelled before dispatch',
              createdAt: new Date(),
            },
          },
        }
      );
    }

    await order.save();

    // Update all suborders and restore product inventory
    for (const subOrder of order.subOrders) {
      await VendorOrder.findByIdAndUpdate(subOrder._id, {
        status: 'Cancelled',
        $push: {
          statusHistory: {
            status: 'Cancelled',
            timestamp: new Date(),
            note: 'Order cancelled by customer',
          },
        },
      });

      // Restore vendor stats
      await Vendor.findByIdAndUpdate(subOrder.vendor, {
        $inc: {
          totalSales: -subOrder.subtotal,
          totalEarnings: -subOrder.vendorEarnings,
          totalOrders: -1,
        },
      });

      // Restore inventory
      for (const item of subOrder.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, unitsSold: -item.quantity },
        });
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully and refund processed if applicable',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor's suborders
// @route   GET /api/vendor/orders
// @access  Private (Vendor)
const getVendorOrders = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(403).json({ success: false, message: 'Vendor profile not found' });
    }

    const { status, search } = req.query;
    const query = { vendor: req.vendor._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.subOrderNumber = { $regex: search, $options: 'i' };
    }

    const subOrders = await VendorOrder.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('parentOrder', 'orderNumber shippingAddress paymentMethod paymentStatus')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subOrders.length,
      orders: subOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vendor updates status of their suborder
// @route   PUT /api/vendor/orders/:id/status
// @access  Private (Vendor or Admin)
const updateVendorOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber, shippingCarrier } = req.body;
    const validStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
      'Return Requested',
      'Returned',
      'Refund Processing',
      'Refunded',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const subOrder = await VendorOrder.findById(req.params.id);
    if (!subOrder) {
      return res.status(404).json({ success: false, message: 'Suborder not found' });
    }

    // Verify vendor ownership unless admin
    if (
      req.user.role !== 'admin' &&
      (!req.vendor || subOrder.vendor.toString() !== req.vendor._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this order' });
    }

    subOrder.status = status;
    if (trackingNumber) subOrder.trackingNumber = trackingNumber;
    if (shippingCarrier) subOrder.shippingCarrier = shippingCarrier;

    subOrder.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by vendor`,
    });

    await subOrder.save();

    // Notify customer
    await Notification.create({
      user: subOrder.customer,
      title: `Order Update: #${subOrder.subOrderNumber}`,
      message: `Your item(s) status changed to '${status}'. ${note ? `Note: ${note}` : ''}`,
      type: 'order',
      link: `/orders/${subOrder.parentOrder}`,
    });

    // Check parent order status
    const allSiblingSubOrders = await VendorOrder.find({ parentOrder: subOrder.parentOrder });
    const allStatuses = allSiblingSubOrders.map((so) => so.status);

    let parentStatus = status;
    if (allStatuses.every((s) => s === 'Delivered')) {
      parentStatus = 'Delivered';
      await Order.findByIdAndUpdate(subOrder.parentOrder, { deliveredAt: new Date() });
    } else if (allStatuses.every((s) => s === 'Cancelled')) {
      parentStatus = 'Cancelled';
    } else if (allStatuses.some((s) => s === 'Shipped')) {
      parentStatus = 'Shipped';
    } else if (allStatuses.some((s) => s === 'Processing')) {
      parentStatus = 'Processing';
    }

    await Order.findByIdAndUpdate(subOrder.parentOrder, {
      orderStatus: parentStatus,
      $push: {
        statusHistory: {
          status: parentStatus,
          timestamp: new Date(),
          note: `Suborder ${subOrder.subOrderNumber} set to ${status}`,
          updatedBy: req.user.name,
        },
      },
    });

    res.json({
      success: true,
      message: `Suborder status updated to ${status}`,
      subOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin view all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone avatar')
      .populate({
        path: 'subOrders',
        populate: { path: 'vendor', select: 'storeName' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getVendorOrders,
  updateVendorOrderStatus,
  getAllOrdersAdmin,
};
