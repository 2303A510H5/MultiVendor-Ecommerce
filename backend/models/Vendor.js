const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, 'Please provide a store name'],
      trim: true,
      unique: true,
    },
    storeSlug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    storeDescription: {
      type: String,
      default: '',
    },
    storeLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=250&q=80',
    },
    storeBanner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    },
    businessEmail: {
      type: String,
      required: [true, 'Business email is required'],
      lowercase: true,
      trim: true,
    },
    businessPhone: {
      type: String,
      required: [true, 'Business phone is required'],
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    commissionRate: {
      type: Number,
      default: 10, // 10% platform commission
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    statusReason: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscOrRouting: { type: String, default: '' },
      bankName: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.pre('save', function (next) {
  if (this.isModified('storeName') && !this.storeSlug) {
    this.storeSlug = this.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);
