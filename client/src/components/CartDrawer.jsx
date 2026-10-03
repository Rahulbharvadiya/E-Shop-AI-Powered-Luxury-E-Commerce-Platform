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
    <div className="fixed inset-0 z-50 flex justify-end font-poppins">
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D0606]/80 backdrop-blur-sm transition-opacity"
        onClick={() => toggleCartDrawer(false)}
      />

      {/* Slide-out Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#0D0606] border-l border-[#F8F6F6]/10 shadow-2xl flex flex-col z-10 animate-slide-left">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#F8F6F6]/10 flex items-center justify-between bg-[#140B0B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF9E00]/15 text-[#FF9E00]">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-giliran font-extrabold text-[#F8F6F6]">
                Shopping Bag & Checkout
              </h3>
              <p className="text-xs text-[#B8B0B0]">
                {items.length} unique collection {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleCartDrawer(false)}
            className="p-2 rounded-xl text-[#B8B0B0] hover:text-[#F8F6F6] hover:bg-[#201313] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {placedOrder ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FF9E00]/15 border border-[#FF9E00]/30 flex items-center justify-center text-[#FF9E00] mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#F8F6F6] font-giliran">Order Placed Successfully!</h3>
            <p className="text-xs text-[#B8B0B0] max-w-xs font-poppins">
              Thank you for shopping with E-Shop. Your order reference is <strong className="text-[#FF9E00] font-mono">{placedOrder.orderNo}</strong>.
            </p>

            <div className="w-full bg-[#140B0B] p-4 rounded-2xl border border-[#F8F6F6]/10 text-left text-xs space-y-1.5 font-poppins">
              <div className="flex justify-between">
                <span className="text-[#786E6E]">Invoice Number:</span>
                <span className="font-mono text-[#F8F6F6] font-bold">{placedOrder.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#786E6E]">Total Amount:</span>
                <span className="font-bold text-[#FF9E00]">₹{placedOrder.pricing.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#786E6E]">Shipping Destination:</span>
                <span className="text-[#F8F6F6]">PIN {placedOrder.shippingAddress.pincode}</span>
              </div>
            </div>

            <button
              onClick={() => handleDownloadInvoice(placedOrder._id, placedOrder.invoiceNo)}
              className="w-full btn-theme-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
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
              className="text-xs text-[#FF9E00] hover:underline font-bold"
            >
              View 5-Step Order Tracking &rarr;
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* 1. SAVED DELIVERY ADDRESS SELECTOR (Rendered on TOP of products as required) */}
            <div className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#F8F6F6] flex items-center gap-1.5 font-giliran">
                  <MapPin className="w-4 h-4 text-[#FF9E00]" />
                  <span>1. Delivery Destination</span>
                </span>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-[11px] text-[#FF9E00] hover:text-[#FFAE26] font-bold"
                >
                  {isEditingAddress ? 'Save / Done' : 'Change Address'}
                </button>
              </div>

              {isEditingAddress ? (
                <div className="space-y-2 mt-2 pt-2 border-t border-[#F8F6F6]/10 text-xs font-poppins">
                  <input
                    type="text"
                    value={selectedAddress.fullName}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, fullName: e.target.value })}
                    placeholder="Recipient Full Name"
                    className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-1.5 text-xs text-[#F8F6F6]"
                  />
                  <input
                    type="text"
                    value={selectedAddress.phone}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-1.5 text-xs text-[#F8F6F6]"
                  />
                  <input
                    type="text"
                    value={selectedAddress.line1}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, line1: e.target.value })}
                    placeholder="Street Address / Flat No"
                    className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-1.5 text-xs text-[#F8F6F6]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedAddress.city}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, city: e.target.value })}
                      placeholder="City"
                      className="w-1/2 bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-1.5 text-xs text-[#F8F6F6]"
                    />
                    <input
                      type="text"
                      maxLength={6}
                      value={selectedAddress.pincode}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, pincode: e.target.value })}
                      placeholder="PIN Code"
                      className="w-1/2 bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-1.5 text-xs font-mono text-[#F8F6F6]"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#B8B0B0] space-y-0.5 mt-1 font-poppins">
                  <p className="font-bold text-[#F8F6F6]">{selectedAddress.fullName} &bull; {selectedAddress.phone}</p>
                  <p>{selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state}</p>
                  <p className="text-[#FF9E00] font-mono font-bold">Postal Code: {selectedAddress.pincode}</p>
                </div>
              )}
            </div>

            {/* 2. ORDERED ITEMS LIST */}
            <div>
              <span className="text-xs font-bold text-[#786E6E] uppercase tracking-wider block mb-3 font-poppins">
                2. Bag Contents ({items.length})
              </span>

              {items.length === 0 ? (
                <div className="text-center py-12 bg-[#140B0B] rounded-2xl border border-[#F8F6F6]/10">
                  <ShoppingBag className="w-10 h-10 text-[#786E6E] mx-auto mb-2" />
                  <p className="text-xs text-[#786E6E]">Your shopping bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId || item._id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 font-poppins"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0D0606] shrink-0 border border-[#F8F6F6]/10 flex items-center justify-center p-1">
                        <img src={item.image} alt={item.name} className="max-w-full max-h-full w-auto h-auto object-contain" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-[#F8F6F6] truncate">{item.name}</h5>
                        <p className="text-xs font-bold text-[#FF9E00] mt-0.5 font-mono">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center gap-1 bg-[#0D0606] border border-[#F8F6F6]/15 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId || item._id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-[#160D0D] hover:bg-[#FF9E00] hover:text-[#0D0606] text-[#F8F6F6] flex items-center justify-center text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#FF9E00] font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId || item._id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-[#FF9E00] hover:bg-[#FFAE26] text-[#0D0606] flex items-center justify-center text-xs font-bold"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId || item._id)}
                        className="text-[#786E6E] hover:text-rose-400 p-1"
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
              <div className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 font-poppins">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#F8F6F6] flex items-center gap-1.5 font-giliran">
                    <Tag className="w-4 h-4 text-[#FF9E00]" />
                    <span>3. Promotional Voucher</span>
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-emerald-400 tracking-wider">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] bg-emerald-500 text-[#0D0606] font-bold px-1.5 py-0.5 rounded font-mono">
                            {appliedCoupon.discountPercentage}% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-[#B8B0B0] mt-0.5 truncate">
                          {discountAmount > 0
                            ? `Saving ₹${discountAmount.toLocaleString('en-IN')} on your order!`
                            : `Minimum order value of ₹${appliedCoupon.minOrderValue} required.`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[#786E6E] hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
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
                        className="flex-1 bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-xs font-mono uppercase text-[#F8F6F6] placeholder-[#786E6E] focus:outline-none focus:border-[#FF9E00]"
                      />
                      <button
                        type="submit"
                        disabled={validatingCoupon}
                        className="btn-theme-secondary text-xs px-4 py-2 rounded-xl text-[#FF9E00] font-bold cursor-pointer"
                      >
                        {validatingCoupon ? 'Validating...' : 'Apply'}
                      </button>
                    </form>

                    {/* Quick Available Promo Badges */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-[10px]">
                      <span className="text-[#786E6E]">Available:</span>
                      {['SAVE10', 'MEGA20', 'WELCOME50'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setCouponCode(code);
                            handleApplyCoupon(code);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-[#1F1212] hover:bg-[#FF9E00]/20 text-[#FF9E00] border border-[#FF9E00]/25 font-mono font-bold transition-all cursor-pointer"
                          title={`Click to apply ${code}`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {couponError && <p className="text-[11px] text-rose-400 mt-2 font-medium">{couponError}</p>}
                {couponSuccess && !appliedCoupon && <p className="text-[11px] text-emerald-400 mt-2 font-bold">{couponSuccess}</p>}
                {isBelowMinOrder && (
                  <p className="text-[11px] text-[#FFAE26] mt-2 font-semibold">
                    ⚠️ Add ₹{(appliedCoupon.minOrderValue - subtotal).toLocaleString('en-IN')} more to your cart to activate the {appliedCoupon.code} discount.
                  </p>
                )}
              </div>
            )}

            {/* 4. PAYMENT METHOD */}
            {items.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 font-poppins">
                <span className="text-xs font-bold text-[#F8F6F6] flex items-center gap-1.5 mb-2 font-giliran">
                  <CreditCard className="w-4 h-4 text-[#FF9E00]" />
                  <span>4. Payment Method</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-poppins">
                  {['UPI', 'CARD', 'NETBANKING', 'COD'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-[#FF9E00] text-[#0D0606] border-[#FF9E00] shadow-md shadow-[#FF9E00]/25'
                          : 'bg-[#160D0D] border-[#F8F6F6]/10 text-[#B8B0B0] hover:text-[#F8F6F6]'
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
          <div className="p-5 border-t border-[#F8F6F6]/10 bg-[#140B0B] space-y-3 font-poppins">
            <div className="space-y-1.5 text-xs text-[#B8B0B0]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-[#F8F6F6] font-mono">₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/25">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                  </span>
                  <span className="font-mono text-sm font-black">- ₹{Number(discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Delivery Fee:</span>
                <span className={deliveryFee === 0 ? 'text-[#FF9E00] font-bold' : 'text-[#F8F6F6] font-mono'}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm font-extrabold text-[#F8F6F6] pt-2 border-t border-[#F8F6F6]/10">
                <span>Total Amount:</span>
                <div className="text-right">
                  <span className="text-[#FF9E00] font-mono text-lg font-black">
                    ₹{Number(totalPayable).toLocaleString('en-IN')}
                  </span>
                  {discountAmount > 0 && (
                    <span className="block text-[10px] text-emerald-400 font-semibold mt-0.5">
                      (₹{Number(discountAmount).toLocaleString('en-IN')} saved with {appliedCoupon.code})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {user?.role?.toLowerCase() === 'admin' ? (
              <div className="space-y-2 pt-1">
                <div className="p-3 rounded-xl bg-[#FF9E00]/10 border border-[#FF9E00]/40 text-[#FF9E00] flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-[#FF9E00] mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-[#F8F6F6] block font-giliran text-xs">Admin Mode Active</span>
                    <p className="text-[10px] text-[#B8B0B0] mt-0.5 leading-snug">
                      Administrators are restricted from placing retail orders (RBAC rule). Switch to a Customer account to checkout.
                    </p>
                  </div>
                </div>
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-[#1C1111] text-[#786E6E] font-bold text-xs flex items-center justify-center gap-2 border border-[#F8F6F6]/10 cursor-not-allowed select-none"
                >
                  <Lock className="w-3.5 h-3.5 text-[#786E6E]" />
                  <span>Purchasing Disabled for Admin</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className="w-full btn-theme-primary py-3 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
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
