import React, { useState, useEffect } from 'react';
import { 
  X, LayoutDashboard, ShoppingBag, Tag, Radio, Download, 
  Plus, Trash2, CheckCircle, Clock, Truck, Check, AlertTriangle, 
  RefreshCw, DollarSign, Users, ChevronLeft, ChevronRight, Send,
  Image as ImageIcon, BarChart3, Edit3, ShieldAlert, ShieldCheck,
  Sliders, Layers, MessageSquare, Star, Copy, ExternalLink, Eye, Flame, Ticket
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export default function AdminPortalModal({ isOpen, onClose }) {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview'); 
  // 'overview' | 'orders' | 'products' | 'categories' | 'banners' | 'coupons' | 'settings' | 'reviews' | 'users' | 'broadcast' | 'analytics'

  // Dashboard Stats
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Orders Tab State (Strictly 10 per page)
  const [orders, setOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Products Tab State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'electronics',
    originalPrice: '',
    discountedPrice: '',
    stockQuantity: '',
    description: '',
    images: ''
  });

  // Categories & Collections Tab State
  const [adminCategories, setAdminCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400',
    discountTag: 'Up to 50% Off',
    description: '',
    displayOrder: 0
  });

  // Coupons Tab State
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercentage: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    expiresAt: ''
  });

  // Store Settings & Ticker Tab State
  const [storeSettingsForm, setStoreSettingsForm] = useState({
    announcementText: '',
    activePromoCode: '',
    freeShippingMinAmount: 499,
    shippingFee: 49,
    supportPhone: '+91 800-456-7890',
    supportEmail: 'concierge@eshop.luxury'
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // Reviews Moderation Tab State
  const [adminReviews, setAdminReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Users Tab State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Banners Tab State
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    discountTag: 'LIMITED EXCLUSIVE DEAL',
    targetSlug: 'mobiles',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200'
  });

  // Broadcast Tab State
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    dealTag: 'MEGA FLASH SALE',
    targetUrl: '/products'
  });
  const [broadcastStatus, setBroadcastStatus] = useState({ text: '', type: '' });

  // Analytics Tab State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Initial Fetch on open & tab switch
  useEffect(() => {
    if (isOpen && token) {
      if (activeTab === 'overview') fetchDashboard();
      if (activeTab === 'orders') fetchOrders(orderPage, orderStatusFilter);
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'categories') fetchAdminCategories();
      if (activeTab === 'coupons') fetchCoupons();
      if (activeTab === 'settings') fetchStoreSettings();
      if (activeTab === 'reviews') fetchAdminReviews();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'banners') fetchBanners();
      if (activeTab === 'analytics') fetchAnalytics();
    }
  }, [isOpen, activeTab, orderPage, orderStatusFilter, token]);

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDashboardData(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchOrders = async (page = 1, status = 'all') => {
    setLoadingOrders(true);
    try {
      const statusQuery = status !== 'all' ? `&status=${status}` : '';
      const res = await fetch(`/api/admin/orders?page=${page}${statusQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
        if (data.pagination) {
          setOrderTotalPages(data.pagination.totalPages || 1);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders(orderPage, orderStatusFilter);
      } else {
        alert(data.message || 'Status update failed');
      }
    } catch (e) {
      alert('Network error updating status');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/admin/orders/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `E-Shop_Orders_Settlement_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export settlement report');
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products?limit=50');
      const data = await res.json();
      if (data.success) {
        const prodList = Array.isArray(data.data) ? data.data : data.data?.products;
        setProducts(prodList || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          originalPrice: Number(productForm.originalPrice),
          discountedPrice: Number(productForm.discountedPrice),
          stockQuantity: Number(productForm.stockQuantity),
          images: productForm.images ? productForm.images.split(',').map(s => s.trim()) : []
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setIsAddingProduct(false);
        setEditingProduct(null);
        setProductForm({ name: '', category: 'electronics', originalPrice: '', discountedPrice: '', stockQuantity: '', description: '', images: '' });
        fetchProducts();
      } else {
        alert(data.message || 'Failed to save product');
      }
    } catch (e) {
      alert('Error saving product');
    }
  };

  const handleEditProductClick = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.categorySlug || 'electronics',
      originalPrice: prod.originalPrice,
      discountedPrice: prod.discountedPrice,
      stockQuantity: prod.stockQuantity,
      description: prod.description || '',
      images: Array.isArray(prod.images) ? prod.images.join(', ') : ''
    });
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (e) {}
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponForm.code.trim().toUpperCase(),
          discountPercentage: Number(couponForm.discountPercentage),
          minOrderValue: Number(couponForm.minOrderValue || 0),
          maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
          expiresAt: couponForm.expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Coupon created successfully!');
        setIsAddingCoupon(false);
        setCouponForm({ code: '', discountPercentage: '', minOrderValue: '', maxDiscountAmount: '', expiresAt: '' });
        fetchCoupons();
      } else {
        alert(data.message || 'Failed to create coupon');
      }
    } catch (e) {
      alert('Error creating coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchCoupons();
    } catch (e) {}
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to deactivate and anonymize account "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'User deactivated');
        fetchUsers();
      }
    } catch (e) {
      alert('Error deactivating user');
    }
  };

  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await fetch('/api/admin/banners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBanners(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBanners(false);
    }
  };

  const handleEditBannerClick = (b) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle || '',
      discountTag: b.discountTag || 'LIMITED EXCLUSIVE DEAL',
      targetSlug: b.targetSlug || 'mobiles',
      imageUrl: b.imageUrl
    });
    setIsAddingBanner(true);
  };

  const handleCreateOrUpdateBanner = async (e) => {
    e.preventDefault();
    try {
      const method = editingBanner ? 'PUT' : 'POST';
      const endpoint = editingBanner ? `/api/admin/banners/${editingBanner._id}` : '/api/admin/banners';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bannerForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(editingBanner ? 'Hero poster updated!' : 'Hero poster published to carousel!');
        setIsAddingBanner(false);
        setEditingBanner(null);
        setBannerForm({ title: '', subtitle: '', discountTag: 'LIMITED EXCLUSIVE DEAL', targetSlug: 'mobiles', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200' });
        fetchBanners();
        window.dispatchEvent(new CustomEvent('eshop_banners_updated'));
      } else {
        alert(data.message || 'Failed to save banner');
      }
    } catch (e) {
      alert('Error saving banner');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Remove this banner from the hero carousel?')) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchBanners();
        window.dispatchEvent(new CustomEvent('eshop_banners_updated'));
      }
    } catch (e) {}
  };

  // Categories CRUD
  const fetchAdminCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAdminCategories(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const endpoint = editingCategory ? `/api/admin/categories/${editingCategory._id}` : '/api/admin/categories';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        setIsAddingCategory(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', slug: '', imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400', discountTag: 'Up to 50% Off', description: '', displayOrder: 0 });
        fetchAdminCategories();
        window.dispatchEvent(new CustomEvent('eshop_categories_updated'));
      } else {
        alert(data.message || 'Failed to save category');
      }
    } catch (e) {
      alert('Error saving category');
    }
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      discountTag: cat.discountTag || 'Up to 50% Off',
      description: cat.description || '',
      displayOrder: cat.displayOrder || 0
    });
    setIsAddingCategory(true);
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Delete category "${name}"? Customer pages will stop displaying this category box.`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminCategories();
        window.dispatchEvent(new CustomEvent('eshop_categories_updated'));
      }
    } catch (e) {}
  };

  // Store Settings & Ticker
  const fetchStoreSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStoreSettingsForm(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedAlert(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(storeSettingsForm)
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSavedAlert(true);
        setTimeout(() => setSettingsSavedAlert(false), 4000);
        window.dispatchEvent(new CustomEvent('eshop_settings_updated', { detail: data.data }));
      } else {
        alert(data.message || 'Failed to update settings');
      }
    } catch (e) {
      alert('Error updating store settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Reviews Moderation
  const fetchAdminReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAdminReviews(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to remove this customer review? The product average rating will be recalculated automatically.')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminReviews();
        window.dispatchEvent(new CustomEvent('eshop_products_updated'));
      }
    } catch (e) {}
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAnalyticsData(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleBroadcastDeal = async (e) => {
    e.preventDefault();
    setBroadcastStatus({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(broadcastForm)
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastStatus({ text: 'Deal broadcasted live to all shoppers via WebSocket!', type: 'success' });
        setBroadcastForm({ title: '', message: '', dealTag: 'MEGA FLASH SALE', targetUrl: '/products' });
      } else {
        setBroadcastStatus({ text: data.message || 'Broadcast failed', type: 'error' });
      }
    } catch (e) {
      setBroadcastStatus({ text: 'Server error broadcasting deal', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0D0606]/85 backdrop-blur-md animate-fade-in font-poppins">
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#0D0606] border border-[#F8F6F6]/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Admin Navigation Sidebar */}
        <div className="w-full md:w-64 bg-[#140B0B] border-r border-[#F8F6F6]/10 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-5 border-b border-[#F8F6F6]/10">
              <div className="w-9 h-9 rounded-xl bg-[#FF9E00] flex items-center justify-center text-[#0D0606] font-black text-lg shadow-lg shadow-[#FF9E00]/25">
                ⚡
              </div>
              <div>
                <h2 className="text-sm font-giliran font-bold text-[#F8F6F6]">E-Shop Admin</h2>
                <span className="text-[10px] text-[#FF9E00] font-mono font-semibold">Master Operations Hub</span>
              </div>
            </div>

            {/* Nav Links (All Operational Modules & Customer Touchpoints) */}
            <nav className="mt-4 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders (10 / page)</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Catalog Inventory</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Categories & Deals</span>
              </button>

              <button
                onClick={() => setActiveTab('banners')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'banners'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Hero Banners</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'coupons'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Promo Codes</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Announcement & Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Review Moderation</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customer Accounts</span>
              </button>

              <button
                onClick={() => setActiveTab('broadcast')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'broadcast'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Broadcast Deals</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow-md'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics & Reports</span>
              </button>
            </nav>
          </div>

          {/* Bottom Admin Status Card */}
          <div className="pt-4 border-t border-[#F8F6F6]/10 text-[11px] space-y-1">
            <div className="flex items-center gap-2 text-[#FF9E00] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Superuser Authenticated</span>
            </div>
            <p className="text-[#786E6E] truncate">{user?.email || 'admin@eshop.com'}</p>
            <p className="text-[10px] text-[#786E6E] italic">Retail purchasing restricted</p>
          </div>
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0D0606]">
          
          {/* Top Bar with Title & Close */}
          <div className="px-6 py-4 border-b border-[#F8F6F6]/10 flex items-center justify-between bg-[#110808]">
            <div>
              <h3 className="font-giliran font-extrabold text-lg text-[#F8F6F6] capitalize">
                {activeTab === 'overview' && 'Executive Operations Overview'}
                {activeTab === 'orders' && 'Fulfillment Orders Management (Strictly 10 / Page)'}
                {activeTab === 'products' && 'Catalog Inventory & Image Normalization'}
                {activeTab === 'categories' && 'Curated Collections & Visual Category Deals'}
                {activeTab === 'banners' && 'Hero Promo Posters Carousel Manager'}
                {activeTab === 'coupons' && 'Promotional Discount Promo Codes'}
                {activeTab === 'settings' && 'Storefront Announcement Ticker & Settings'}
                {activeTab === 'reviews' && 'Customer Review Moderation & Rating Integrity'}
                {activeTab === 'users' && 'Customer Accounts Governance'}
                {activeTab === 'broadcast' && 'Real-Time WebSocket Flash Deal Broadcast'}
                {activeTab === 'analytics' && 'Operational Analytics & Reports'}
              </h3>
              <p className="text-xs text-[#786E6E]">E-Shop Operational Control Engine</p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#1A1010] text-[#B8B0B0] hover:text-[#0D0606] hover:bg-[#FF9E00] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Tab Body Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {loadingDashboard ? (
                  <div className="text-center py-12 text-[#FF9E00]">Loading Executive KPIs...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10">
                        <span className="text-[11px] text-[#786E6E] uppercase font-bold">Total Sales</span>
                        <div className="text-2xl font-black text-[#FF9E00] font-mono mt-1">
                          ₹{dashboardData?.totalRevenue?.toLocaleString('en-IN') || 0}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold block mt-1">Settled & Delivered</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10">
                        <span className="text-[11px] text-[#786E6E] uppercase font-bold">Total Orders</span>
                        <div className="text-2xl font-black text-[#F8F6F6] font-mono mt-1">
                          {dashboardData?.totalOrders || 0}
                        </div>
                        <span className="text-[10px] text-[#B8B0B0] block mt-1">All fulfillment stages</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10">
                        <span className="text-[11px] text-[#786E6E] uppercase font-bold">Pending Orders</span>
                        <div className="text-2xl font-black text-[#FF9E00] font-mono mt-1">
                          {dashboardData?.pendingOrders || 0}
                        </div>
                        <span className="text-[10px] text-amber-300 block mt-1">Require action</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10">
                        <span className="text-[11px] text-[#786E6E] uppercase font-bold">Low Stock Warning</span>
                        <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                          {dashboardData?.lowStockCount || 0}
                        </div>
                        <span className="text-[10px] text-rose-300 block mt-1">&lt; 5 units remaining</span>
                      </div>
                    </div>

                    {/* Low stock alerts table */}
                    {dashboardData?.lowStockProducts?.length > 0 && (
                      <div className="p-4 rounded-2xl bg-[#1A1010] border border-rose-500/25 space-y-2">
                        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Immediate Stock Replenishment Required</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                          {dashboardData.lowStockProducts.map(p => (
                            <div key={p._id} className="p-2.5 rounded-xl bg-[#0D0606] flex items-center justify-between">
                              <span className="truncate max-w-[180px] text-[#F8F6F6]">{p.name}</span>
                              <span className="font-mono text-rose-400 font-bold">{p.stockQuantity} left</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 2. ORDERS TAB (Strictly 10 Per Page) */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F8F6F6]/10">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#786E6E] font-bold">Filter Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => {
                        setOrderStatusFilter(e.target.value);
                        setOrderPage(1);
                      }}
                      className="bg-[#140B0B] border border-[#F8F6F6]/10 rounded-xl px-3 py-1.5 text-[#F8F6F6] text-xs cursor-pointer"
                    >
                      <option value="all">All Orders</option>
                      <option value="ORDER_PLACED">Placed (Needs Action)</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#140B0B] hover:bg-[#201313] border border-[#FF9E00]/40 text-[#FF9E00] text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Settlement (CSV)</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#F8F6F6]/10 bg-[#140B0B]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A1010] text-[#786E6E] uppercase font-mono tracking-wider border-b border-[#F8F6F6]/10">
                      <tr>
                        <th className="p-3">Order No / PIN</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8F6F6]/5">
                      {loadingOrders ? (
                        <tr><td colSpan="6" className="text-center py-10 text-[#FF9E00]">Loading Orders...</td></tr>
                      ) : orders.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-10 text-[#786E6E]">No orders found.</td></tr>
                      ) : (
                        orders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-[#1E1212]/60 transition-colors">
                            <td className="p-3 font-mono font-bold text-[#F8F6F6]">
                              {ord.orderNo}
                              <span className="block text-[10px] text-[#786E6E] font-normal">PIN: {ord.shippingAddress?.pincode}</span>
                            </td>
                            <td className="p-3 text-[#B8B0B0]">
                              <span className="font-semibold text-[#F8F6F6]">{ord.shippingAddress?.fullName}</span>
                              <span className="block text-[10px] text-[#786E6E]">{ord.shippingAddress?.phone}</span>
                            </td>
                            <td className="p-3 text-[#786E6E]">{ord.items?.length} items</td>
                            <td className="p-3 font-mono font-bold text-[#FF9E00]">₹{ord.pricing?.total?.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                ord.orderStatus === 'DELIVERED' ? 'bg-[#FF9E00] text-[#0D0606]' :
                                ord.orderStatus === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400' :
                                'bg-[#FF9E00]/15 text-[#FF9E00]'
                              }`}>
                                {ord.orderStatus.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1">
                              {ord.orderStatus === 'ORDER_PLACED' && (
                                <>
                                  <button onClick={() => handleUpdateOrderStatus(ord._id, 'CONFIRMED')} className="px-2.5 py-1 rounded-lg bg-[#FF9E00] hover:bg-[#FFAE26] text-[#0D0606] font-bold text-[11px] cursor-pointer">Accept</button>
                                  <button onClick={() => handleUpdateOrderStatus(ord._id, 'CANCELLED')} className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-[11px] cursor-pointer">Reject</button>
                                </>
                              )}
                              {ord.orderStatus === 'CONFIRMED' && (
                                <button onClick={() => handleUpdateOrderStatus(ord._id, 'SHIPPED')} className="px-2.5 py-1 rounded-lg bg-[#FF9E00] hover:bg-[#FFAE26] text-[#0D0606] font-bold text-[11px] cursor-pointer">Mark Shipped</button>
                              )}
                              {ord.orderStatus === 'SHIPPED' && (
                                <button onClick={() => handleUpdateOrderStatus(ord._id, 'OUT_FOR_DELIVERY')} className="px-2.5 py-1 rounded-lg bg-[#FF9E00] hover:bg-[#FFAE26] text-[#0D0606] font-bold text-[11px] cursor-pointer">Out for Delivery</button>
                              )}
                              {ord.orderStatus === 'OUT_FOR_DELIVERY' && (
                                <button onClick={() => handleUpdateOrderStatus(ord._id, 'DELIVERED')} className="px-2.5 py-1 rounded-lg bg-[#F8F6F6] hover:bg-[#B8B0B0] text-[#0D0606] font-bold text-[11px] cursor-pointer">Mark Delivered</button>
                              )}
                              {ord.orderStatus === 'DELIVERED' && <span className="text-[11px] text-[#FF9E00] font-bold">Completed</span>}
                              {ord.orderStatus === 'CANCELLED' && <span className="text-[11px] text-rose-400 font-bold">Cancelled</span>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 10 Orders Per Page Pagination */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#786E6E] font-mono">
                    Page {orderPage} of {orderTotalPages} (Strictly 10 records / page)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={orderPage <= 1}
                      onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg bg-[#140B0B] disabled:opacity-30 text-[#F8F6F6] hover:bg-[#201313] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={orderPage >= orderTotalPages}
                      onClick={() => setOrderPage(p => p + 1)}
                      className="p-1.5 rounded-lg bg-[#140B0B] disabled:opacity-30 text-[#F8F6F6] hover:bg-[#201313] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PRODUCT CATALOG TAB */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8F6F6]/10">
                  <span className="text-xs text-[#786E6E] font-bold uppercase tracking-wider">Catalog Inventory ({products.length})</span>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', category: 'electronics', originalPrice: '', discountedPrice: '', stockQuantity: '', description: '', images: '' });
                      setIsAddingProduct(!isAddingProduct);
                    }}
                    className="btn-theme-primary text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingProduct ? 'Cancel' : 'Add New Product'}
                  </button>
                </div>

                {/* Add/Edit Product Form with Live Image Uniformity Preview */}
                {isAddingProduct && (
                  <form onSubmit={handleCreateProduct} className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 space-y-3 text-xs">
                    <h4 className="font-bold text-[#F8F6F6] font-giliran">
                      {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Catalog Product'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#786E6E] block mb-1">Product Title</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Department</label>
                        <select
                          value={productForm.category}
                          onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        >
                          <option value="electronics">Electronics</option>
                          <option value="fashion">Fashion</option>
                          <option value="home-living">Home & Living</option>
                          <option value="beauty">Beauty & Personal Care</option>
                          <option value="grocery">Grocery & Gourmet</option>
                          <option value="sports">Sports & Fitness</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={productForm.originalPrice}
                          onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Discounted Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={productForm.discountedPrice}
                          onChange={e => setProductForm({ ...productForm, discountedPrice: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Inventory Units</label>
                        <input
                          type="number"
                          required
                          value={productForm.stockQuantity}
                          onChange={e => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Image URLs (comma separated)</label>
                        <input
                          type="text"
                          value={productForm.images}
                          onChange={e => setProductForm({ ...productForm, images: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] text-[#786E6E] self-center">Presets:</span>
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, images: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800' })}
                            className="text-[10px] bg-[#221414] hover:bg-[#FF9E00] hover:text-[#0D0606] text-[#F8F6F6] px-2 py-0.5 rounded-lg border border-[#F8F6F6]/10"
                          >
                            Smartphone
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' })}
                            className="text-[10px] bg-[#221414] hover:bg-[#FF9E00] hover:text-[#0D0606] text-[#F8F6F6] px-2 py-0.5 rounded-lg border border-[#F8F6F6]/10"
                          >
                            Watch
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' })}
                            className="text-[10px] bg-[#221414] hover:bg-[#FF9E00] hover:text-[#0D0606] text-[#F8F6F6] px-2 py-0.5 rounded-lg border border-[#F8F6F6]/10"
                          >
                            Headphones
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Live Image Uniformity Preview */}
                    {productForm.images && (
                      <div className="p-3 bg-[#110808] rounded-xl border border-[#FF9E00]/20 flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-b from-[#180E0E] to-[#0A0505] border border-[#F8F6F6]/10 flex items-center justify-center p-2 shrink-0">
                          <img
                            src={productForm.images.split(',')[0]?.trim()}
                            alt="Uniform Preview"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'; }}
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-[#FF9E00] block">Uniform Landing Page Framing Verified ✓</span>
                          <p className="text-[10px] text-[#B8B0B0] mt-0.5">
                            Any image aspect ratio is normalized to the uniform 224px centered frame with zero distortion or card height discrepancy.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                        className="px-3 py-1.5 rounded-xl text-[#786E6E] hover:text-[#F8F6F6]"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-theme-primary px-4 py-1.5 rounded-xl font-bold">
                        {editingProduct ? 'Update Product' : 'Save Product'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto rounded-2xl border border-[#F8F6F6]/10 bg-[#140B0B]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A1010] text-[#786E6E] uppercase font-mono tracking-wider border-b border-[#F8F6F6]/10">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8F6F6]/5">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-[#1E1212]/60">
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0D0606] border border-[#F8F6F6]/10 flex items-center justify-center p-0.5 shrink-0">
                              <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'} alt={prod.name} className="max-w-full max-h-full w-auto h-auto object-contain" />
                            </div>
                            <span className="font-semibold text-[#F8F6F6] truncate max-w-xs">{prod.name}</span>
                          </td>
                          <td className="p-3 text-[#786E6E] capitalize">{prod.category?.name || prod.categorySlug}</td>
                          <td className="p-3 font-mono font-bold text-[#FF9E00]">₹{prod.discountedPrice?.toLocaleString()}</td>
                          <td className="p-3 font-mono">
                            <span className={prod.stockQuantity < 10 ? 'text-rose-400 font-bold' : 'text-[#B8B0B0]'}>
                              {prod.stockQuantity}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => handleEditProductClick(prod)}
                              className="p-1 rounded-lg text-[#FF9E00] hover:bg-[#FF9E00]/15 cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                              title="Deactivate Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. CURATED CATEGORIES & VISUAL BOXES TAB */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8F6F6]/10">
                  <div>
                    <span className="text-xs text-[#786E6E] font-bold uppercase tracking-wider">Curated Collections & Deals ({adminCategories.length})</span>
                    <p className="text-[11px] text-[#B8B0B0]">Directly controls the visual category grid boxes and discount tags shown on the customer landing page.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: '', slug: '', imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400', discountTag: 'Up to 50% Off', description: '', displayOrder: 0 });
                      setIsAddingCategory(!isAddingCategory);
                    }}
                    className="btn-theme-primary text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingCategory ? 'Cancel' : 'Add New Category'}
                  </button>
                </div>

                {isAddingCategory && (
                  <form onSubmit={handleSaveCategory} className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 space-y-3 text-xs">
                    <h4 className="font-bold text-[#F8F6F6] font-giliran">
                      {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Curated Category'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#786E6E] block mb-1">Category Title</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="e.g. Luxury Watches"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Slug Identifier</label>
                        <input
                          type="text"
                          value={categoryForm.slug}
                          onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                          placeholder="e.g. luxury-watches (optional)"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6] font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Promotional Discount Tag</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.discountTag}
                          onChange={e => setCategoryForm({ ...categoryForm, discountTag: e.target.value })}
                          placeholder="e.g. Up to 60% Off, Flat 70% Off"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#FF9E00] font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Display Sort Order</label>
                        <input
                          type="number"
                          value={categoryForm.displayOrder}
                          onChange={e => setCategoryForm({ ...categoryForm, displayOrder: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[#786E6E] block mb-1">Category Box Thumbnail Image URL</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.imageUrl}
                          onChange={e => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                    </div>

                    {/* Live Category Card Preview */}
                    {categoryForm.imageUrl && (
                      <div className="p-3 bg-[#0D0606] rounded-xl border border-[#FF9E00]/30 flex items-center gap-4 max-w-sm">
                        <div className="w-16 h-16 rounded-xl bg-[#1A1010] border border-[#F8F6F6]/10 p-2 flex items-center justify-center shrink-0">
                          <img src={categoryForm.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <span className="font-bold text-[#F8F6F6] text-xs block">{categoryForm.name || 'Category Name'}</span>
                          <span className="text-[10px] text-[#FF9E00] font-bold bg-[#FF9E00]/10 px-2 py-0.5 rounded-full border border-[#FF9E00]/20 inline-block mt-1 font-mono">
                            {categoryForm.discountTag}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }}
                        className="px-3 py-1.5 rounded-xl text-[#786E6E] hover:text-[#F8F6F6]"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-theme-primary px-4 py-1.5 rounded-xl font-bold">
                        {editingCategory ? 'Update Category' : 'Save Category'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {adminCategories.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 hover:border-[#FF9E00]/40 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-[#0D0606] border border-[#F8F6F6]/10 p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <img src={cat.imageUrl} alt={cat.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-xs text-[#F8F6F6] group-hover:text-[#FF9E00] transition-colors">{cat.name}</h5>
                          <span className="text-[10px] text-[#786E6E] font-mono block">slug: {cat.slug}</span>
                          <span className="text-[10px] font-bold text-[#FF9E00] bg-[#FF9E00]/10 px-2 py-0.5 rounded-full inline-block mt-1 font-mono">
                            {cat.discountTag || 'Active'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditCategoryClick(cat)}
                          className="p-2 rounded-lg text-[#FF9E00] hover:bg-[#FF9E00]/15 transition-colors cursor-pointer"
                          title="Edit Category & Discount"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. COUPONS TAB */}
            {activeTab === 'coupons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8F6F6]/10">
                  <span className="text-xs text-[#786E6E] font-bold uppercase tracking-wider">Promotional Coupons ({coupons.length})</span>
                  <button
                    onClick={() => setIsAddingCoupon(!isAddingCoupon)}
                    className="btn-theme-primary text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingCoupon ? 'Cancel' : 'Generate Coupon'}
                  </button>
                </div>

                {isAddingCoupon && (
                  <form onSubmit={handleCreateCoupon} className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 space-y-3 text-xs">
                    <h4 className="font-bold text-[#F8F6F6] font-giliran">Generate Promo Coupon Code</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#786E6E] block mb-1">Coupon Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. FLASH30"
                          value={couponForm.code}
                          onChange={e => setCouponForm({ ...couponForm, code: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6] uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Discount Percentage (%)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          placeholder="30"
                          value={couponForm.discountPercentage}
                          onChange={e => setCouponForm({ ...couponForm, discountPercentage: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Min Order Value (₹)</label>
                        <input
                          type="number"
                          value={couponForm.minOrderValue}
                          onChange={e => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                          placeholder="499"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Max Discount Cap (₹)</label>
                        <input
                          type="number"
                          value={couponForm.maxDiscountAmount}
                          onChange={e => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                          placeholder="1000"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setIsAddingCoupon(false)} className="px-3 py-1.5 rounded-xl text-[#786E6E]">Cancel</button>
                      <button type="submit" className="btn-theme-primary px-4 py-1.5 rounded-xl font-bold">Publish Coupon</button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto rounded-2xl border border-[#F8F6F6]/10 bg-[#140B0B]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A1010] text-[#786E6E] uppercase font-mono tracking-wider border-b border-[#F8F6F6]/10">
                      <tr>
                        <th className="p-3">Code</th>
                        <th className="p-3">Discount</th>
                        <th className="p-3">Min Order</th>
                        <th className="p-3">Redeemed</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8F6F6]/5">
                      {coupons.map((c) => (
                        <tr key={c._id} className="hover:bg-[#1E1212]/60">
                          <td className="p-3 font-mono font-bold text-[#FF9E00]">{c.code}</td>
                          <td className="p-3 font-mono text-[#F8F6F6]">{c.discountPercentage}% OFF</td>
                          <td className="p-3 font-mono text-[#B8B0B0]">₹{c.minOrderValue}</td>
                          <td className="p-3 font-mono text-[#786E6E]">{c.usedCount || 0} times</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleDeleteCoupon(c._id)} className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. CUSTOMER GOVERNANCE TAB (FR-36) */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8F6F6]/10">
                  <span className="text-xs text-[#786E6E] font-bold uppercase tracking-wider">Registered Shoppers ({usersList.length})</span>
                  <button onClick={fetchUsers} className="flex items-center gap-1 text-xs text-[#FF9E00] hover:underline">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh List</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#F8F6F6]/10 bg-[#140B0B]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A1010] text-[#786E6E] uppercase font-mono tracking-wider border-b border-[#F8F6F6]/10">
                      <tr>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Governance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8F6F6]/5">
                      {loadingUsers ? (
                        <tr><td colSpan="5" className="text-center py-10 text-[#FF9E00]">Loading Users...</td></tr>
                      ) : usersList.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-10 text-[#786E6E]">No customer accounts registered yet.</td></tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u._id} className="hover:bg-[#1E1212]/60">
                            <td className="p-3 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#201313] flex items-center justify-center font-bold text-xs text-[#FF9E00] border border-[#FF9E00]/30 shrink-0">
                                {u.name ? u.name[0] : 'U'}
                              </div>
                              <div>
                                <span className="font-semibold text-[#F8F6F6] block">{u.name}</span>
                                <span className="text-[10px] text-[#786E6E]">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="p-3 text-[#B8B0B0]">
                              <span>{u.email}</span>
                              <span className="block text-[10px] text-[#786E6E]">{u.phone || 'No phone'}</span>
                            </td>
                            <td className="p-3 font-mono text-[#F8F6F6]">@{u.username}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {u.status || 'Active'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {u.status !== 'deleted' ? (
                                <button
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                                  title="Deactivate & Anonymize Account"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <span className="text-[10px] text-[#786E6E] italic">Anonymized</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. HERO BANNERS / POSTERS TAB */}
            {activeTab === 'banners' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8F6F6]/10">
                  <div>
                    <span className="text-xs text-[#786E6E] font-bold uppercase tracking-wider">Auto-Slide Hero Posters ({banners.length})</span>
                    <p className="text-[11px] text-[#B8B0B0]">Controls the auto-swiping promotional hero banners shown at the top of the customer store.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBanner(null);
                      setBannerForm({ title: '', subtitle: '', discountTag: 'LIMITED EXCLUSIVE DEAL', targetSlug: 'mobiles', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200' });
                      setIsAddingBanner(!isAddingBanner);
                    }}
                    className="btn-theme-primary text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingBanner ? 'Cancel' : 'Add Hero Poster'}
                  </button>
                </div>

                {isAddingBanner && (
                  <form onSubmit={handleCreateOrUpdateBanner} className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 space-y-3 text-xs">
                    <h4 className="font-bold text-[#F8F6F6] font-giliran">
                      {editingBanner ? `Edit Hero Poster: ${editingBanner.title}` : 'Create New Auto-Swipe Hero Poster'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#786E6E] block mb-1">Banner Headline</label>
                        <input
                          type="text"
                          required
                          value={bannerForm.title}
                          onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                          placeholder="e.g. Next-Gen Ultra Sound"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Subtitle / Subtext</label>
                        <input
                          type="text"
                          value={bannerForm.subtitle}
                          onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                          placeholder="e.g. Experience flagship acoustic precision"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Target Slug / Category</label>
                        <input
                          type="text"
                          required
                          value={bannerForm.targetSlug}
                          onChange={e => setBannerForm({ ...bannerForm, targetSlug: e.target.value })}
                          placeholder="mobiles / laptops / audio / watches"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                      <div>
                        <label className="text-[#786E6E] block mb-1">Discount Tag Badge</label>
                        <input
                          type="text"
                          value={bannerForm.discountTag}
                          onChange={e => setBannerForm({ ...bannerForm, discountTag: e.target.value })}
                          placeholder="e.g. FLAT 50% OFF, LIMITED DROP"
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#FF9E00] font-bold"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[#786E6E] block mb-1">Poster Image URL (High-Res Landscape)</label>
                        <input
                          type="text"
                          required
                          value={bannerForm.imageUrl}
                          onChange={e => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                          className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                        />
                      </div>
                    </div>

                    {/* Live Preview */}
                    {bannerForm.imageUrl && (
                      <div className="h-32 rounded-xl overflow-hidden relative border border-[#FF9E00]/30 bg-[#0D0606]">
                        <img src={bannerForm.imageUrl} alt="Banner Preview" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0606] via-[#0D0606]/80 to-transparent p-4 flex flex-col justify-center">
                          <span className="text-[10px] text-[#FF9E00] font-bold uppercase font-mono">{bannerForm.discountTag}</span>
                          <h5 className="font-giliran text-lg font-bold text-[#F8F6F6]">{bannerForm.title || 'Poster Headline'}</h5>
                          <p className="text-[11px] text-[#B8B0B0] truncate">{bannerForm.subtitle}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsAddingBanner(false); setEditingBanner(null); }}
                        className="px-3 py-1.5 rounded-xl text-[#786E6E] hover:text-[#F8F6F6]"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-theme-primary px-4 py-1.5 rounded-xl font-bold">
                        {editingBanner ? 'Update Poster' : 'Publish Poster'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {banners.map((b) => (
                    <div key={b._id} className="relative rounded-2xl overflow-hidden border border-[#F8F6F6]/10 bg-[#140B0B] h-44 group">
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0D0606] via-[#0D0606]/85 to-transparent p-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#FF9E00] uppercase font-mono">{b.discountTag || 'OFFER'}</span>
                          <h5 className="font-giliran font-bold text-base text-[#F8F6F6] mt-0.5">{b.title}</h5>
                          {b.subtitle && <p className="text-[11px] text-[#B8B0B0] line-clamp-1 mt-0.5">{b.subtitle}</p>}
                          <span className="text-[10px] text-[#786E6E] font-mono block mt-1">Target: {b.targetSlug}</span>
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditBannerClick(b)}
                            className="p-1.5 rounded-lg bg-[#FF9E00]/15 text-[#FF9E00] hover:bg-[#FF9E00] hover:text-[#0D0606] transition-colors cursor-pointer"
                            title="Edit Poster"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(b._id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                            title="Remove Poster"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. STORE SETTINGS & LIVE ANNOUNCEMENT TICKER TAB */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h4 className="font-bold text-base text-[#F8F6F6] font-giliran">Storefront Live Control & Announcements</h4>
                  <p className="text-xs text-[#B8B0B0] mt-0.5 font-poppins">
                    Changes made here directly and immediately update what every customer sees on the landing page, navigation bar, and checkout drawer in real time.
                  </p>
                </div>

                {settingsSavedAlert && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Store settings successfully updated and broadcast to all active shopper sessions!</span>
                  </div>
                )}

                {/* Live Announcement Bar Visual Preview */}
                <div className="p-4 rounded-2xl bg-[#140B0B] border border-[#FF9E00]/30 space-y-2">
                  <span className="text-[10px] text-[#786E6E] font-bold uppercase tracking-wider font-mono">Live Customer Announcement Bar Preview</span>
                  <div className="bg-[#0D0606] border border-[#F8F6F6]/10 rounded-xl py-2 px-3 text-center text-xs text-[#B8B0B0] font-medium flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-[#FF9E00] font-bold">⚡ ANNOUNCEMENT:</span>
                    <span>{storeSettingsForm.announcementText || 'Flash offer running now...'}</span>
                    {storeSettingsForm.activePromoCode && (
                      <span className="inline-flex items-center gap-1 ml-1">
                        <span>Use Code:</span>
                        <span className="text-[#0D0606] font-mono font-black bg-[#FF9E00] px-2 py-0.5 rounded shadow text-[10px]">
                          {storeSettingsForm.activePromoCode}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveStoreSettings} className="p-5 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 space-y-4 text-xs font-poppins">
                  <div>
                    <label className="text-[#B8B0B0] font-semibold block mb-1">Top Announcement Bar Text</label>
                    <textarea
                      rows={2}
                      required
                      value={storeSettingsForm.announcementText}
                      onChange={e => setStoreSettingsForm({ ...storeSettingsForm, announcementText: e.target.value })}
                      placeholder="e.g. ⚡ FLASH OFFER: Enjoy Free Express Delivery on orders above ₹499"
                      className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl p-3 text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#B8B0B0] font-semibold block mb-1">Active Featured Promo Code</label>
                      <input
                        type="text"
                        value={storeSettingsForm.activePromoCode}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, activePromoCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. SAVE10, FESTIVE30"
                        className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#FF9E00] font-mono font-bold uppercase focus:outline-none focus:border-[#FF9E00]"
                      />
                      <span className="text-[10px] text-[#786E6E] mt-0.5 block">Displayed prominently to users in top ticker</span>
                    </div>

                    <div>
                      <label className="text-[#B8B0B0] font-semibold block mb-1">Free Shipping Minimum Cart Value (₹)</label>
                      <input
                        type="number"
                        required
                        value={storeSettingsForm.freeShippingMinAmount}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, freeShippingMinAmount: Number(e.target.value) })}
                        className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6] font-mono focus:outline-none focus:border-[#FF9E00]"
                      />
                      <span className="text-[10px] text-[#786E6E] mt-0.5 block">Orders above this get free delivery in Cart</span>
                    </div>

                    <div>
                      <label className="text-[#B8B0B0] font-semibold block mb-1">Standard Delivery Fee (₹)</label>
                      <input
                        type="number"
                        required
                        value={storeSettingsForm.shippingFee}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, shippingFee: Number(e.target.value) })}
                        className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6] font-mono focus:outline-none focus:border-[#FF9E00]"
                      />
                    </div>

                    <div>
                      <label className="text-[#B8B0B0] font-semibold block mb-1">Concierge Support Phone</label>
                      <input
                        type="text"
                        value={storeSettingsForm.supportPhone}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, supportPhone: e.target.value })}
                        className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[#B8B0B0] font-semibold block mb-1">Concierge Support Email</label>
                      <input
                        type="email"
                        value={storeSettingsForm.supportEmail}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, supportEmail: e.target.value })}
                        className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="btn-theme-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-xl text-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>{savingSettings ? 'Publishing...' : 'Save & Publish to Live Store'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 8. CUSTOMER REVIEWS MODERATION TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8F6F6]/10">
                  <div>
                    <span className="text-xs text-[#786E6E] font-bold uppercase tracking-wider">Customer Reviews Moderation ({adminReviews.length})</span>
                    <p className="text-[11px] text-[#B8B0B0]">Moderate, audit, or purge reviews. Product ratings recalculate automatically upon removal.</p>
                  </div>
                  <button
                    onClick={fetchAdminReviews}
                    className="p-2 rounded-xl bg-[#140B0B] border border-[#F8F6F6]/10 text-[#FF9E00] hover:bg-[#201313] transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingReviews ? (
                  <div className="text-center py-10 text-[#FF9E00]">Loading customer reviews...</div>
                ) : adminReviews.length === 0 ? (
                  <div className="text-center py-16 p-6 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 text-[#786E6E] space-y-1">
                    <MessageSquare className="w-8 h-8 mx-auto text-[#786E6E]/50 mb-2" />
                    <p className="font-semibold text-sm text-[#F8F6F6]">No Customer Reviews Yet</p>
                    <p className="text-xs">Customer verified product reviews will appear here for governance and moderation.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminReviews.map((r) => (
                      <div key={r._id} className="p-4 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#0D0606] border border-[#F8F6F6]/10 p-1 flex items-center justify-center shrink-0">
                            <img src={r.productId?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'} alt="Product" className="max-w-full max-h-full object-contain" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#F8F6F6]">{r.productId?.name || 'Catalog Item'}</span>
                              <div className="flex items-center text-[#FF9E00]">
                                {[...Array(r.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-[#FF9E00]" />
                                ))}
                              </div>
                            </div>
                            <h6 className="text-xs font-semibold text-[#FF9E00]">{r.title}</h6>
                            <p className="text-xs text-[#B8B0B0] leading-relaxed max-w-2xl">{r.comment}</p>
                            <div className="flex items-center gap-3 text-[10px] text-[#786E6E] pt-1">
                              <span>By: <strong className="text-[#F8F6F6]">{r.userName || r.userId?.name}</strong></span>
                              <span>•</span>
                              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                              {r.isVerifiedPurchase && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-bold">Verified Buyer</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end shrink-0">
                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Review</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. BROADCAST DEALS TAB */}
            {activeTab === 'broadcast' && (
              <div className="max-w-xl mx-auto p-6 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 space-y-4">
                <div>
                  <h4 className="font-bold text-base text-[#F8F6F6] font-giliran">Push Live Flash Deal Broadcast</h4>
                  <p className="text-xs text-[#B8B0B0] mt-1 font-poppins">
                    Instantly notifies all active shoppers via real-time WebSockets and stores deal in notification drawer.
                  </p>
                </div>

                {broadcastStatus.text && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    broadcastStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {broadcastStatus.text}
                  </div>
                )}

                <form onSubmit={handleBroadcastDeal} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[#786E6E] block mb-1">Deal Badge Tag</label>
                    <input
                      type="text"
                      value={broadcastForm.dealTag}
                      onChange={e => setBroadcastForm({ ...broadcastForm, dealTag: e.target.value })}
                      placeholder="e.g. ⚡ MIDNIGHT DROP"
                      className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#FF9E00] font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[#786E6E] block mb-1">Deal Headline</label>
                    <input
                      type="text"
                      required
                      value={broadcastForm.title}
                      onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      placeholder="e.g. 40% OFF Noise-Cancelling Headphones"
                      className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                    />
                  </div>
                  <div>
                    <label className="text-[#786E6E] block mb-1">Broadcast Message</label>
                    <textarea
                      required
                      rows={3}
                      value={broadcastForm.message}
                      onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      placeholder="Limited allocation: Only 50 units reserved for verified members."
                      className="w-full bg-[#1A1010] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-[#F8F6F6]"
                    />
                  </div>
                  <button type="submit" className="w-full btn-theme-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                    <Send className="w-4 h-4" />
                    <span>Broadcast to All Connected Clients</span>
                  </button>
                </form>
              </div>
            )}

            {/* 8. ANALYTICS & REPORTS TAB (FR-38, FR-39) */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8F6F6]/10">
                  <span className="text-xs text-[#786E6E] font-bold uppercase tracking-wider">Business Analytics & Inventory Health</span>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-theme-primary text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Complete Settlement (CSV)</span>
                  </button>
                </div>

                {loadingAnalytics ? (
                  <div className="text-center py-10 text-[#FF9E00]">Loading Analytics Data...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stock Health */}
                    <div className="p-5 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 space-y-3">
                      <h4 className="font-giliran font-bold text-sm text-[#F8F6F6]">Warehouse Stock Health</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 rounded-xl bg-[#0D0606]">
                          <span className="text-emerald-400 font-semibold">Healthy Stock (&ge; 5 units):</span>
                          <span className="font-mono font-bold text-[#F8F6F6]">{analyticsData?.stockHealth?.healthyStock || 0} items</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl bg-[#0D0606]">
                          <span className="text-amber-400 font-semibold">Low Stock (&lt; 5 units):</span>
                          <span className="font-mono font-bold text-amber-400">{analyticsData?.stockHealth?.lowStock || 0} items</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl bg-[#0D0606]">
                          <span className="text-rose-400 font-semibold">Out of Stock:</span>
                          <span className="font-mono font-bold text-rose-400">{analyticsData?.stockHealth?.outOfStock || 0} items</span>
                        </div>
                      </div>
                    </div>

                    {/* Department Allocation */}
                    <div className="p-5 rounded-2xl bg-[#140B0B] border border-[#F8F6F6]/10 space-y-3 md:col-span-2">
                      <h4 className="font-giliran font-bold text-sm text-[#F8F6F6]">Department Inventory Allocation</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        {analyticsData?.categoryDistribution?.map(c => (
                          <div key={c._id || 'other'} className="p-3 rounded-xl bg-[#0D0606] border border-[#F8F6F6]/5">
                            <span className="text-[#FF9E00] font-bold capitalize block">{c._id || 'general'}</span>
                            <div className="flex justify-between text-[#B8B0B0] text-[11px] mt-1 font-mono">
                              <span>{c.count} items</span>
                              <span>{c.totalStock} units</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
