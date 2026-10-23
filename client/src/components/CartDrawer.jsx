import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Download,
  ShoppingBag,
  CreditCard,
  Sparkles,
  ShieldAlert,
  Lock,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '../stores/useCartStore';
import { useAuthStore } from '../stores/useAuthStore';

export default function CartDrawer({ onOpenAccount }) {
  const { isCartOpen, toggleCartDrawer, items, subtotal, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated, user, openAuthModal } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Address Selector (Rendered on TOP of products as required)
  const defaultAddress = user?.addresses?.[0] || {
    fullName: user?.name || 'Riya Sharma',
    phone: user?.phone || '9876543211',
    line1: 'Flat 402, Green Glen Layout, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560035'
  };

  const [selectedAddress, setSelectedAddress] = useState(defaultAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [storeSettings, setStoreSettings] = useState({
    freeShippingMinAmount: 499,
    shippingFee: 49
  });

  // Keep address in sync when user logs in or profile updates
  useEffect(() => {
    if (user?.addresses?.[0]) {
      setSelectedAddress(user.addresses[0]);
    } else if (user?.name) {
      setSelectedAddress(prev => ({
        ...prev,
        fullName: user.name,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStoreSettings(data.data);
        }
      })
      .catch(() => {});

    const handleSettingsUpdated = (e) => {
      if (e.detail) setStoreSettings(e.detail);
    };
    window.addEventListener('eshop_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('eshop_settings_updated', handleSettingsUpdated);
  }, []);

  // Dynamic Discount Calculation (purely according to percentage)
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    // Check if subtotal meets minOrderValue
    if (appliedCoupon.minOrderValue && subtotal < appliedCoupon.minOrderValue) {
      return 0;
    }

    if (appliedCoupon.discountPercentage) {
      let calc = Math.round(((subtotal || 0) * appliedCoupon.discountPercentage) / 100);
      return Math.min(calc, subtotal || 0);
    }

    return Math.min(appliedCoupon.discountAmount || appliedCoupon.discount || 0, subtotal || 0);
  }, [appliedCoupon, subtotal]);

  const isBelowMinOrder = Boolean(appliedCoupon?.minOrderValue && subtotal < appliedCoupon.minOrderValue);

  // Early return ONLY after all hooks have been declared
  if (!isCartOpen) return null;

  // Coupon Validation
  const handleApplyCoupon = async (codeOverride) => {
    const rawCode = (typeof codeOverride === 'string' ? codeOverride : couponCode).trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');
    if (!rawCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setValidatingCoupon(true);
    const token = localStorage.getItem('eshop_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: rawCode, subtotal })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Invalid coupon');

      setAppliedCoupon(data.data);
      setCouponCode(data.data.code);
      setCouponSuccess(data.message);
      setCouponError('');
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
      setCouponSuccess('');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Calculations
  const freeThreshold = Number(storeSettings.freeShippingMinAmount || 499);
  const baseShipping = Number(storeSettings.shippingFee !== undefined ? storeSettings.shippingFee : 49);
  const deliveryFee = subtotal >= freeThreshold ? 0 : baseShipping;
  const totalPayable = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Checkout Execution
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (user?.role?.toLowerCase() === 'admin') {
      alert('Administrators cannot place retail customer orders (RBAC compliance). Please sign in with a Customer account to make purchases.');
      return;
    }

    setIsPlacingOrder(true);
    const token = localStorage.getItem('eshop_token');

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress: selectedAddress,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          paymentMethod,
          items
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Checkout failed');

      setPlacedOrder(data.data);
      setAppliedCoupon(null);
      setCouponCode('');
      clearCart();

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err) {
      alert(err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleDownloadInvoice = async (orderId, invoiceNo) => {
    const token = localStorage.getItem('eshop_token');
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Invoice download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `E-Shop_Invoice_${invoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download invoice. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D0606]/60 backdrop-blur-sm transition-opacity"
        onClick={() => toggleCartDrawer(false)}
      />

      {/* Slide-out Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#FFFFFF] border-l border-[#E7DFD2] shadow-2xl flex flex-col z-10 animate-slide-left text-[#1F2421]">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#B8935A]/30 flex items-center justify-between bg-[#1E3A34] text-[#FAF6EF]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[6px] bg-[#C2603F] text-white">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#FAF6EF]">
                Shopping Bag & Checkout
              </h3>
              <p className="text-xs text-[#FAF6EF]/75 font-sans">
                {items.length} unique collection {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleCartDrawer(false)}
            className="p-2 rounded-[4px] text-[#FAF6EF]/75 hover:text-white hover:bg-[#2A524A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {placedOrder ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#4F7A5A]/15 border border-[#4F7A5A]/30 flex items-center justify-center text-[#4F7A5A] mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E3A34] font-serif">Order Placed Successfully!</h3>
            <p className="text-xs text-[#6B665E] max-w-xs font-sans">
              Thank you for shopping with E-Shop. Your order reference is <strong className="text-[#1E3A34] font-sans font-bold tabular-nums">{placedOrder.orderNo}</strong>.
            </p>

            <div className="w-full bg-[#FAF6EF] p-4 rounded-[6px] border border-[#E7DFD2] text-left text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-[#6B665E]">Invoice Number:</span>
                <span className="font-sans text-[#1F2421] font-bold tabular-nums">{placedOrder.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B665E]">Total Amount:</span>
                <span className="font-bold text-[#C2603F] tabular-nums">₹{placedOrder.pricing.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B665E]">Shipping Destination:</span>
                <span className="text-[#1F2421] tabular-nums">PIN {placedOrder.shippingAddress.pincode}</span>
              </div>
            </div>

            <button
              onClick={() => handleDownloadInvoice(placedOrder._id, placedOrder.invoiceNo)}
              className="btn-cta w-full py-3 rounded-[6px] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer bg-[#C2603F] hover:bg-[#A44E31] text-white shadow-sm"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download Vector PDF Invoice</span>
            </button>

            <button
              onClick={() => {
                toggleCartDrawer(false);
                setPlacedOrder(null);
                if (onOpenAccount) onOpenAccount('orders');
              }}
              className="text-xs text-[#1E3A34] hover:underline font-bold cursor-pointer"
            >
              View 5-Step Order Tracking &rarr;
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* 1. SAVED DELIVERY ADDRESS SELECTOR (Rendered on TOP of products as required) */}
            <div className="p-4 rounded-[6px] bg-[#FAF6EF] border border-[#E7DFD2]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#1E3A34] flex items-center gap-1.5 font-serif">
                  <MapPin className="w-4 h-4 text-[#B8935A]" />
                  <span>1. Delivery Destination</span>
                </span>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-[11px] text-[#C2603F] hover:text-[#A44E31] font-bold cursor-pointer"
                >
                  {isEditingAddress ? 'Save / Done' : 'Change Address'}
                </button>
              </div>

              {isEditingAddress ? (
                <div className="space-y-2 mt-2 pt-2 border-t border-[#E7DFD2] text-xs font-sans">
                  <input
                    type="text"
                    value={selectedAddress.fullName}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, fullName: e.target.value })}
                    placeholder="Recipient Full Name"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-[6px] px-3 py-1.5 text-xs text-[#1F2421]"
                  />
                  <input
                    type="text"
                    value={selectedAddress.phone}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-[6px] px-3 py-1.5 text-xs text-[#1F2421]"
                  />
                  <input
                    type="text"
                    value={selectedAddress.line1}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, line1: e.target.value })}
                    placeholder="Street Address / Flat No"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-[6px] px-3 py-1.5 text-xs text-[#1F2421]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedAddress.city}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, city: e.target.value })}
                      placeholder="City"
                      className="w-1/2 bg-[#FFFFFF] border border-[#E7DFD2] rounded-[6px] px-3 py-1.5 text-xs text-[#1F2421]"
                    />
                    <input
                      type="text"
                      maxLength={6}
                      value={selectedAddress.pincode}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, pincode: e.target.value })}
                      placeholder="PIN Code"
                      className="w-1/2 bg-[#FFFFFF] border border-[#E7DFD2] rounded-[6px] px-3 py-1.5 text-xs font-sans tabular-nums text-[#1F2421]"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#6B665E] space-y-0.5 mt-1 font-sans">
                  <p className="font-bold text-[#1F2421]">{selectedAddress.fullName} &bull; {selectedAddress.phone}</p>
                  <p>{selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state}</p>
                  <p className="text-[#1E3A34] font-sans font-bold tabular-nums">Postal Code: {selectedAddress.pincode}</p>
                </div>
              )}
            </div>

            {/* 2. ORDERED ITEMS LIST */}
            <div>
              <span className="text-xs font-bold text-[#6B665E] uppercase tracking-wider block mb-3 font-sans">
                2. Bag Contents ({items.length})
              </span>

              {items.length === 0 ? (
                <div className="text-center py-12 bg-[#FAF6EF] rounded-[6px] border border-[#E7DFD2]">
                  <ShoppingBag className="w-10 h-10 text-[#6B665E] mx-auto mb-2" />
                  <p className="text-xs text-[#6B665E]">Your shopping bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId || item._id}
                      className="flex items-center gap-3 p-3 rounded-[6px] bg-[#FAF6EF] border border-[#E7DFD2] font-sans"
                    >
                      <div className="w-16 h-16 rounded-[4px] overflow-hidden bg-[#FFFFFF] shrink-0 border border-[#E7DFD2] flex items-center justify-center p-1">
                        <img src={item.image} alt={item.name} className="max-w-full max-h-full w-auto h-auto object-contain" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-semibold text-[#1F2421] truncate">{item.name}</h5>
                        <p className="text-xs font-bold text-[#1F2421] mt-0.5 font-sans tabular-nums">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#E7DFD2] rounded-[4px] p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId || item._id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-[#FAF6EF] hover:bg-[#C2603F] hover:text-white text-[#1F2421] flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#C2603F] font-sans tabular-nums select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId || item._id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-[#C2603F] hover:bg-[#A44E31] text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId || item._id)}
                        className="text-[#6B665E] hover:text-[#A63D2F] p-1 cursor-pointer transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. PROMO CODE / COUPON FEATURE */}
            {items.length > 0 && (
              <div className="p-4 rounded-[6px] bg-[#FAF6EF] border border-[#E7DFD2] font-sans">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1E3A34] flex items-center gap-1.5 font-serif">
                    <Tag className="w-4 h-4 text-[#B8935A]" />
                    <span>3. Promotional Voucher</span>
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] text-[#A63D2F] hover:underline font-bold cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="p-3 rounded-[6px] bg-[#4F7A5A]/15 border border-[#4F7A5A]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-[4px] bg-[#4F7A5A]/25 text-[#4F7A5A] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-[#4F7A5A] tracking-wider">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] bg-[#4F7A5A] text-white font-bold px-1.5 py-0.5 rounded font-mono">
                            {appliedCoupon.discountPercentage}% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B665E] mt-0.5 truncate">
                          {discountAmount > 0
                            ? `Saving ₹${discountAmount.toLocaleString('en-IN')} on your order!`
                            : `Minimum order value of ₹${appliedCoupon.minOrderValue} required.`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[#6B665E] hover:text-[#A63D2F] p-1.5 transition-colors cursor-pointer"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApplyCoupon();
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter Code (SAVE10, MEGA20)"
                        className="flex-1 bg-[#FFFFFF] border border-[#E7DFD2] rounded-[6px] px-3 py-2 text-xs font-mono uppercase text-[#1F2421] placeholder-[#6B665E] focus:outline-none focus:border-[#1E3A34]"
                      />
                      <button
                        type="submit"
                        disabled={validatingCoupon}
                        className="btn-secondary text-xs px-4 py-2 rounded-[6px] font-bold cursor-pointer"
                      >
                        {validatingCoupon ? 'Validating...' : 'Apply'}
                      </button>
                    </form>

                    {/* Quick Available Promo Badges */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-[10px]">
                      <span className="text-[#6B665E]">Available:</span>
                      {['SAVE10', 'MEGA20', 'WELCOME50'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setCouponCode(code);
                            handleApplyCoupon(code);
                          }}
                          className="px-2 py-0.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#FAF6EF] text-[#1E3A34] border border-[#B8935A]/50 font-mono font-bold transition-all cursor-pointer"
                          title={`Click to apply ${code}`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {couponError && <p className="text-[11px] text-[#A63D2F] mt-2 font-medium">{couponError}</p>}
                {couponSuccess && !appliedCoupon && <p className="text-[11px] text-[#4F7A5A] mt-2 font-bold">{couponSuccess}</p>}
                {isBelowMinOrder && (
                  <p className="text-[11px] text-[#C2603F] mt-2 font-semibold">
                    ⚠️ Add ₹{(appliedCoupon.minOrderValue - subtotal).toLocaleString('en-IN')} more to your cart to activate the {appliedCoupon.code} discount.
                  </p>
                )}
              </div>
            )}

            {/* 4. PAYMENT METHOD */}
            {items.length > 0 && (
              <div className="p-4 rounded-[6px] bg-[#FAF6EF] border border-[#E7DFD2] font-sans">
                <span className="text-xs font-bold text-[#1E3A34] flex items-center gap-1.5 mb-2 font-serif">
                  <CreditCard className="w-4 h-4 text-[#B8935A]" />
                  <span>4. Payment Method</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  {['UPI', 'CARD', 'NETBANKING', 'COD'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-[6px] border text-center font-bold transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-[#1E3A34] text-white border-[#1E3A34] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#E7DFD2] text-[#6B665E] hover:text-[#1F2421]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* BOTTOM: ORDER SUMMARY & PLACE ORDER BUTTON */}
        {!placedOrder && items.length > 0 && (
          <div className="p-5 border-t border-[#E7DFD2] bg-[#FFFFFF] space-y-3 font-sans">
            <div className="space-y-1.5 text-xs text-[#6B665E]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-[#1F2421] font-sans tabular-nums">₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[#4F7A5A] font-bold bg-[#4F7A5A]/10 px-3 py-2 rounded-[6px] border border-[#4F7A5A]/25">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                  </span>
                  <span className="font-sans text-sm font-bold tabular-nums">- ₹{Number(discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Delivery Fee:</span>
                <span className={deliveryFee === 0 ? 'text-[#4F7A5A] font-bold' : 'text-[#1F2421] font-sans tabular-nums'}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm font-bold text-[#1F2421] pt-2 border-t border-[#E7DFD2]">
                <span>Total Amount:</span>
                <div className="text-right">
                  <span className="text-[#1E3A34] font-sans text-xl font-bold tabular-nums">
                    ₹{Number(totalPayable).toLocaleString('en-IN')}
                  </span>
                  {discountAmount > 0 && (
                    <span className="block text-[10px] text-[#4F7A5A] font-semibold mt-0.5">
                      (₹{Number(discountAmount).toLocaleString('en-IN')} saved with {appliedCoupon.code})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {user?.role?.toLowerCase() === 'admin' ? (
              <div className="space-y-2 pt-1">
                <div className="p-3 rounded-[6px] bg-[#FAF6EF] border border-[#B8935A]/40 text-[#1E3A34] flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-[#C2603F] mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-[#1E3A34] block font-serif text-xs">Admin Mode Active</span>
                    <p className="text-[10px] text-[#6B665E] mt-0.5 leading-snug">
                      Administrators are restricted from placing retail orders (RBAC rule). Switch to a Customer account to checkout.
                    </p>
                  </div>
                </div>
                <button
                  disabled
                  className="w-full py-3 rounded-[6px] bg-[#FAF6EF] text-[#6B665E] font-bold text-xs flex items-center justify-center gap-2 border border-[#E7DFD2] cursor-not-allowed select-none"
                >
                  <Lock className="w-3.5 h-3.5 text-[#6B665E]" />
                  <span>Purchasing Disabled for Admin</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className="w-full btn-cta py-3 rounded-[6px] font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider bg-[#C2603F] hover:bg-[#A44E31] text-white"
              >
                <span>{isPlacingOrder ? 'Processing...' : `Place Order & Pay ₹${Number(totalPayable).toLocaleString('en-IN')}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
