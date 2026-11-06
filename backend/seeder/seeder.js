const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Address = require('../models/Address');
const Return = require('../models/Return');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

const seedData = async () => {
  try {
    console.log('[Seeder] Clearing old collections...');
    await Promise.all([
      User.deleteMany(),
      Vendor.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      VendorOrder.deleteMany(),
      Payment.deleteMany(),
      Review.deleteMany(),
      Address.deleteMany(),
      Return.deleteMany(),
      Coupon.deleteMany(),
      Notification.deleteMany(),
      Cart.deleteMany(),
      Wishlist.deleteMany(),
    ]);

    console.log('[Seeder] Creating Users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@shopverse.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    });

    const vendor1User = await User.create({
      name: 'Vikram Mehta',
      email: 'vendor1@techpulse.com',
      password: 'vendorpassword123',
      role: 'vendor',
      phone: '+91 98765 11111',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    });

    const vendor2User = await User.create({
      name: 'Priya Sharma',
      email: 'vendor2@stylehub.com',
      password: 'vendorpassword123',
      role: 'vendor',
      phone: '+91 98765 22222',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    });

    const vendor3User = await User.create({
      name: 'Rahul Verma',
      email: 'vendor3@greenroots.com',
      password: 'vendorpassword123',
      role: 'vendor',
      phone: '+91 98765 33333',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    });

    const customer1 = await User.create({
      name: 'Aarav Patel',
      email: 'customer1@gmail.com',
      password: 'customerpassword123',
      role: 'customer',
      phone: '+91 98765 44444',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    });

    const customer2 = await User.create({
      name: 'Ananya Iyer',
      email: 'customer2@gmail.com',
      password: 'customerpassword123',
      role: 'customer',
      phone: '+91 98765 55555',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    });

    console.log('[Seeder] Creating Vendors...');
    const vendor1 = await Vendor.create({
      user: vendor1User._id,
      storeName: 'TechPulse Electronics',
      storeDescription: 'Premier provider of premium audio gear, smart wearables, and cutting-edge digital accessories.',
      storeLogo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80',
      storeBanner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      businessEmail: 'support@techpulse.com',
      businessPhone: '+91 98765 11111',
      address: {
        street: '42 Cyber City, Tech Park Phase 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India',
      },
      commissionRate: 10,
      status: 'approved',
      statusReason: 'Verified authorized distributor',
      rating: 4.8,
      totalSales: 154800,
      totalOrders: 42,
      totalEarnings: 139320,
      bankDetails: {
        accountHolderName: 'TechPulse Retail LLP',
        accountNumber: '918237192837',
        ifscOrRouting: 'HDFC0001234',
        bankName: 'HDFC Bank',
      },
    });

    const vendor2 = await Vendor.create({
      user: vendor2User._id,
      storeName: 'StyleHub Apparel',
      storeDescription: 'Contemporary streetwear, sustainable apparel, and timeless accessories crafted for everyday comfort.',
      storeLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80',
      storeBanner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
      businessEmail: 'contact@stylehub.com',
      businessPhone: '+91 98765 22222',
      address: {
        street: '15 Fashion Avenue, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      },
      commissionRate: 12,
      status: 'approved',
      statusReason: 'Verified fashion brand partner',
      rating: 4.6,
      totalSales: 89400,
      totalOrders: 28,
      totalEarnings: 78672,
      bankDetails: {
        accountHolderName: 'StyleHub Retail Co.',
        accountNumber: '501002349182',
        ifscOrRouting: 'ICIC0000456',
        bankName: 'ICICI Bank',
      },
    });

    const vendor3 = await Vendor.create({
      user: vendor3User._id,
      storeName: 'GreenRoots Organics',
      storeDescription: 'Certified organic personal care, zero-waste lifestyle essentials, and cold-pressed botanical oils.',
      storeLogo: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=300&q=80',
      storeBanner: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      businessEmail: 'care@greenroots.com',
      businessPhone: '+91 98765 33333',
      address: {
        street: '88 Plantation Road',
        city: 'Kochi',
        state: 'Kerala',
        postalCode: '682001',
        country: 'India',
      },
      commissionRate: 8,
      status: 'pending',
      statusReason: 'Application submitted, pending document verification',
      rating: 5.0,
      totalSales: 0,
      totalOrders: 0,
      totalEarnings: 0,
    });

    console.log('[Seeder] Creating Categories...');
    const catElectronics = await Category.create({
      name: 'Electronics & Audio',
      slug: 'electronics-audio',
      description: 'Headphones, Bluetooth speakers, smartwatches and high-fidelity sound gear.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    });

    const catFashion = await Category.create({
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Modern trends, cotton staples, premium jackets and designer footwear.',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
    });

    const catHome = await Category.create({
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Smart appliances, ergonomic workspace accessories, and artisanal tableware.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
    });

    const catBeauty = await Category.create({
      name: 'Beauty & Wellness',
      slug: 'beauty-wellness',
      description: 'Natural skincare, botanical serums, and organic self-care formulas.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    });

    console.log('[Seeder] Creating Products...');
    const products = await Product.create([
      {
        vendor: vendor1._id,
        name: 'AcousticPro Wireless Noise-Cancelling Headphones',
        description: 'Immersive sound with 40mm titanium drivers, 35-hour battery life, active hybrid noise cancellation, and plush memory foam earcups.',
        category: catElectronics._id,
        price: 8999,
        discountPrice: 6999,
        stock: 35,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['audio', 'wireless', 'headphones', 'bluetooth'],
        isFeatured: true,
        unitsSold: 28,
      },
      {
        vendor: vendor1._id,
        name: 'PulseWatch Ultra Smartwatch with AMOLED Display',
        description: 'Precision heart rate tracking, SpO2 sensor, built-in GPS, 100+ sports modes, waterproof 5ATM rating, and 7-day battery life.',
        category: catElectronics._id,
        price: 5499,
        discountPrice: 4299,
        stock: 18,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['smartwatch', 'fitness', 'wearable', 'amoled'],
        isFeatured: true,
        unitsSold: 14,
      },
      {
        vendor: vendor1._id,
        name: 'SoundBoom 360 Portable Rugged Bluetooth Speaker',
        description: '30W high output deep bass speaker, IPX7 waterproof rating, dual pairing stereo mode, and 18 hours of non-stop playtime.',
        category: catElectronics._id,
        price: 3499,
        discountPrice: 2799,
        stock: 6, // Low stock alert!
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['speaker', 'bluetooth', 'audio', 'waterproof'],
        isFeatured: false,
        unitsSold: 42,
      },
      {
        vendor: vendor1._id,
        name: 'HyperDrive 65W GaN Fast Charger Trio',
        description: 'Compact Gallium Nitride (GaN) fast charger with 2 USB-C ports and 1 USB-A port for simultaneous laptop, phone, and tablet charging.',
        category: catElectronics._id,
        price: 2499,
        discountPrice: 1899,
        stock: 0, // Out of stock!
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['charger', 'gan', 'fast-charging', 'accessories'],
        isFeatured: false,
        unitsSold: 50,
      },
      {
        vendor: vendor2._id,
        name: 'UrbanClassic Relaxed Fit Heavyweight Cotton Hoodie',
        description: 'Crafted from 100% organic combed cotton fleece (450 GSM). Features double-stitched seams, brushed interior, and a structured hood.',
        category: catFashion._id,
        price: 2999,
        discountPrice: 2299,
        stock: 45,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['hoodie', 'streetwear', 'apparel', 'cotton'],
        isFeatured: true,
        unitsSold: 32,
      },
      {
        vendor: vendor2._id,
        name: 'SummitPro Waterproof All-Weather Windbreaker',
        description: 'Ultra-lightweight windproof and water-repellent jacket with taped seams, zippered hand pockets, and breathable underarm vents.',
        category: catFashion._id,
        price: 4499,
        discountPrice: 3499,
        stock: 8, // Low stock alert!
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['jacket', 'windbreaker', 'outerwear', 'waterproof'],
        isFeatured: true,
        unitsSold: 19,
      },
      {
        vendor: vendor2._id,
        name: 'Heritage Raw Selvedge Denim Jeans (Slim Tapered)',
        description: 'Authentic 14oz Japanese raw denim with indigo rope dye, copper rivets, and a classic red-line selvedge ID that fades uniquely over time.',
        category: catFashion._id,
        price: 3999,
        discountPrice: 3199,
        stock: 22,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['denim', 'jeans', 'selvedge', 'pants'],
        isFeatured: false,
        unitsSold: 15,
      },
      {
        vendor: vendor2._id,
        name: 'Minimalist Top-Grain Leather Everyday Backpack',
        description: 'Handcrafted full-grain leather backpack with a dedicated padded 15-inch laptop sleeve, brass YKK zippers, and ergonomic shoulder straps.',
        category: catFashion._id,
        price: 6999,
        discountPrice: 5499,
        stock: 12,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['backpack', 'leather', 'accessories', 'laptop-bag'],
        isFeatured: true,
        unitsSold: 11,
      },
      {
        vendor: vendor1._id,
        name: 'SmartBrew Precision Thermal Drip Coffee Maker',
        description: 'Programmable stainless steel coffee maker with precise temperature control, reusable gold-tone filter, and double-walled thermal carafe.',
        category: catHome._id,
        price: 4999,
        discountPrice: 3999,
        stock: 15,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['coffee', 'home', 'appliances', 'kitchen'],
        isFeatured: false,
        unitsSold: 9,
      },
      {
        vendor: vendor2._id,
        name: 'LuxeGlow Radiance Botanical Facial Serum (30ml)',
        description: 'Infused with cold-pressed rosehip seed oil, vitamin C, hyaluronic acid, and bakuchiol for deeply hydrated, luminous skin.',
        category: catBeauty._id,
        price: 1899,
        discountPrice: 1499,
        stock: 50,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        ],
        tags: ['skincare', 'serum', 'organic', 'beauty'],
        isFeatured: false,
        unitsSold: 38,
      },
    ]);

    console.log('[Seeder] Creating Addresses...');
    const address1 = await Address.create({
      user: customer1._id,
      fullName: 'Aarav Patel',
      phone: '+91 98765 44444',
      street: 'Flat 402, Sunshine Heights, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      addressType: 'Home',
      isDefault: true,
    });

    const address2 = await Address.create({
      user: customer2._id,
      fullName: 'Ananya Iyer',
      phone: '+91 98765 55555',
      street: 'B-12, Green Park Avenue',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600028',
      country: 'India',
      addressType: 'Home',
      isDefault: true,
    });

    console.log('[Seeder] Creating Orders & Multi-Vendor Suborders...');
    // Order 1: Multi-vendor order (Items from Vendor 1 and Vendor 2!)
    const order1Items = [
      {
        product: products[0]._id,
        vendor: vendor1._id,
        name: products[0].name,
        price: 6999,
        quantity: 1,
        image: products[0].images[0],
        subtotal: 6999,
      },
      {
        product: products[4]._id,
        vendor: vendor2._id,
        name: products[4].name,
        price: 2299,
        quantity: 2,
        image: products[4].images[0],
        subtotal: 4598,
      },
    ];

    const order1 = await Order.create({
      orderNumber: 'ORD-202611-1001',
      customer: customer1._id,
      items: order1Items,
      shippingAddress: {
        fullName: address1.fullName,
        phone: address1.phone,
        street: address1.street,
        city: address1.city,
        state: address1.state,
        postalCode: address1.postalCode,
        country: address1.country,
      },
      paymentMethod: 'Razorpay',
      paymentStatus: 'Successful',
      paymentResult: {
        id: 'pay_rzp_mock_1001',
        status: 'Successful',
        updateTime: new Date().toISOString(),
        paymentGateway: 'Razorpay Sandbox',
      },
      itemsPrice: 11597,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: 11597,
      orderStatus: 'Delivered',
      deliveredAt: new Date(),
      statusHistory: [
        { status: 'Confirmed', timestamp: new Date(Date.now() - 5 * 86400000), note: 'Payment verified via Razorpay' },
        { status: 'Processing', timestamp: new Date(Date.now() - 4 * 86400000), note: 'Orders packed by vendors' },
        { status: 'Shipped', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Dispatched via Express Logistics' },
        { status: 'Delivered', timestamp: new Date(), note: 'Package handed to customer' },
      ],
    });

    // Suborder 1 for Vendor 1
    const subOrder1 = await VendorOrder.create({
      subOrderNumber: 'ORD-202611-1001-V1',
      parentOrder: order1._id,
      vendor: vendor1._id,
      customer: customer1._id,
      items: [order1Items[0]],
      subtotal: 6999,
      commissionRate: 10,
      commissionAmount: 700,
      vendorEarnings: 6299,
      status: 'Delivered',
      trackingNumber: 'TRK-V1-9981',
      statusHistory: [
        { status: 'Confirmed', timestamp: new Date(Date.now() - 5 * 86400000), note: 'Order accepted' },
        { status: 'Delivered', timestamp: new Date(), note: 'Delivered successfully' },
      ],
    });

    // Suborder 2 for Vendor 2
    const subOrder2 = await VendorOrder.create({
      subOrderNumber: 'ORD-202611-1001-V2',
      parentOrder: order1._id,
      vendor: vendor2._id,
      customer: customer1._id,
      items: [order1Items[1]],
      subtotal: 4598,
      commissionRate: 12,
      commissionAmount: 552,
      vendorEarnings: 4046,
      status: 'Delivered',
      trackingNumber: 'TRK-V2-5512',
      statusHistory: [
        { status: 'Confirmed', timestamp: new Date(Date.now() - 5 * 86400000), note: 'Order accepted' },
        { status: 'Delivered', timestamp: new Date(), note: 'Delivered successfully' },
      ],
    });

    order1.subOrders = [subOrder1._id, subOrder2._id];
    await order1.save();

    await Payment.create({
      order: order1._id,
      user: customer1._id,
      transactionId: 'TXN-RZP-202611-1001',
      paymentMethod: 'Razorpay',
      amount: 11597,
      currency: 'INR',
      status: 'Successful',
      razorpayOrderId: 'order_rzp_mock_1001',
      razorpayPaymentId: 'pay_rzp_mock_1001',
      paymentDate: new Date(Date.now() - 5 * 86400000),
    });

    // Order 2: In-transit order (Vendor 1 Smartwatch)
    const order2Items = [
      {
        product: products[1]._id,
        vendor: vendor1._id,
        name: products[1].name,
        price: 4299,
        quantity: 1,
        image: products[1].images[0],
        subtotal: 4299,
      },
    ];

    const order2 = await Order.create({
      orderNumber: 'ORD-202611-1002',
      customer: customer2._id,
      items: order2Items,
      shippingAddress: {
        fullName: address2.fullName,
        phone: address2.phone,
        street: address2.street,
        city: address2.city,
        state: address2.state,
        postalCode: address2.postalCode,
        country: address2.country,
      },
      paymentMethod: 'Razorpay',
      paymentStatus: 'Successful',
      paymentResult: {
        id: 'pay_rzp_mock_1002',
        status: 'Successful',
        updateTime: new Date().toISOString(),
        paymentGateway: 'Razorpay Sandbox',
      },
      itemsPrice: 4299,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: 4299,
      orderStatus: 'Shipped',
      statusHistory: [
        { status: 'Confirmed', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Payment verified' },
        { status: 'Processing', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Packed by TechPulse' },
        { status: 'Shipped', timestamp: new Date(), note: 'In transit with BlueDart' },
      ],
    });

    const subOrder3 = await VendorOrder.create({
      subOrderNumber: 'ORD-202611-1002-V1',
      parentOrder: order2._id,
      vendor: vendor1._id,
      customer: customer2._id,
      items: order2Items,
      subtotal: 4299,
      commissionRate: 10,
      commissionAmount: 430,
      vendorEarnings: 3869,
      status: 'Shipped',
      trackingNumber: 'BD-88291029',
      shippingCarrier: 'BlueDart Air',
    });

    order2.subOrders = [subOrder3._id];
    await order2.save();

    await Payment.create({
      order: order2._id,
      user: customer2._id,
      transactionId: 'TXN-RZP-202611-1002',
      paymentMethod: 'Razorpay',
      amount: 4299,
      currency: 'INR',
      status: 'Successful',
      paymentDate: new Date(Date.now() - 2 * 86400000),
    });

    console.log('[Seeder] Creating Reviews...');
    await Review.create([
      {
        product: products[0]._id,
        user: customer1._id,
        vendor: vendor1._id,
        rating: 5,
        title: 'Outstanding Sound Quality and Battery Life',
        comment: 'Crisp highs, rich punchy bass, and active noise cancellation works wonders during flights! Highly recommended.',
        isApproved: true,
      },
      {
        product: products[4]._id,
        user: customer1._id,
        vendor: vendor2._id,
        rating: 4,
        title: 'Great fabric weight and premium feel',
        comment: 'Extremely soft on the inside and has a nice substantial weight. Fits true to size.',
        isApproved: true,
      },
    ]);

    // Recalculate average ratings
    await Review.calculateAverageRating(products[0]._id);
    await Review.calculateAverageRating(products[4]._id);

    console.log('[Seeder] Creating Coupon...');
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minPurchase: 500,
      maxDiscount: 500,
      validUntil: new Date(Date.now() + 365 * 86400000),
      isActive: true,
    });

    console.log('[Seeder] Database successfully seeded with realistic multi-vendor data!');
  } catch (error) {
    console.error(`[Seeder] Error seeding database: ${error.message}`);
    throw error;
  }
};

const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Empty database detected. Running automatic initial seed...');
      await seedData();
    } else {
      console.log(`[Database] Database already has ${userCount} users. Skipping auto-seed.`);
    }
  } catch (err) {
    console.warn(`[Database] Auto-seed check notice: ${err.message}`);
  }
};

// If run directly from terminal `npm run seed`
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  require('dotenv').config();

  (async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
      console.log('[Seeder] Destroying all data...');
      await Promise.all([
        User.deleteMany(),
        Vendor.deleteMany(),
        Category.deleteMany(),
        Product.deleteMany(),
        Order.deleteMany(),
        VendorOrder.deleteMany(),
        Payment.deleteMany(),
        Review.deleteMany(),
        Address.deleteMany(),
        Return.deleteMany(),
        Coupon.deleteMany(),
        Notification.deleteMany(),
        Cart.deleteMany(),
        Wishlist.deleteMany(),
      ]);
      console.log('[Seeder] Data Destroyed.');
    } else {
      await seedData();
    }
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedData, seedDatabaseIfEmpty };
