const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
  subtotal: { type: Number, required: true },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: String,
    default: 'System',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    subOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorOrder',
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'Cash on Delivery', 'Card', 'UPI'],
      required: true,
      default: 'Razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Successful', 'Failed', 'Refunded', 'Partially Refunded'],
      default: 'Pending',
      index: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      updateTime: { type: String },
      emailAddress: { type: String },
      paymentGateway: { type: String, default: 'Razorpay Sandbox' },
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponApplied: { type: String, default: '' },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: [
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
      ],
      default: 'Pending',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
