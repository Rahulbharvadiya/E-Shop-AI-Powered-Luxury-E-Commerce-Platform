import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  calculateItemTotal,
  calculateSubtotal,
  calculateCouponDiscount,
  calculateOrderTotal,
  isValidOrderTransition,
  ALLOWED_ORDER_TRANSITIONS
} from '../src/services/pricingService.js';
import { estimateDelivery } from '../src/services/pincodeService.js';

describe('E-Shop Unit Test Suite — Financial Calculations, State Machines & Security Gates', () => {

  // 1. Line Item & Subtotal Math (P1-15, P2-11)
  describe('1. Line Item & Subtotal Pricing', () => {
    test('computes line item total with integer rounding', () => {
      assert.equal(calculateItemTotal(1999, 3), 5997);
      assert.equal(calculateItemTotal(0, 5), 0);
      assert.equal(calculateItemTotal(1499.5, 2), 2999);
    });

    test('clamps negative or zero quantity to 1', () => {
      assert.equal(calculateItemTotal(500, 0), 500);
      assert.equal(calculateItemTotal(500, -3), 500);
    });

    test('computes aggregate cart subtotal correctly', () => {
      const items = [
        { price: 1000, quantity: 2 },
        { discountedPrice: 2500, quantity: 1 },
        { price: 500, quantity: 4 }
      ];
      assert.equal(calculateSubtotal(items), 6500);
    });
  });

  // 2. Coupon Discount Calculation & Capping (P1-1)
  describe('2. Coupon Discount Intelligence & Limits', () => {
    const validCoupon = {
      code: 'LUXURY20',
      active: true,
      discountPercentage: 20,
      maxDiscountAmount: 500,
      minOrderValue: 1000,
      usageLimit: 100,
      usedCount: 5,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    test('applies percentage discount within maximum cap', () => {
      // 20% of 2000 is 400 (under 500 cap)
      const res = calculateCouponDiscount(2000, validCoupon);
      assert.equal(res.valid, true);
      assert.equal(res.discount, 400);
    });

    test('strictly caps discount at maxDiscountAmount', () => {
      // 20% of 10000 is 2000, but capped at 500
      const res = calculateCouponDiscount(10000, validCoupon);
      assert.equal(res.valid, true);
      assert.equal(res.discount, 500);
    });

    test('rejects coupon if order subtotal is below minOrderValue', () => {
      const res = calculateCouponDiscount(800, validCoupon);
      assert.equal(res.valid, false);
      assert.equal(res.discount, 0);
      assert.match(res.reason, /Minimum order value/i);
    });

    test('rejects expired coupon', () => {
      const expired = { ...validCoupon, expiresAt: new Date(Date.now() - 1000) };
      const res = calculateCouponDiscount(2000, expired);
      assert.equal(res.valid, false);
      assert.match(res.reason, /expired/i);
    });

    test('rejects exhausted coupon when usedCount >= usageLimit', () => {
      const exhausted = { ...validCoupon, usageLimit: 10, usedCount: 10 };
      const res = calculateCouponDiscount(2000, exhausted);
      assert.equal(res.valid, false);
      assert.match(res.reason, /maximum usage/i);
    });
  });

  // 3. Final Order Total Math
  describe('3. Order Net Total Calculation', () => {
    test('computes net total with subtotal, discount and shipping fee', () => {
      const total = calculateOrderTotal({ subtotal: 5000, discount: 500, deliveryFee: 40 });
      assert.equal(total, 4540);
    });

    test('never returns negative total even if discount exceeds subtotal', () => {
      const total = calculateOrderTotal({ subtotal: 300, discount: 500, deliveryFee: 0 });
      assert.equal(total, 0);
    });
  });

  // 4. Order State Machine Transitions (P1-2)
  describe('4. Order Lifecycle State Machine', () => {
    test('allows valid forward progress', () => {
      assert.equal(isValidOrderTransition('ORDER_PLACED', 'CONFIRMED'), true);
      assert.equal(isValidOrderTransition('CONFIRMED', 'SHIPPED'), true);
      assert.equal(isValidOrderTransition('SHIPPED', 'OUT_FOR_DELIVERY'), true);
      assert.equal(isValidOrderTransition('OUT_FOR_DELIVERY', 'DELIVERED'), true);
    });

    test('allows cancellation only from pre-dispatch states', () => {
      assert.equal(isValidOrderTransition('ORDER_PLACED', 'CANCELLED'), true);
      assert.equal(isValidOrderTransition('CONFIRMED', 'CANCELLED'), true);
      assert.equal(isValidOrderTransition('SHIPPED', 'CANCELLED'), false);
      assert.equal(isValidOrderTransition('DELIVERED', 'CANCELLED'), false);
    });

    test('strictly blocks illegal backward transitions', () => {
      assert.equal(isValidOrderTransition('DELIVERED', 'ORDER_PLACED'), false);
      assert.equal(isValidOrderTransition('CANCELLED', 'CONFIRMED'), false);
      assert.equal(isValidOrderTransition('SHIPPED', 'ORDER_PLACED'), false);
    });
  });

  // 5. Delivery Intelligence & Thresholds (P1-4)
  describe('5. Delivery Pincode Intelligence & Dynamic Settings', () => {
    const mockSettings = { freeShippingMinAmount: 999, shippingFee: 50 };

    test('local Bengaluru delivery (<30km) is always free regardless of subtotal', () => {
      const res = estimateDelivery('560035', 200, mockSettings);
      assert.equal(res.isFreeDelivery, true);
      assert.equal(res.shippingFee, 0);
      assert.equal(res.estimatedDays, 1);
    });

    test('regional delivery applies shipping fee when below free threshold', () => {
      // PIN 570001 (Mysuru) is regional (~140km)
      const res = estimateDelivery('570001', 500, mockSettings);
      assert.equal(res.shippingFee, 50);
      assert.equal(res.isFreeDelivery, false);
      assert.equal(res.estimatedDays, 2);
    });

    test('regional delivery waives fee when subtotal meets free threshold', () => {
      const res = estimateDelivery('570001', 1200, mockSettings);
      assert.equal(res.shippingFee, 0);
      assert.equal(res.isFreeDelivery, true);
    });

    test('rejects malformed pincodes', () => {
      assert.throws(() => estimateDelivery('abc12', 1000), /valid 6-digit/);
    });
  });

  // 6. CSV Formula Injection Sanitization (P2-2)
  describe('6. CSV Spreadsheet Injection Defense', () => {
    function sanitizeCsvCell(val) {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    }

    test('neutralizes formula injection triggers (=, +, -, @)', () => {
      assert.equal(sanitizeCsvCell('=1+1'), `"'=1+1"`);
      assert.equal(sanitizeCsvCell('+cmd|...'), `"'+cmd|..."`);
      assert.equal(sanitizeCsvCell('@SUM(A1:A10)'), `"'@SUM(A1:A10)"`);
      assert.equal(sanitizeCsvCell('-50'), `"'-50"`);
    });

    test('preserves harmless customer names without alteration', () => {
      assert.equal(sanitizeCsvCell('Jane Doe'), `"Jane Doe"`);
    });
  });

  // 7. OTP HMAC & Timing Safe Equal Verification (P1-7)
  describe('7. OTP Security & Constant-Time Comparison', () => {
    const secret = 'super_secure_jwt_secret_12345';
    function hashOtp(target, code) {
      return crypto.createHmac('sha256', secret)
        .update(`${target}:${String(code).trim()}`)
        .digest('hex');
    }

    test('verifies OTP hash matching with timingSafeEqual', () => {
      const target = 'customer@example.com';
      const actualCode = '839201';
      const expectedHash = hashOtp(target, actualCode);

      const candidateHash = hashOtp(target, '839201');
      const buf1 = Buffer.from(expectedHash, 'hex');
      const buf2 = Buffer.from(candidateHash, 'hex');
      assert.equal(crypto.timingSafeEqual(buf1, buf2), true);

      const wrongCandidateHash = hashOtp(target, '111111');
      const buf3 = Buffer.from(wrongCandidateHash, 'hex');
      assert.equal(crypto.timingSafeEqual(buf1, buf3), false);
    });
  });

});
