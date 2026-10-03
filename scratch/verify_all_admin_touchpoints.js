async function verifyAllAdminTouchpoints() {
  console.log('🧪 Starting Full-Scope Administrative Touchpoints & RBAC Verification...\n');
  let passedChecks = 0;
  let totalChecks = 0;

  function assert(condition, testName) {
    totalChecks++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedChecks++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  // 1. Admin Login
  const adminLoginRes = await (await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@eshop.com', password: 'AdminPassword@123' })
  })).json();

  const adminToken = adminLoginRes.data?.token || adminLoginRes.token;
  assert(adminLoginRes.success && adminToken, '1. Admin Authentication & Token Issuance');

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  // 2. Customer Login
  const custLoginRes = await (await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'customer@eshop.com', password: 'Customer@123' })
  })).json();

  const custToken = custLoginRes.data?.token || custLoginRes.token;
  assert(custLoginRes.success && custToken, '2. Customer Authentication & Token Issuance');

  const custHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${custToken}`
  };

  // 3. Admin Updates Store Settings & Live Announcement Ticker
  const updateSettingsRes = await (await fetch('http://localhost:5000/api/admin/settings', {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      announcementText: '🎉 GRAND DIWALI FESTIVAL: Flat 40% OFF with code FESTIVE40 | 2-Hour Express Delivery!',
      activePromoCode: 'FESTIVE40',
      freeShippingMinAmount: 699,
      shippingFee: 59
    })
  })).json();
  assert(updateSettingsRes.success && updateSettingsRes.data?.activePromoCode === 'FESTIVE40', '3. Admin Updates Store Settings & Live Ticker');

  // 4. Customer/Public Reads Store Settings
  const pubSettingsRes = await (await fetch('http://localhost:5000/api/settings')).json();
  assert(pubSettingsRes.data?.activePromoCode === 'FESTIVE40' && pubSettingsRes.data?.freeShippingMinAmount === 699, '4. Live Storefront Reflects Admin Settings Dynamically');

  // 5. Admin Generates Discount Promo Code
  const dynamicPromo = `FESTIVE${Date.now().toString().slice(-4)}`;
  const createCouponRes = await (await fetch('http://localhost:5000/api/admin/coupons', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      code: dynamicPromo,
      discountPercentage: 40,
      minOrderValue: 500,
      maxDiscountAmount: 2000,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    })
  })).json();
  assert(createCouponRes.success && createCouponRes.data?.code === dynamicPromo, `5. Admin Generates Promo Code ${dynamicPromo}`);

  // 6. Customer Applies Promo Code in Cart
  const validateCouponRes = await (await fetch('http://localhost:5000/api/coupons/validate', {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({ code: dynamicPromo, subtotal: 1000 })
  })).json();
  console.log('validateCouponRes data:', validateCouponRes.data);
  assert(validateCouponRes.success && (validateCouponRes.data?.discount === 400 || validateCouponRes.data?.discountAmount === 400), `6. Customer Validates Promo Code ${dynamicPromo}`);

  // 7. Admin Curated Category Control
  const categoriesList = await (await fetch('http://localhost:5000/api/admin/categories', { headers: adminHeaders })).json();
  assert(categoriesList.success && categoriesList.data?.length > 0, '7. Admin Lists All Visual Categories');

  const firstCat = categoriesList.data[0];
  const updateCatRes = await (await fetch(`http://localhost:5000/api/admin/categories/${firstCat._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ discountTag: 'FLAT 70% MEGA CLEARANCE' })
  })).json();
  assert(updateCatRes.success && updateCatRes.data?.discountTag === 'FLAT 70% MEGA CLEARANCE', '8. Admin Updates Category Discount Tag');

  const pubCategories = await (await fetch('http://localhost:5000/api/categories')).json();
  const updatedPubCat = pubCategories.data.find(c => c._id === firstCat._id);
  assert(updatedPubCat?.discountTag === 'FLAT 70% MEGA CLEARANCE', '9. Customer Landing Page Receives Updated Category Deal Tag');

  // 8. Admin Hero Banner Control
  const bannersList = await (await fetch('http://localhost:5000/api/admin/banners', { headers: adminHeaders })).json();
  assert(bannersList.success && bannersList.data?.length > 0, '10. Admin Lists Hero Banners');

  const firstBanner = bannersList.data[0];
  const updateBannerRes = await (await fetch(`http://localhost:5000/api/admin/banners/${firstBanner._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      title: 'Titanium Audio Excellence',
      discountTag: 'VIP EXCLUSIVE 50% OFF'
    })
  })).json();
  assert(updateBannerRes.success && updateBannerRes.data?.discountTag === 'VIP EXCLUSIVE 50% OFF', '11. Admin Updates Hero Banner Headline & Discount Tag');

  const pubBanners = await (await fetch('http://localhost:5000/api/banners')).json();
  const updatedPubBanner = pubBanners.data.find(b => b._id === firstBanner._id);
  assert(updatedPubBanner?.discountTag === 'VIP EXCLUSIVE 50% OFF', '12. Customer Auto-Slide Carousel Receives Updated Hero Poster');

  // 9. Admin Review Governance
  const adminReviewsRes = await (await fetch('http://localhost:5000/api/admin/reviews', { headers: adminHeaders })).json();
  assert(adminReviewsRes.success, '13. Admin Reviews Moderation Endpoint Functional');

  // 10. Strict RBAC: Admin Cannot Purchase
  const adminCheckoutRes = await (await fetch('http://localhost:5000/api/orders/checkout', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Admin User',
        phone: '9999999999',
        line1: 'Corporate HQ',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560035'
      },
      paymentMethod: 'UPI'
    })
  })).json();
  assert(!adminCheckoutRes.success && adminCheckoutRes.message.includes('Administrative accounts are restricted'), '14. Strict RBAC: Backend Blocks Admin Retail Purchasing (403)');

  console.log(`\n========================================`);
  console.log(`Verification Complete: ${passedChecks}/${totalChecks} Checks Passed!`);
  console.log(`========================================\n`);
}

verifyAllAdminTouchpoints();
