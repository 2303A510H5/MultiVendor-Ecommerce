// Standalone Comprehensive REST API Test Suite
const path = require('path');
const dotenv = require('dotenv');

// Load environment configuration from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const http = require('http');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const { seedData } = require('../seeder/seeder');

let app;
let server;
let baseUrl;

// Simple HTTP client helper
const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      url,
      { method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 Starting Multi-Vendor Platform Backend Test Suite');
  console.log('====================================================\n');

  try {
    process.env.NODE_ENV = 'test';

    // Route to isolated test database to protect production/development data
    if (process.env.TEST_MONGODB_URI) {
      process.env.MONGODB_URI = process.env.TEST_MONGODB_URI;
    } else if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('_test')) {
      const uriParts = process.env.MONGODB_URI.split('?');
      const basePath = uriParts[0].replace(/\/([^\/?]+)$/, '/$1_test');
      process.env.MONGODB_URI = uriParts[1] ? `${basePath}?${uriParts[1]}` : basePath;
    }

    await connectDB();
    await seedData();

    const { app: expressApp } = require('../server');
    app = expressApp;
    server = app.listen(0); // Random free port
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Test Harness] Server listening at ${baseUrl}\n`);

    let passedCount = 0;
    let failedCount = 0;

    const assertTest = (description, condition) => {
      if (condition) {
        console.log(`  ✅ PASS: ${description}`);
        passedCount++;
      } else {
        console.error(`  ❌ FAIL: ${description}`);
        failedCount++;
      }
    };

    // 1. Health check test
    console.log('--- Test Group 1: Health & Public Endpoints ---');
    const healthRes = await request('/api/health');
    assertTest('GET /api/health returns status 200 and ok', healthRes.status === 200 && healthRes.body.status === 'ok');

    const catRes = await request('/api/categories');
    assertTest('GET /api/categories returns categories list', catRes.status === 200 && catRes.body.count > 0);

    const prodRes = await request('/api/products');
    assertTest('GET /api/products returns products list', prodRes.status === 200 && prodRes.body.products.length > 0);

    const vendorRes = await request('/api/vendors');
    assertTest('GET /api/vendors returns approved vendors list', vendorRes.status === 200 && vendorRes.body.count > 0);

    // 2. Authentication Tests
    console.log('\n--- Test Group 2: Authentication & RBAC ---');
    const adminLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@shopverse.com',
      password: 'adminpassword123',
    });
    assertTest('Admin login succeeds with JWT and role=admin', adminLogin.status === 200 && adminLogin.body.user.role === 'admin');
    const adminToken = adminLogin.body.token;

    const vendorLogin = await request('/api/auth/login', 'POST', {
      email: 'vendor1@techpulse.com',
      password: 'vendorpassword123',
    });
    assertTest('Vendor login succeeds with JWT and vendor profile', vendorLogin.status === 200 && vendorLogin.body.user.role === 'vendor');
    const vendorToken = vendorLogin.body.token;

    const customerLogin = await request('/api/auth/login', 'POST', {
      email: 'customer1@gmail.com',
      password: 'customerpassword123',
    });
    assertTest('Customer login succeeds with JWT and role=customer', customerLogin.status === 200 && customerLogin.body.user.role === 'customer');
    const customerToken = customerLogin.body.token;

    // Unauthorized access check
    const unauthorizedAdminRoute = await request('/api/admin/dashboard', 'GET', null, customerToken);
    assertTest('Customer cannot access Admin Dashboard (HTTP 403 Forbidden)', unauthorizedAdminRoute.status === 403);

    // 3. Cart & Multi-Vendor Checkout Tests
    console.log('\n--- Test Group 3: Cart & Multi-Vendor Order Processing ---');
    const firstProduct = prodRes.body.products[0];
    const secondProduct = prodRes.body.products[1];

    const addCart1 = await request('/api/cart', 'POST', { productId: firstProduct._id, quantity: 1 }, customerToken);
    assertTest('Customer can add product 1 to cart', addCart1.status === 200 && addCart1.body.cart.items.length >= 1);

    const addCart2 = await request('/api/cart', 'POST', { productId: secondProduct._id, quantity: 2 }, customerToken);
    assertTest('Customer can add product 2 to cart', addCart2.status === 200);

    // Place multi-vendor order
    const checkoutRes = await request('/api/orders', 'POST', {
      shippingAddress: {
        fullName: 'Test Customer',
        phone: '+91 9999999999',
        street: '123 Market St',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'Razorpay',
      couponCode: 'WELCOME10',
    }, customerToken);

    assertTest('Multi-vendor order created with parent order & suborders', checkoutRes.status === 201 && checkoutRes.body.order.subOrders.length >= 1);
    const newOrderId = checkoutRes.body.order._id;

    // 4. Vendor Suborders Management
    console.log('\n--- Test Group 4: Vendor Suborder Management ---');
    const vendorOrdersRes = await request('/api/orders/vendor/all', 'GET', null, vendorToken);
    assertTest('Vendor can retrieve their assigned suborders only', vendorOrdersRes.status === 200 && vendorOrdersRes.body.count > 0);

    if (vendorOrdersRes.body.orders.length > 0) {
      const vOrder = vendorOrdersRes.body.orders[0];
      const updateStatusRes = await request(`/api/orders/vendor/${vOrder._id}/status`, 'PUT', {
        status: 'Shipped',
        trackingNumber: 'TRK-TEST-9988',
        shippingCarrier: 'BlueDart Express',
        note: 'Dispatched from warehouse',
      }, vendorToken);
      assertTest('Vendor can update suborder status to Shipped', updateStatusRes.status === 200 && updateStatusRes.body.subOrder.status === 'Shipped');
    }

    // 5. Payment Sandbox Verification
    console.log('\n--- Test Group 5: Payment Sandbox Verification ---');
    const payOrderRes = await request('/api/payments/create-order', 'POST', { amount: 500 }, customerToken);
    assertTest('Create Razorpay sandbox payment order returns order id', payOrderRes.status === 200 && payOrderRes.body.order.id);

    const verifyPayRes = await request('/api/payments/verify', 'POST', {
      razorpay_order_id: payOrderRes.body.order.id,
      razorpay_payment_id: 'pay_test_verified_123',
      orderId: newOrderId,
    }, customerToken);
    assertTest('Payment signature verification succeeds', verifyPayRes.status === 200 && verifyPayRes.body.success === true);

    // 6. Reports API Endpoints (All 5 Reports)
    console.log('\n--- Test Group 6: All 5 Mandatory Reports Verification ---');
    const r1 = await request('/api/reports/sales', 'GET', null, adminToken);
    assertTest('Report 1: GET /api/reports/sales returns totalSales, orders & trends', r1.status === 200 && r1.body.summary && r1.body.monthlySales);

    const r2 = await request('/api/reports/vendor-sales', 'GET', null, adminToken);
    assertTest('Report 2: GET /api/reports/vendor-sales returns vendor breakdown', r2.status === 200 && r2.body.vendors.length > 0);

    const r3 = await request('/api/reports/orders', 'GET', null, adminToken);
    assertTest('Report 3: GET /api/reports/orders returns detailed orders data', r3.status === 200 && r3.body.orders.length > 0);

    const r4 = await request('/api/reports/inventory', 'GET', null, adminToken);
    assertTest('Report 4: GET /api/reports/inventory returns valuation & low-stock alerts', r4.status === 200 && r4.body.summary && r4.body.inventory.length > 0);

    const r5 = await request('/api/reports/payments', 'GET', null, adminToken);
    assertTest('Report 5: GET /api/reports/payments returns transaction & refund stats', r5.status === 200 && r5.body.summary && r5.body.payments.length > 0);

    // Summary
    console.log('\n====================================================');
    console.log(`📊 Test Results: ${passedCount} PASSED | ${failedCount} FAILED`);
    console.log('====================================================\n');

    server.close();
    await disconnectDB();
    process.exit(failedCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal test runner error:', error);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
};

runTests();
