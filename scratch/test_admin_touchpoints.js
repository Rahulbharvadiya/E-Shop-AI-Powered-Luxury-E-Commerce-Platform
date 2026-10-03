
async function testTouchpoints() {
  console.log('--- Testing Admin Touchpoint Controls ---');

  // 1. Test Public Settings
  const pubSettingsRes = await fetch('http://localhost:5000/api/settings');
  const pubSettings = await pubSettingsRes.json();
  console.log('1. Public settings status:', pubSettingsRes.status, 'Announcement:', pubSettings.data?.announcementText?.slice(0, 40));

  // 2. Login as Admin
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@eshop.com', password: 'AdminPassword@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  console.log('2. Admin login status:', loginRes.status, 'Token obtained:', !!token);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 3. Update Store Settings
  const updateSettingsRes = await fetch('http://localhost:5000/api/admin/settings', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      announcementText: '🔥 FESTIVE GRAND SALE: Flat 30% OFF using code FESTIVE30 • Free Next-Day Delivery across India!',
      activePromoCode: 'FESTIVE30',
      freeShippingMinAmount: 799,
      shippingFee: 59
    })
  });
  const updateSettingsData = await updateSettingsRes.json();
  console.log('3. Update settings status:', updateSettingsRes.status, 'Updated Code:', updateSettingsData.data?.activePromoCode);

  // 4. Verify Public Settings Reflection
  const pubSettingsVerify = await (await fetch('http://localhost:5000/api/settings')).json();
  console.log('4. Verify public settings reflected:', pubSettingsVerify.data?.activePromoCode === 'FESTIVE30' ? 'PASS' : 'FAIL');

  // 5. Category Management: List
  const catListRes = await fetch('http://localhost:5000/api/admin/categories', { headers: authHeaders });
  const catListData = await catListRes.json();
  console.log('5. Categories list count:', catListData.data?.length, 'First cat:', catListData.data?.[0]?.name);

  // 6. Category Management: Create
  const testCatSlug = `test-luxury-${Date.now()}`;
  const createCatRes = await fetch('http://localhost:5000/api/admin/categories', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Luxury Fragrance',
      slug: testCatSlug,
      imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400',
      discountTag: 'Flat 40% Off',
      displayOrder: 9
    })
  });
  const createCatData = await createCatRes.json();
  console.log('6. Create Category status:', createCatRes.status, 'New Cat ID:', createCatData.data?._id);
  const newCatId = createCatData.data?._id;

  // 7. Category Management: Update
  if (newCatId) {
    const updateCatRes = await fetch(`http://localhost:5000/api/admin/categories/${newCatId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        discountTag: 'Flat 60% Mega Deal'
      })
    });
    const updateCatData = await updateCatRes.json();
    console.log('7. Update Category discountTag:', updateCatData.data?.discountTag);

    // 8. Category Management: Delete
    const deleteCatRes = await fetch(`http://localhost:5000/api/admin/categories/${newCatId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    console.log('8. Delete Category status:', deleteCatRes.status);
  }

  // 9. Admin Reviews: List
  const reviewsRes = await fetch('http://localhost:5000/api/admin/reviews', { headers: authHeaders });
  const reviewsData = await reviewsRes.json();
  console.log('9. Reviews list status:', reviewsRes.status, 'Total reviews in DB:', reviewsData.data?.length);

  // 10. Banners Management: List and Update
  const bannersRes = await fetch('http://localhost:5000/api/admin/banners', { headers: authHeaders });
  const bannersData = await bannersRes.json();
  console.log('10. Banners count:', bannersData.data?.length);
  if (bannersData.data?.length > 0) {
    const bannerId = bannersData.data[0]._id;
    const updateBannerRes = await fetch(`http://localhost:5000/api/admin/banners/${bannerId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        discountTag: 'VIP SPECIAL OFFER'
      })
    });
    console.log('10b. Update Banner status:', updateBannerRes.status);
  }

  console.log('--- Touchpoint Controls Test Complete ---');
}

testTouchpoints();
