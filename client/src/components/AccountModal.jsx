import React, { useState, useEffect } from 'react';
import { 
  X, User, Package, MapPin, Download, AlertCircle, CheckCircle2, 
  Clock, Truck, Check, ChevronRight, Edit3, Trash2, Plus, ShieldCheck, Ban
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
];

const ORDER_STEPS = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Received & acknowledged' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Verified & packaged' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'In transit from warehouse' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier en route' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over' }
];

export default function AccountModal({ isOpen, onClose, initialTab = 'orders' }) {
  const { user, token, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Address edit state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '560035', isDefault: false
  });

  // Order address edit state
  const [orderAddressToEdit, setOrderAddressToEdit] = useState(null);

  // Cancel order prompt state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Found a better price elsewhere');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || AVATAR_PRESETS[0]
  });
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || AVATAR_PRESETS[0]
      });
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && activeTab === 'orders' && token) {
      fetchMyOrders();
    }
  }, [isOpen, activeTab, token]);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
        if (data.data?.length > 0 && !selectedOrder) {
          setSelectedOrder(data.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        updateUser(data.data);
        setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setProfileMsg({ text: data.message || 'Failed to update', type: 'error' });
      }
    } catch (e) {
      setProfileMsg({ text: 'Server error updating profile', type: 'error' });
    }
  };

  const handleDownloadInvoice = async (orderId, orderNo) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Invoice download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderNo || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Could not download invoice. Please try again.');
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      const res = await fetch(`/api/orders/${orderToCancel._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setOrderToCancel(null);
        fetchMyOrders();
      } else {
        alert(data.message || 'Could not cancel order');
      }
    } catch (e) {
      alert('Network error while cancelling order');
    }
  };

  const handleSaveOrderAddress = async (e) => {
    e.preventDefault();
    if (!orderAddressToEdit) return;
    try {
      const res = await fetch(`/api/orders/${orderAddressToEdit._id}/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress: addressForm })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order delivery address updated successfully!');
        setOrderAddressToEdit(null);
        fetchMyOrders();
      } else {
        alert(data.message || 'Failed to update address');
      }
    } catch (e) {
      alert('Error updating address');
    }
  };

  const handleSaveProfileAddress = async (e) => {
    e.preventDefault();
    try {
      const currentAddresses = user?.addresses || [];
      const updated = [...currentAddresses, addressForm];
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: updated })
      });
      const data = await res.json();
      if (data.success) {
        updateUser(data.data);
        setIsEditingAddress(false);
        setAddressForm({
          fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '560035', isDefault: false
        });
      }
    } catch (e) {
      alert('Failed to save address');
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'ORDER_PLACED': return 0;
      case 'CONFIRMED': return 1;
      case 'SHIPPED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return -1;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0D0606]/65 backdrop-blur-sm animate-fade-in font-sans">
        <div className="relative w-full max-w-4xl bg-[#FFFFFF] border border-[#E7DFD2] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#1F2421]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#B8935A]/30 flex items-center justify-between bg-[#1E3A34] text-[#FAF6EF]">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatar || AVATAR_PRESETS[0]} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full object-cover border-2 border-[#B8935A] shadow-md"
            />
            <div>
              <h2 className="text-base font-serif font-bold text-[#FAF6EF] flex items-center gap-2">
                {user?.name || 'Customer Account'}
                {user?.role === 'admin' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#B8935A] text-[#1E3A34] font-mono">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#FAF6EF]/70 font-sans">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-[#FAF6EF]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#E7DFD2] bg-[#FAF6EF] px-6 gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#C2603F] text-[#C2603F]'
                : 'border-transparent text-[#6B665E] hover:text-[#1E3A34]'
            }`}
          >
            <Package className="w-4 h-4" />
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-[#C2603F] text-[#C2603F]'
                : 'border-transparent text-[#6B665E] hover:text-[#1E3A34]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#C2603F] text-[#C2603F]'
                : 'border-transparent text-[#6B665E] hover:text-[#1E3A34]'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Settings
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#FFFFFF]">
          {/* TAB 1: ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {loadingOrders ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-[#C2603F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-[#6B665E]">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-[#FAF6EF] rounded-xl border border-[#E7DFD2]">
                  <Package className="w-12 h-12 text-[#6B665E] mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#1E3A34] font-serif">No Orders Yet</h3>
                  <p className="text-xs text-[#6B665E] mt-1 max-w-xs mx-auto">
                    Explore our trending collections and place your first order today.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Orders List */}
                  <div className="md:col-span-1 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {orders.map((ord) => {
                      const isSelected = selectedOrder?._id === ord._id;
                      return (
                        <div
                          key={ord._id}
                          onClick={() => setSelectedOrder(ord)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FAF6EF] border-[#B8935A] ring-1 ring-[#B8935A]/30 shadow-sm'
                              : 'bg-[#FFFFFF] border-[#E7DFD2] hover:border-[#B8935A]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-mono font-bold text-[#1F2421]">{ord.orderNo}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                              ord.orderStatus === 'DELIVERED' ? 'badge-sage' :
                              ord.orderStatus === 'CANCELLED' ? 'badge-discount' :
                              'badge-gold'
                            }`}>
                              {ord.orderStatus.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6B665E]">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </div>
                          <div className="mt-2 text-sm font-bold text-[#1E3A34] font-mono tabular-nums">
                            ₹{ord.pricing?.total?.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#6B665E] mt-0.5">
                            {ord.items?.length} item{ord.items?.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Selected Order Detail & 5-Step Stepper */}
                  <div className="md:col-span-2 bg-[#FAF6EF] border border-[#E7DFD2] rounded-xl p-5 space-y-6">
                    {selectedOrder ? (
                      <>
                        {/* Order Header & Invoice */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E7DFD2]">
                          <div>
                            <span className="text-xs text-[#6B665E] block font-semibold uppercase tracking-wider">Order Reference</span>
                            <div className="font-mono text-base font-bold text-[#1E3A34] flex items-center gap-2">
                              {selectedOrder.orderNo}
                              <span className="text-xs text-[#6B665E] font-normal">
                                ({selectedOrder.invoiceNo})
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadInvoice(selectedOrder._id, selectedOrder.orderNo)}
                            className="btn-secondary flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF Invoice
                          </button>
                        </div>

                        {/* 5-Step Visual Stepper */}
                        {selectedOrder.orderStatus === 'CANCELLED' ? (
                          <div className="p-4 bg-[#A63D2F]/10 border border-[#A63D2F]/30 rounded-xl flex items-center gap-3 text-[#A63D2F] text-xs">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <div>
                              <span className="font-bold">This order has been CANCELLED.</span>
                              <p className="text-[11px] text-[#6B665E] mt-0.5">
                                Reason: {selectedOrder.timeline?.find(t => t.status === 'CANCELLED')?.note || 'Cancelled by customer'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <span className="text-[11px] font-bold text-[#1E3A34] uppercase tracking-wider block">
                              Live Delivery Tracking (5-Step Visual Stepper)
                            </span>
                            <div className="relative flex justify-between items-center px-2">
                              {/* Horizontal connector line */}
                              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-[#E7DFD2] -z-0" />
                              <div 
                                className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-[#4F7A5A] -z-0 transition-all duration-700"
                                style={{
                                  width: `${(getStepIndex(selectedOrder.orderStatus) / 4) * 88}%`
                                }}
                              />

                              {ORDER_STEPS.map((step, idx) => {
                                const activeIdx = getStepIndex(selectedOrder.orderStatus);
                                const isPassed = activeIdx >= idx;
                                const isCurrent = activeIdx === idx;
                                return (
                                  <div key={step.key} className="flex flex-col items-center relative z-10">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all font-mono ${
                                        isCurrent
                                          ? 'bg-[#4F7A5A] text-white ring-4 ring-[#4F7A5A]/25 shadow-md scale-110'
                                          : isPassed
                                          ? 'bg-[#4F7A5A] text-white'
                                          : 'bg-[#FFFFFF] border border-[#E7DFD2] text-[#6B665E]'
                                      }`}
                                    >
                                      {isPassed && !isCurrent ? (
                                        <Check className="w-4 h-4 stroke-[3]" />
                                      ) : (
                                        idx + 1
                                      )}
                                    </div>
                                    <span className={`text-[10px] font-bold mt-2 text-center max-w-[65px] ${
                                      isCurrent ? 'text-[#4F7A5A]' : isPassed ? 'text-[#1F2421]' : 'text-[#6B665E]'
                                    }`}>
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Items preview */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-[#1E3A34] uppercase tracking-wider block">
                            Ordered Items
                          </span>
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                            {selectedOrder.items?.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E7DFD2] text-xs">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF6EF] border border-[#E7DFD2] flex items-center justify-center p-0.5 shrink-0">
                                    <img src={it.image} alt={it.name} className="max-w-full max-h-full w-auto h-auto object-contain" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#1F2421] truncate max-w-xs">{it.name}</p>
                                    <p className="text-[#6B665E] text-[11px]">Qty: {it.quantity} &times; ₹{it.price?.toLocaleString()}</p>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-[#1E3A34] tabular-nums">₹{it.subtotal?.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address & Modification Policy Gate */}
                        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E7DFD2] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1E3A34] flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#1E3A34]" />
                              Shipping Address
                            </span>
                            {/* Address Modification Gate */}
                            {['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(selectedOrder.orderStatus) ? (
                              <span className="text-[10px] text-[#6B665E] flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-[#6B665E]" />
                                Address Locked
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setOrderAddressToEdit(selectedOrder);
                                  setAddressForm({
                                    fullName: selectedOrder.shippingAddress?.fullName || '',
                                    phone: selectedOrder.shippingAddress?.phone || '',
                                    line1: selectedOrder.shippingAddress?.line1 || '',
                                    line2: selectedOrder.shippingAddress?.line2 || '',
                                    city: selectedOrder.shippingAddress?.city || '',
                                    state: selectedOrder.shippingAddress?.state || '',
                                    pincode: selectedOrder.shippingAddress?.pincode || '560035',
                                    isDefault: false
                                  });
                                }}
                                className="text-[11px] text-[#C2603F] hover:text-[#A44E31] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                Edit Address
                              </button>
                            )}
                          </div>
                          <p className="text-[#6B665E] leading-relaxed">
                            {selectedOrder.shippingAddress?.fullName} ({selectedOrder.shippingAddress?.phone})<br />
                            {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - <strong className="text-[#1E3A34] font-mono">{selectedOrder.shippingAddress?.pincode}</strong>
                          </p>
                        </div>

                        {/* Strict Policy Gate: Order Cancellation */}
                        <div className="pt-2 flex items-center justify-between border-t border-[#E7DFD2]">
                          {['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(selectedOrder.orderStatus) ? (
                            <div className="text-xs text-[#6B665E] flex items-center gap-1.5">
                              <Ban className="w-4 h-4 text-[#6B665E]" />
                              <span>
                                {selectedOrder.orderStatus === 'CANCELLED' 
                                  ? 'Order already cancelled' 
                                  : 'Cannot cancel once Out for Delivery or Delivered'}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setOrderToCancel(selectedOrder)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#A63D2F]/10 hover:bg-[#A63D2F]/20 text-[#A63D2F] text-xs font-bold border border-[#A63D2F]/30 transition-colors cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}

                          <div className="text-right">
                            {selectedOrder.pricing?.discount > 0 && (
                              <span className="text-[11px] text-[#4F7A5A] block font-mono font-semibold">
                                Voucher: -₹{selectedOrder.pricing.discount.toLocaleString()}
                              </span>
                            )}
                            <span className="text-[10px] text-[#6B665E] block uppercase tracking-wider">Total</span>
                            <span className="text-base font-bold text-[#1E3A34] font-mono tabular-nums">
                              ₹{selectedOrder.pricing?.total?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1E3A34] font-serif">Delivery Addresses</h3>
                  <p className="text-xs text-[#6B665E]">Manage your shipping destinations</p>
                </div>
                {!isEditingAddress && (
                  <button
                    onClick={() => {
                      setAddressForm({
                        fullName: user?.name || '',
                        phone: user?.phone || '',
                        line1: '',
                        line2: '',
                        city: 'Bengaluru',
                        state: 'Karnataka',
                        pincode: '560035',
                        isDefault: (user?.addresses || []).length === 0
                      });
                      setIsEditingAddress(true);
                    }}
                    className="btn-cta text-xs py-2 px-3.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Address
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleSaveProfileAddress} className="bg-[#FAF6EF] p-5 rounded-xl border border-[#E7DFD2] space-y-4">
                  <h4 className="text-sm font-bold text-[#1E3A34] font-serif">New Address Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[#6B665E] block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={addressForm.fullName} 
                        onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                      />
                    </div>
                    <div>
                      <label className="text-[#6B665E] block mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        value={addressForm.phone} 
                        onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[#6B665E] block mb-1">Street Address</label>
                      <input 
                        type="text" 
                        required 
                        value={addressForm.line1} 
                        onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                      />
                    </div>
                    <div>
                      <label className="text-[#6B665E] block mb-1">City</label>
                      <input 
                        type="text" 
                        required 
                        value={addressForm.city} 
                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                      />
                    </div>
                    <div>
                      <label className="text-[#6B665E] block mb-1">PIN Code (Default 560035)</label>
                      <input 
                        type="text" 
                        required 
                        value={addressForm.pincode} 
                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="btn-secondary px-4 py-2 rounded-lg text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-cta px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(user?.addresses || []).length === 0 ? (
                    <div className="md:col-span-2 text-center py-10 bg-[#FAF6EF] rounded-xl border border-[#E7DFD2] text-[#6B665E] text-xs">
                      No saved addresses yet.
                    </div>
                  ) : (
                    user.addresses.map((addr, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#FAF6EF] border border-[#E7DFD2] text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1F2421]">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="badge-gold text-[10px] font-mono font-bold px-2 py-0.5">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[#6B665E] leading-relaxed">
                          {addr.line1}<br />
                          {addr.city}, {addr.state} - <strong className="text-[#1E3A34] font-mono">{addr.pincode}</strong><br />
                          Phone: {addr.phone}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto space-y-6">
              <form onSubmit={handleUpdateProfile} className="space-y-5 bg-[#FAF6EF] p-6 rounded-xl border border-[#E7DFD2]">
                <h3 className="text-base font-bold text-[#1E3A34] font-serif">Edit Profile Details</h3>
                
                {profileMsg.text && (
                  <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    profileMsg.type === 'success' ? 'bg-[#4F7A5A]/10 text-[#4F7A5A] border border-[#4F7A5A]/30' : 'bg-[#A63D2F]/10 text-[#A63D2F] border border-[#A63D2F]/30'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                {/* Avatar Presets Selection */}
                <div>
                  <label className="text-xs font-bold text-[#1E3A34] block mb-2 uppercase tracking-wider">Choose Avatar (10 Presets)</label>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <img
                        key={idx}
                        src={av}
                        alt={`Avatar ${idx + 1}`}
                        onClick={() => setProfileForm({ ...profileForm, avatar: av })}
                        className={`w-12 h-12 rounded-full object-cover cursor-pointer transition-all border-2 ${
                          profileForm.avatar === av ? 'border-[#B8935A] ring-2 ring-[#B8935A]/40 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1E3A34] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3.5 py-2.5 text-xs text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1E3A34] block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3.5 py-2.5 text-xs text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs font-bold text-[#A63D2F] hover:bg-[#A63D2F]/10 py-2 px-3 rounded-lg border border-[#A63D2F]/30 transition-colors cursor-pointer"
                  >
                    Log Out
                  </button>
                  <button
                    type="submit"
                    className="btn-cta py-2.5 px-6 rounded-lg font-bold text-xs shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* TOP-LEVEL SUB-MODAL: Edit Shipping Address for specific Order */}
    {orderAddressToEdit && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D0606]/65 backdrop-blur-sm">
        <div className="relative z-[101] w-full max-w-md bg-[#FFFFFF] border border-[#E7DFD2] rounded-2xl p-6 space-y-4 shadow-2xl text-[#1F2421]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD2]">
            <h4 className="text-sm font-bold text-[#1E3A34] font-serif">Update Destination for {orderAddressToEdit.orderNo}</h4>
            <button onClick={() => setOrderAddressToEdit(null)} className="text-[#6B665E] hover:text-[#1E3A34]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSaveOrderAddress} className="space-y-3 text-xs font-sans">
            <div>
              <label className="text-[#6B665E] block mb-1">Recipient Name</label>
              <input
                type="text"
                required
                value={addressForm.fullName}
                onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
              />
            </div>
            <div>
              <label className="text-[#6B665E] block mb-1">Address</label>
              <input
                type="text"
                required
                value={addressForm.line1}
                onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })}
                className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#6B665E] block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                />
              </div>
              <div>
                <label className="text-[#6B665E] block mb-1">PIN Code (Default 560035)</label>
                <input
                  type="text"
                  required
                  value={addressForm.pincode}
                  onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setOrderAddressToEdit(null)}
                className="btn-secondary px-3 py-1.5 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-cta px-4 py-1.5 rounded-lg font-bold text-xs"
              >
                Update Address
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* TOP-LEVEL SUB-MODAL: Cancel Order Reason Prompt */}
    {orderToCancel && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D0606]/65 backdrop-blur-sm">
        <div className="relative z-[101] w-full max-w-md bg-[#FFFFFF] border border-[#A63D2F]/40 rounded-2xl p-6 space-y-4 shadow-2xl text-[#1F2421]">
          <div className="flex items-center gap-3 text-[#A63D2F] pb-2 border-b border-[#E7DFD2]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h4 className="text-sm font-bold text-[#1E3A34] font-serif">Cancel Order #{orderToCancel.orderNo}</h4>
          </div>
          <p className="text-xs text-[#6B665E]">
            Are you sure you want to cancel this order? If paid online, your refund will be processed within 3-5 business days.
          </p>
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-[#6B665E]">Select Reason</label>
            <select
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
            >
              <option value="Found a better price elsewhere">Found a better price elsewhere</option>
              <option value="Expected delivery time is too long">Expected delivery time is too long</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Other reasons">Other reasons</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setOrderToCancel(null)}
              className="btn-secondary px-3 py-1.5 rounded-lg text-xs"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={handleConfirmCancelOrder}
              className="px-4 py-1.5 rounded-lg text-xs bg-[#A63D2F] hover:bg-[#8D3427] font-bold text-white shadow-md cursor-pointer"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}
