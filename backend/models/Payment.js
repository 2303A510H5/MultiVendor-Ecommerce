const mongoose = require('mongoose');

const refundItemSchema = new mongoose.Schema({
  refundId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Refunded' },
  reason: { type: String, default: 'Customer Return' },
  createdAt: { type: Date, default: Date.now },
});

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Razorpay', 'Cash on Delivery', 'Card', 'UPI'],
      default: 'Razorpay',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['Pending', 'Successful', 'Failed', 'Refunded', 'Partially Refunded'],
      default: 'Pending',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    refunds: [refundItemSchema],
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
