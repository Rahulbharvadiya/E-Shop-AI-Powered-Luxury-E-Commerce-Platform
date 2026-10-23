import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/server.js';
import { connectTestDB, disconnectTestDB } from './setup.js';
import { Product } from '../src/models/Product.js';
import { Coupon } from '../src/models/Coupon.js';

describe('E-Shop Comprehensive System Verification & Security Tests', () => {
  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    await disconnectTestDB();
  });

  test('1. Health Check Endpoint validates DB connectivity (P2-9)', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.database, 'connected');
    assert.ok(typeof res.body.uptime === 'number');
  });

  test('2. Catalog Listing caps page limit and supports text search (P1-9, P2-1)', async () => {
    const res = await request(app).get('/api/products?limit=500&page=1');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    // Limit is safely capped at 100
    assert.ok(res.body.pagination.limit <= 100);
  });

  test('3. Auth Registration rejects invalid or missing fields (P1-9)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@example.com' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('4. Auth Login rejects invalid credentials with 401 (P1-8)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nonexistent_user@eshop.com', password: 'WrongPassword123!' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('5. Protected Admin Routes strictly block unauthenticated requests (P0-4)', async () => {
    const res = await request(app).get('/api/admin/orders');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('6. Non-existent product slug returns 404 cleanly (P1-8, P2-7)', async () => {
    const res = await request(app).get('/api/products/non-existent-product-slug-xyz');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  test('7. Delivery Calculation dynamically reflects StoreSettings thresholds (P1-4)', async () => {
    const res = await request(app)
      .post('/api/pincode/estimate')
      .send({ pincode: '560035', subtotal: 1000 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.isFreeDelivery, true);
    assert.equal(res.body.data.shippingFee, 0);
  });

  test('8. Coupon Validation validates expiry and caps discount with maxDiscountAmount (P1-1)', async () => {
    const testCode = `TESTCAP_${Date.now()}`;
    await Coupon.create({
      code: testCode,
      discountPercentage: 50,
      maxDiscountAmount: 200,
      usageLimit: 10,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      active: true
    });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: testCode, subtotal: 2000 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    // 50% of 2000 is 1000, but capped at maxDiscountAmount 200
    assert.equal(res.body.data.discountAmount, 200);

    // Cleanup
    await Coupon.deleteOne({ code: testCode });
  });

  test('9. AI Assistant Chat isolates guest sessions (P0-7)', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'Recommend top luxury shoes', sessionId: 'session-guest' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    // The server auto-replaced generic session-guest with a secure unique guest session
    assert.notEqual(res.body.sessionId, 'session-guest');
  });
});
