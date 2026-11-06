const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Initialize Razorpay client if keys exist
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc    Create Razorpay Order / Sandbox Payment intent
// @route   POST /api/payments/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    // If Razorpay keys exist, create via SDK
    if (razorpayInstance) {
      try {
        const options = {
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
        };
        const order = await razorpayInstance.orders.create(options);
        return res.json({
          success: true,
          order,
          keyId: process.env.RAZORPAY_KEY_ID,
          isSandbox: true,
        });
      } catch (err) {
        console.warn('Razorpay SDK error, falling back to Sandbox simulation:', err.message);
      }
    }

    // Default Sandbox simulation mode
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    res.json({
      success: true,
      order: {
        id: simulatedOrderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency,
        receipt: receipt || `rcpt_sim_${Date.now()}`,
        status: 'created',
      },
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sandbox_2026',
      isSandbox: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature / Sandbox verification
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    let isValid = false;

    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      isValid = generated_signature === razorpay_signature;
    } else {
      // Sandbox auto-verification
      isValid = Boolean(razorpay_order_id && razorpay_payment_id);
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature or verification failed' });
    }

    // Update Order and Payment records if orderId passed
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Successful',
        paymentResult: {
          id: razorpay_payment_id,
          status: 'Successful',
          updateTime: new Date().toISOString(),
          paymentGateway: 'Razorpay Sandbox',
        },
      });

      await Payment.findOneAndUpdate(
        { order: orderId },
        {
          status: 'Successful',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature || 'sandbox_verified',
        }
      );
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's payment history
// @route   GET /api/payments/my-payments
// @access  Private
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('order', 'orderNumber totalAmount paymentMethod createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payment transactions for Admin
// @route   GET /api/payments/admin/all
// @access  Private (Admin)
const getAllPaymentsAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.transactionId = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .populate('order', 'orderNumber totalAmount orderStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: payments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getMyPayments,
  getAllPaymentsAdmin,
};
