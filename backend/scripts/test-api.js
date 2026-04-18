'use strict';

require('dotenv').config();
const http = require('http');

const BASE  = 'http://localhost:5000';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PW    = process.env.SEED_ADMIN_PASSWORD;

if (!ADMIN_PW) {
  console.error('❌ SEED_ADMIN_PASSWORD not set — test suite needs it to login as admin.');
  process.exit(1);
}

// ── HTTP helper ────────────────────────────────────────────
const request = (method, path, body = null, token = null) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      method,
      hostname: 'localhost',
      port: 5000,
      path,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });

const ok  = (label, val) => console.log(`  ✅ ${label}: ${val}`);
const fail = (label, val) => console.log(`  ❌ ${label}: ${val}`);
const check = (label, cond, val) => cond ? ok(label, val) : fail(label, val);

// ── Run tests ──────────────────────────────────────────────
const run = async () => {
  console.log('\n═══════════════════════════════════════');
  console.log('  PHARMA-SHOP API TEST SUITE');
  console.log('═══════════════════════════════════════\n');

  // 1. Health
  console.log('► Health check');
  const health = await request('GET', '/api/health');
  check('Status', health.status === 200, health.status);
  check('Success', health.body.success === true, health.body.success);

  // 2. Login admin
  console.log('\n► Admin login');
  const loginRes = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PW });
  check('Status', loginRes.status === 200, loginRes.status);
  const adminToken = loginRes.body.data?.accessToken;
  check('Token received', !!adminToken, adminToken ? adminToken.slice(0, 20) + '…' : 'missing');
  check('Role', loginRes.body.data?.user?.role === 'admin', loginRes.body.data?.user?.role);

  // 3. Login customer
  console.log('\n► Customer login');
  const custRes = await request('POST', '/api/auth/login', { email: 'customer@pharma.com', password: ADMIN_PW });
  check('Status', custRes.status === 200, custRes.status);
  const custToken = custRes.body.data?.accessToken;
  check('Token received', !!custToken, 'yes');

  // 4. Get me
  console.log('\n► GET /api/auth/me');
  const meRes = await request('GET', '/api/auth/me', null, adminToken);
  check('Status', meRes.status === 200, meRes.status);
  check('Email', meRes.body.data?.email === ADMIN_EMAIL, meRes.body.data?.email);

  // 5. Categories
  console.log('\n► GET /api/categories');
  const catRes = await request('GET', '/api/categories');
  check('Status', catRes.status === 200, catRes.status);
  check('Count', catRes.body.data?.length === 6, catRes.body.data?.length);
  check('Has slugs', catRes.body.data?.[0]?.slug?.length > 0, catRes.body.data?.[0]?.slug);

  // 6. Products
  console.log('\n► GET /api/products');
  const prodRes = await request('GET', '/api/products?limit=8');
  check('Status', prodRes.status === 200, prodRes.status);
  check('Total products', prodRes.body.data?.pagination?.total === 8, prodRes.body.data?.pagination?.total);
  const firstProduct = prodRes.body.data?.items?.[0];
  check('Product has price', firstProduct?.price > 0, firstProduct?.price);
  const productId = firstProduct?._id;

  // 7. Product detail
  console.log('\n► GET /api/products/:id');
  const pdRes = await request('GET', `/api/products/${productId}`);
  check('Status', pdRes.status === 200, pdRes.status);
  check('Name present', !!pdRes.body.data?.name, pdRes.body.data?.name);

  // 8. Product filter & search
  console.log('\n► GET /api/products?search=vitamin');
  const searchRes = await request('GET', '/api/products?search=vitamin');
  check('Status', searchRes.status === 200, searchRes.status);
  check('Results', searchRes.body.data?.pagination?.total > 0, searchRes.body.data?.pagination?.total);

  // 9. Cart - add item
  console.log('\n► POST /api/cart/items');
  const addCartRes = await request('POST', '/api/cart/items', { productId, quantity: 2 }, custToken);
  check('Status', addCartRes.status === 200, addCartRes.status);
  check('Cart has item', addCartRes.body.data?.items?.length > 0, addCartRes.body.data?.items?.length);
  check('Quantity', addCartRes.body.data?.items?.[0]?.quantity === 2, addCartRes.body.data?.items?.[0]?.quantity);

  // 10. Get cart
  console.log('\n► GET /api/cart');
  const getCartRes = await request('GET', '/api/cart', null, custToken);
  check('Status', getCartRes.status === 200, getCartRes.status);
  check('Items count', getCartRes.body.data?.items?.length === 1, getCartRes.body.data?.items?.length);

  // 11. Checkout
  console.log('\n► POST /api/orders/checkout');
  const checkoutRes = await request('POST', '/api/orders/checkout', {
    shippingAddress: { street: '123 Nguyen Hue', city: 'Ho Chi Minh', country: 'Vietnam' },
    note: 'Please deliver fast',
  }, custToken);
  check('Status', checkoutRes.status === 201, checkoutRes.status);
  check('Order created', checkoutRes.body.success === true, checkoutRes.body.message);
  check('Status pending', checkoutRes.body.data?.status === 'pending', checkoutRes.body.data?.status);
  check('Total > 0', checkoutRes.body.data?.totalAmount > 0, checkoutRes.body.data?.totalAmount);
  const orderId = checkoutRes.body.data?._id;

  // 12. Cart cleared after checkout
  console.log('\n► GET /api/cart (after checkout)');
  const emptyCartRes = await request('GET', '/api/cart', null, custToken);
  check('Cart empty', emptyCartRes.body.data?.items?.length === 0, emptyCartRes.body.data?.items?.length);

  // 13. Get my orders
  console.log('\n► GET /api/orders/my');
  const myOrdersRes = await request('GET', '/api/orders/my', null, custToken);
  check('Status', myOrdersRes.status === 200, myOrdersRes.status);
  check('Has order', myOrdersRes.body.data?.items?.length > 0, myOrdersRes.body.data?.items?.length);

  // 14. Admin: update order status
  console.log('\n► PATCH /api/orders/:id/status (admin)');
  const updateRes = await request('PATCH', `/api/orders/${orderId}/status`, { status: 'confirmed' }, adminToken);
  check('Status', updateRes.status === 200, updateRes.status);
  check('New status', updateRes.body.data?.status === 'confirmed', updateRes.body.data?.status);

  // 15. Admin: get all orders
  console.log('\n► GET /api/orders (admin)');
  const allOrdersRes = await request('GET', '/api/orders', null, adminToken);
  check('Status', allOrdersRes.status === 200, allOrdersRes.status);
  check('Total orders', allOrdersRes.body.data?.pagination?.total > 0, allOrdersRes.body.data?.pagination?.total);

  // 16. Admin dashboard
  console.log('\n► GET /api/admin/dashboard (admin)');
  const dashRes = await request('GET', '/api/admin/dashboard', null, adminToken);
  check('Status', dashRes.status === 200, dashRes.status);
  check('Products count', dashRes.body.data?.totalProducts > 0, dashRes.body.data?.totalProducts);
  check('Orders count',   dashRes.body.data?.totalOrders > 0,   dashRes.body.data?.totalOrders);

  // 17. Admin: create category
  console.log('\n► POST /api/categories (admin)');
  const newCatRes = await request('POST', '/api/categories', { name: 'Heart Health', description: 'Cardiac supplements' }, adminToken);
  check('Status', newCatRes.status === 201, newCatRes.status);
  check('Slug generated', !!newCatRes.body.data?.slug, newCatRes.body.data?.slug);

  // 18. Auth: wrong password
  console.log('\n► POST /api/auth/login (bad credentials)');
  const badLogin = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: 'WRONG' });
  check('Status 401', badLogin.status === 401, badLogin.status);
  check('Error message', !!badLogin.body.message, badLogin.body.message);

  // 19. Role guard
  console.log('\n► GET /api/users (customer — forbidden)');
  const forbiddenRes = await request('GET', '/api/users', null, custToken);
  check('Status 403', forbiddenRes.status === 403, forbiddenRes.status);

  // 20. 404
  console.log('\n► GET /api/nonexistent');
  const notFound = await request('GET', '/api/nonexistent');
  check('Status 404', notFound.status === 404, notFound.status);

  console.log('\n═══════════════════════════════════════');
  console.log('  ALL TESTS COMPLETE');
  console.log('═══════════════════════════════════════\n');
};

run().catch((err) => {
  console.error('Test error:', err.message);
  process.exit(1);
});
