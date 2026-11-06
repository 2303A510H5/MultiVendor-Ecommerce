const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    vendorOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorOrder',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    reason: {
      type: String,
      required: [true, 'Return reason is required'],
      enum: [
        'Defective or Damaged Product',
        'Wrong Item Delivered',
        'Item Does Not Match Description',
        'Quality Not As Expected',
        'Size or Fit Issue',
        'Late Delivery',
        'Other',
      ],
    },
    detailedExplanation: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected',
        'Item Received',
        'Refund Processing',
        'Refunded',
      ],
      default: 'Pending',
      index: true,
    },
    refundAmount: {
      type: Number,
      required: true,
    },
    vendorComments: {
      type: String,
      default: '',
    },
    adminComments: {
      type: String,
      default: '',
    },
    refundTransactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Return', returnSchema);
