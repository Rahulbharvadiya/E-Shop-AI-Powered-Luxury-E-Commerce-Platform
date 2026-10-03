// Pincode Delivery Intelligence Service
// Defaults: 560035 (Customer default) & 560001 (Warehouse hub)

const PINCODE_DATABASE = {
  // Karnataka (Hub & Local)
  '560001': { city: 'Bengaluru (Central GPO)', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  '560035': { city: 'Bengaluru (Sarjapur / Carmelaram)', state: 'Karnataka', lat: 12.9100, lng: 77.6950 },
  '560034': { city: 'Bengaluru (Koramangala)', state: 'Karnataka', lat: 12.9352, lng: 77.6245 },
  '560066': { city: 'Bengaluru (Whitefield)', state: 'Karnataka', lat: 12.9698, lng: 77.7500 },
  '560100': { city: 'Bengaluru (Electronic City)', state: 'Karnataka', lat: 12.8399, lng: 77.6770 },
  '570001': { city: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
  '575001': { city: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },
  
  // Metro Hubs
  '110001': { city: 'New Delhi (Connaught Place)', state: 'Delhi', lat: 28.6304, lng: 77.2177 },
  '400001': { city: 'Mumbai (Fort / GPO)', state: 'Maharashtra', lat: 18.9400, lng: 72.8350 },
  '600001': { city: 'Chennai (George Town)', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  '700001': { city: 'Kolkata (BBD Bagh)', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  '500001': { city: 'Hyderabad (Abids)', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  '411001': { city: 'Pune (Station)', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  '302001': { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 }
};

// Haversine formula to compute distance in km
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function estimateDelivery(pincode, subtotal = 0) {
  const cleanPin = String(pincode || '560035').trim();
  const originHub = PINCODE_DATABASE['560001'];
  
  let target = PINCODE_DATABASE[cleanPin];
  let distanceKm = 14.5;
  let city = 'Bengaluru Local';
  let state = 'Karnataka';

  if (target) {
    city = target.city;
    state = target.state;
    distanceKm = calculateHaversineDistance(originHub.lat, originHub.lng, target.lat, target.lng);
  } else {
    // Estimator for generic 6-digit Indian PIN based on first digit zone
    const firstDigit = cleanPin[0];
    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      throw new Error('Please enter a valid 6-digit Indian postal code');
    }
    if (firstDigit === '5') {
      distanceKm = 180; // South zone
      city = 'Regional Zone (South India)';
      state = 'South Zone';
    } else {
      distanceKm = 1250; // National
      city = 'National Zone';
      state = 'National Express';
    }
  }

  // Delivery estimation logic
  let estimatedDays = 1;
  let shippingFee = 0;
  let deliveryFormatted = 'Tomorrow by 9:00 PM';
  const now = new Date();

  if (distanceKm <= 30) {
    // Intra-city / Same Day or Next Day
    estimatedDays = 1;
    shippingFee = 0;
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    deliveryFormatted = `Tomorrow (${tomorrow.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}) by 9:00 PM`;
  } else if (distanceKm <= 350) {
    // Regional zone
    estimatedDays = 2;
    shippingFee = subtotal >= 499 ? 0 : 40;
    const arrivalDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    deliveryFormatted = `In 2 Days (${arrivalDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })})`;
  } else {
    // National express
    estimatedDays = Math.min(6, 3 + Math.ceil(distanceKm / 500));
    shippingFee = subtotal >= 999 ? 0 : 70;
    const arrivalDate = new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
    deliveryFormatted = `In ${estimatedDays} Days (${arrivalDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })})`;
  }

  return {
    pincode: cleanPin,
    city,
    state,
    distanceKm,
    estimatedDays,
    deliveryFormatted,
    shippingFee,
    isFreeDelivery: shippingFee === 0,
    isCodAvailable: true,
    originHub: '560001 (Bengaluru Central GPO)'
  };
}
