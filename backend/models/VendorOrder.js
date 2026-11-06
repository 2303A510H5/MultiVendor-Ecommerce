const mongoose = require('mongoose');

const vendorOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
  subtotal: { type: Number, required: true },
});

const vendorOrderSchema = new mongoose.Schema(
  {
    subOrderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [vendorOrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    commissionRate: {
      type: Number,
      default: 10,
    },
    commissionAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    vendorEarnings: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
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
    shippingCarrier: {
      type: String,
      default: 'Express Delivery',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    estimatedDelivery: {
      type: Date,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VendorOrder', vendorOrderSchema);
