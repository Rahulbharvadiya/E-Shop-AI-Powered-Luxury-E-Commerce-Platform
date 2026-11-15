/**
 * Pricing Service (P2-11)
 * Pure, isolated functions for deterministic financial & order calculations.
 * Completely decoupled from controllers for rigorous unit testing.
 */

/**
 * Computes individual line item subtotal with safe integer rounding
 */
export function calculateItemTotal(unitPrice, quantity) {
  const p = Number(unitPrice) || 0;
  const q = Math.max(1, parseInt(quantity, 10) || 1);
  return Math.round(p * q);
}

/**
 * Computes the aggregate subtotal of cart / order line items
 */
export function calculateSubtotal(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const price = item.discountedPrice !== undefined ? item.discountedPrice : item.price;
    return sum + calculateItemTotal(price, item.quantity);
  }, 0);
}

/**
 * Computes coupon discount amount with percentage, min order validation, and maximum cap
 */
export function calculateCouponDiscount(subtotal, coupon) {
  if (!coupon || !coupon.active) {
    return { valid: false, discount: 0, reason: 'Coupon is inactive or not found.' };
  }

  const now = new Date();
  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
    return { valid: false, discount: 0, reason: 'Coupon has expired.' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, reason: 'Coupon has reached its maximum usage limit.' };
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      discount: 0,
      reason: `Minimum order value of INR ${coupon.minOrderValue} required for coupon '${coupon.code}'.`
    };
  }

  const pct = Math.max(0, Math.min(100, Number(coupon.discountPercentage) || 0));
  let discount = Math.round((subtotal * pct) / 100);

  if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }

  if (discount > subtotal) {
    discount = subtotal;
  }

  return { valid: true, discount, reason: null };
}

/**
 * Computes final net order total ensuring non-negative integers
 */
export function calculateOrderTotal({ subtotal = 0, discount = 0, deliveryFee = 0 }) {
  const s = Math.max(0, Number(subtotal) || 0);
  const d = Math.max(0, Number(discount) || 0);
  const f = Math.max(0, Number(deliveryFee) || 0);

  return Math.max(0, Math.round(s - d + f));
}

/**
 * Allowed Order State Machine Transitions (P1-2)
 */
export const ALLOWED_ORDER_TRANSITIONS = {
  ORDER_PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [], // Terminal
  CANCELLED: []  // Terminal
};

/**
 * Validates if an order state transition is permitted by the state machine
 */
export function isValidOrderTransition(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) return false;
  const allowed = ALLOWED_ORDER_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

