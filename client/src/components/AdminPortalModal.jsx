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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0D0606]/65 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#FFFFFF] border border-[#E7DFD2] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-[#1F2421]">
        
        {/* Left Admin Navigation Sidebar */}
        <div className="w-full md:w-64 bg-[#1E3A34] border-r border-[#B8935A]/30 p-5 flex flex-col justify-between shrink-0 text-[#FAF6EF]">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-5 border-b border-[#B8935A]/25">
              <div className="w-9 h-9 rounded-xl bg-[#B8935A] flex items-center justify-center text-[#1E3A34] font-black text-lg shadow-md">
                ⚡
              </div>
              <div>
                <h2 className="text-sm font-serif font-bold text-[#FAF6EF]">E-Shop Admin</h2>
                <span className="text-[10px] text-[#B8935A] font-mono font-semibold">Master Operations Hub</span>
              </div>
            </div>

            {/* Nav Links (All Operational Modules & Customer Touchpoints) */}
            <nav className="mt-4 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders (10 / page)</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Catalog Inventory</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Categories & Deals</span>
              </button>

              <button
                onClick={() => setActiveTab('banners')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'banners'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Hero Banners</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'coupons'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Promo Codes</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Announcement & Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Review Moderation</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customer Accounts</span>
              </button>

              <button
                onClick={() => setActiveTab('broadcast')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'broadcast'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Broadcast Deals</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#C2603F] text-white font-bold shadow-md'
                    : 'text-[#FAF6EF]/75 hover:bg-[#142922] hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics & Reports</span>
              </button>
            </nav>
          </div>

          {/* Bottom Admin Status Card */}
          <div className="pt-4 border-t border-[#B8935A]/25 text-[11px] space-y-1">
            <div className="flex items-center gap-2 text-[#B8935A] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Superuser Authenticated</span>
            </div>
            <p className="text-[#FAF6EF]/70 truncate">{user?.email || 'admin@eshop.com'}</p>
            <p className="text-[10px] text-[#FAF6EF]/50 italic">Retail purchasing restricted</p>
          </div>
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF6EF]">
          
          {/* Top Bar with Title & Close */}
          <div className="px-6 py-4 border-b border-[#E7DFD2] flex items-center justify-between bg-[#FFFFFF]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1E3A34] capitalize">
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
              <p className="text-xs text-[#6B665E]">E-Shop Operational Control Engine</p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#FAF6EF] text-[#6B665E] hover:text-[#1E3A34] hover:bg-[#E7DFD2] transition-colors cursor-pointer border border-[#E7DFD2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Tab Body Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF6EF] text-[#1F2421]">

            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {loadingDashboard ? (
                  <div className="text-center py-12 text-[#1E3A34] font-semibold">Loading Executive KPIs...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] shadow-sm">
                        <span className="text-[11px] text-[#6B665E] uppercase font-bold">Total Sales</span>
                        <div className="text-2xl font-bold text-[#1E3A34] font-mono tabular-nums mt-1">
                          ₹{dashboardData?.totalRevenue?.toLocaleString('en-IN') || 0}
                        </div>
                        <span className="text-[10px] text-[#4F7A5A] font-bold block mt-1">Settled & Delivered</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] shadow-sm">
                        <span className="text-[11px] text-[#6B665E] uppercase font-bold">Total Orders</span>
                        <div className="text-2xl font-bold text-[#1E3A34] font-mono tabular-nums mt-1">
                          {dashboardData?.totalOrders || 0}
                        </div>
                        <span className="text-[10px] text-[#6B665E] block mt-1">All fulfillment stages</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] shadow-sm">
                        <span className="text-[11px] text-[#6B665E] uppercase font-bold">Pending Orders</span>
                        <div className="text-2xl font-bold text-[#C2603F] font-mono tabular-nums mt-1">
                          {dashboardData?.pendingOrders || 0}
                        </div>
                        <span className="text-[10px] text-[#C2603F] block mt-1">Require action</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] shadow-sm">
                        <span className="text-[11px] text-[#6B665E] uppercase font-bold">Low Stock Warning</span>
                        <div className="text-2xl font-bold text-[#A63D2F] font-mono tabular-nums mt-1">
                          {dashboardData?.lowStockCount || 0}
                        </div>
                        <span className="text-[10px] text-[#A63D2F] block mt-1">&lt; 5 units remaining</span>
                      </div>
                    </div>

                    {/* Low stock alerts table */}
                    {dashboardData?.lowStockProducts?.length > 0 && (
                      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#A63D2F]/30 space-y-2 shadow-sm">
                        <div className="flex items-center gap-2 text-[#A63D2F] font-bold text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Immediate Stock Replenishment Required</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                          {dashboardData.lowStockProducts.map(p => (
                            <div key={p._id} className="p-2.5 rounded-lg bg-[#FAF6EF] border border-[#E7DFD2] flex items-center justify-between">
                              <span className="truncate max-w-[180px] text-[#1F2421] font-medium">{p.name}</span>
                              <span className="font-mono text-[#A63D2F] font-bold">{p.stockQuantity} left</span>
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
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7DFD2]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6B665E] font-bold">Filter Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => {
                        setOrderStatusFilter(e.target.value);
                        setOrderPage(1);
                      }}
                      className="bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-1.5 text-[#1F2421] text-xs cursor-pointer focus:outline-none focus:border-[#1E3A34]"
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
                    className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Settlement (CSV)</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E7DFD2] bg-[#FFFFFF] shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EF] text-[#1E3A34] uppercase font-mono tracking-wider border-b border-[#E7DFD2]">
                      <tr>
                        <th className="p-3">Order No / PIN</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7DFD2]">
                      {loadingOrders ? (
                        <tr><td colSpan="6" className="text-center py-10 text-[#1E3A34]">Loading Orders...</td></tr>
                      ) : orders.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-10 text-[#6B665E]">No orders found.</td></tr>
                      ) : (
                        orders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-[#FAF6EF]/60 transition-colors">
                            <td className="p-3 font-mono font-bold text-[#1F2421]">
                              {ord.orderNo}
                              <span className="block text-[10px] text-[#6B665E] font-normal">PIN: {ord.shippingAddress?.pincode}</span>
                            </td>
                            <td className="p-3 text-[#6B665E]">
                              <span className="font-semibold text-[#1F2421]">{ord.shippingAddress?.fullName}</span>
                              <span className="block text-[10px] text-[#6B665E]">{ord.shippingAddress?.phone}</span>
                            </td>
                            <td className="p-3 text-[#6B665E]">{ord.items?.length} items</td>
                            <td className="p-3 font-mono font-bold text-[#1E3A34] tabular-nums">₹{ord.pricing?.total?.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                ord.orderStatus === 'DELIVERED' ? 'badge-sage' :
                                ord.orderStatus === 'CANCELLED' ? 'badge-discount' :
                                'badge-gold'
                              }`}>
                                {ord.orderStatus.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1">
                              {ord.orderStatus === 'ORDER_PLACED' && (
                                <>
                                  <button onClick={() => handleUpdateOrderStatus(ord._id, 'CONFIRMED')} className="btn-cta px-2.5 py-1 rounded-lg text-[11px] cursor-pointer">Accept</button>
                                  <button onClick={() => handleUpdateOrderStatus(ord._id, 'CANCELLED')} className="px-2.5 py-1 rounded-lg bg-[#A63D2F]/10 border border-[#A63D2F]/30 text-[#A63D2F] hover:bg-[#A63D2F] hover:text-white font-bold text-[11px] cursor-pointer">Reject</button>
                                </>
                              )}
                              {ord.orderStatus === 'CONFIRMED' && (
                                <button onClick={() => handleUpdateOrderStatus(ord._id, 'SHIPPED')} className="btn-secondary px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer">Mark Shipped</button>
                              )}
                              {ord.orderStatus === 'SHIPPED' && (
                                <button onClick={() => handleUpdateOrderStatus(ord._id, 'OUT_FOR_DELIVERY')} className="btn-secondary px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer">Out for Delivery</button>
                              )}
                              {ord.orderStatus === 'OUT_FOR_DELIVERY' && (
                                <button onClick={() => handleUpdateOrderStatus(ord._id, 'DELIVERED')} className="btn-cta px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer">Mark Delivered</button>
                              )}
                              {ord.orderStatus === 'DELIVERED' && <span className="text-[11px] text-[#4F7A5A] font-bold">Completed</span>}
                              {ord.orderStatus === 'CANCELLED' && <span className="text-[11px] text-[#A63D2F] font-bold">Cancelled</span>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 10 Orders Per Page Pagination */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#6B665E] font-mono">
                    Page {orderPage} of {orderTotalPages} (Strictly 10 records / page)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={orderPage <= 1}
                      onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#E7DFD2] disabled:opacity-30 text-[#1F2421] hover:bg-[#FAF6EF] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={orderPage >= orderTotalPages}
                      onClick={() => setOrderPage(p => p + 1)}
                      className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#E7DFD2] disabled:opacity-30 text-[#1F2421] hover:bg-[#FAF6EF] transition-colors cursor-pointer"
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
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD2]">
                  <span className="text-xs text-[#6B665E] font-bold uppercase tracking-wider">Catalog Inventory ({products.length})</span>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', category: 'electronics', originalPrice: '', discountedPrice: '', stockQuantity: '', description: '', images: '' });
                      setIsAddingProduct(!isAddingProduct);
                    }}
                    className="btn-cta text-xs py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingProduct ? 'Cancel' : 'Add New Product'}
                  </button>
                </div>

                {/* Add/Edit Product Form with Live Image Uniformity Preview */}
                {isAddingProduct && (
                  <form onSubmit={handleCreateProduct} className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-4 text-xs shadow-sm">
                    <h4 className="font-bold text-[#1E3A34] font-serif text-sm">
                      {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Catalog Product'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Product Title</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Department</label>
                        <select
                          value={productForm.category}
                          onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
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
                        <label className="text-[#6B665E] font-medium block mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={productForm.originalPrice}
                          onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Discounted Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={productForm.discountedPrice}
                          onChange={e => setProductForm({ ...productForm, discountedPrice: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1E3A34] font-bold font-mono focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Inventory Units</label>
                        <input
                          type="number"
                          required
                          value={productForm.stockQuantity}
                          onChange={e => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Image URLs (comma separated)</label>
                        <input
                          type="text"
                          value={productForm.images}
                          onChange={e => setProductForm({ ...productForm, images: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] text-[#6B665E] self-center">Presets:</span>
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, images: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800' })}
                            className="text-[10px] bg-[#FAF6EF] hover:bg-[#1E3A34] hover:text-white text-[#1F2421] px-2 py-0.5 rounded-md border border-[#E7DFD2] transition-colors"
                          >
                            Smartphone
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' })}
                            className="text-[10px] bg-[#FAF6EF] hover:bg-[#1E3A34] hover:text-white text-[#1F2421] px-2 py-0.5 rounded-md border border-[#E7DFD2] transition-colors"
                          >
                            Watch
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' })}
                            className="text-[10px] bg-[#FAF6EF] hover:bg-[#1E3A34] hover:text-white text-[#1F2421] px-2 py-0.5 rounded-md border border-[#E7DFD2] transition-colors"
                          >
                            Headphones
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Live Image Uniformity Preview */}
                    {productForm.images && (
                      <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#B8935A]/30 flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg bg-[#FFFFFF] border border-[#E7DFD2] flex items-center justify-center p-2 shrink-0">
                          <img
                            src={productForm.images.split(',')[0]?.trim()}
                            alt="Uniform Preview"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'; }}
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-[#1E3A34] block font-serif">Uniform Landing Page Framing Verified ✓</span>
                          <p className="text-[10px] text-[#6B665E] mt-0.5">
                            Any image aspect ratio is normalized to the uniform 224px centered frame with zero distortion or card height discrepancy.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                        className="px-3 py-1.5 rounded-lg text-[#6B665E] hover:text-[#1F2421] transition-colors"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-cta px-4 py-1.5 rounded-lg font-bold text-white shadow-sm">
                        {editingProduct ? 'Update Product' : 'Save Product'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto rounded-xl border border-[#E7DFD2] bg-[#FFFFFF] shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EF] text-[#6B665E] uppercase font-mono tracking-wider border-b border-[#E7DFD2]">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7DFD2]">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-[#FAF6EF]/70 transition-colors">
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF6EF] border border-[#E7DFD2] flex items-center justify-center p-0.5 shrink-0">
                              <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'} alt={prod.name} className="max-w-full max-h-full w-auto h-auto object-contain" />
                            </div>
                            <span className="font-semibold text-[#1F2421] truncate max-w-xs">{prod.name}</span>
                          </td>
                          <td className="p-3 text-[#6B665E] capitalize">{prod.category?.name || prod.categorySlug}</td>
                          <td className="p-3 font-bold text-[#1E3A34] tabular-nums font-sans">₹{prod.discountedPrice?.toLocaleString()}</td>
                          <td className="p-3 font-mono">
                            <span className={prod.stockQuantity < 10 ? 'text-[#A63D2F] font-bold' : 'text-[#6B665E]'}>
                              {prod.stockQuantity}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => handleEditProductClick(prod)}
                              className="p-1.5 rounded-lg text-[#1E3A34] hover:bg-[#1E3A34]/10 cursor-pointer transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-1.5 rounded-lg text-[#A63D2F] hover:bg-[#A63D2F]/10 cursor-pointer transition-colors"
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
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD2]">
                  <div>
                    <span className="text-xs text-[#1E3A34] font-bold uppercase tracking-wider font-serif">Curated Collections & Deals ({adminCategories.length})</span>
                    <p className="text-[11px] text-[#6B665E]">Directly controls the visual category grid boxes and discount tags shown on the customer landing page.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: '', slug: '', imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400', discountTag: 'Up to 50% Off', description: '', displayOrder: 0 });
                      setIsAddingCategory(!isAddingCategory);
                    }}
                    className="btn-cta text-xs py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingCategory ? 'Cancel' : 'Add New Category'}
                  </button>
                </div>

                {isAddingCategory && (
                  <form onSubmit={handleSaveCategory} className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-4 text-xs shadow-sm">
                    <h4 className="font-bold text-[#1E3A34] font-serif text-sm">
                      {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Curated Category'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Category Title</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="e.g. Luxury Watches"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Slug Identifier</label>
                        <input
                          type="text"
                          value={categoryForm.slug}
                          onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                          placeholder="e.g. luxury-watches (optional)"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Promotional Discount Tag</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.discountTag}
                          onChange={e => setCategoryForm({ ...categoryForm, discountTag: e.target.value })}
                          placeholder="e.g. Up to 60% Off, Flat 70% Off"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#A63D2F] font-bold focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Display Sort Order</label>
                        <input
                          type="number"
                          value={categoryForm.displayOrder}
                          onChange={e => setCategoryForm({ ...categoryForm, displayOrder: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[#6B665E] font-medium block mb-1">Category Box Thumbnail Image URL</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.imageUrl}
                          onChange={e => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                    </div>

                    {/* Live Category Card Preview */}
                    {categoryForm.imageUrl && (
                      <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#B8935A]/30 flex items-center gap-4 max-w-sm">
                        <div className="w-16 h-16 rounded-lg bg-[#FFFFFF] border border-[#E7DFD2] p-2 flex items-center justify-center shrink-0">
                          <img src={categoryForm.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <span className="font-bold text-[#1F2421] text-xs block font-serif">{categoryForm.name || 'Category Name'}</span>
                          <span className="text-[10px] text-[#A63D2F] font-bold bg-[#A63D2F]/10 px-2 py-0.5 rounded-full border border-[#A63D2F]/20 inline-block mt-1 font-mono">
                            {categoryForm.discountTag}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }}
                        className="px-3 py-1.5 rounded-lg text-[#6B665E] hover:text-[#1F2421] transition-colors"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-cta px-4 py-1.5 rounded-lg font-bold text-white shadow-sm">
                        {editingCategory ? 'Update Category' : 'Save Category'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {adminCategories.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] hover:border-[#B8935A] hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-[#FAF6EF] border border-[#E7DFD2] p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <img src={cat.imageUrl} alt={cat.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-xs text-[#1F2421] font-serif group-hover:text-[#1E3A34] transition-colors">{cat.name}</h5>
                          <span className="text-[10px] text-[#6B665E] font-mono block">slug: {cat.slug}</span>
                          <span className="text-[10px] font-bold text-[#A63D2F] bg-[#A63D2F]/10 border border-[#A63D2F]/20 px-2 py-0.5 rounded-full inline-block mt-1 font-mono">
                            {cat.discountTag || 'Active'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditCategoryClick(cat)}
                          className="p-2 rounded-lg text-[#1E3A34] hover:bg-[#1E3A34]/10 transition-colors cursor-pointer"
                          title="Edit Category & Discount"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          className="p-2 rounded-lg text-[#A63D2F] hover:bg-[#A63D2F]/10 transition-colors cursor-pointer"
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
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD2]">
                  <span className="text-xs text-[#6B665E] font-bold uppercase tracking-wider">Promotional Coupons ({coupons.length})</span>
                  <button
                    onClick={() => setIsAddingCoupon(!isAddingCoupon)}
                    className="btn-cta text-xs py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingCoupon ? 'Cancel' : 'Generate Coupon'}
                  </button>
                </div>

                {isAddingCoupon && (
                  <form onSubmit={handleCreateCoupon} className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-4 text-xs shadow-sm">
                    <h4 className="font-bold text-[#1E3A34] font-serif text-sm">Generate Promo Coupon Code</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Coupon Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. FLASH30"
                          value={couponForm.code}
                          onChange={e => setCouponForm({ ...couponForm, code: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#C2603F] uppercase font-mono font-bold focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Discount Percentage (%)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          placeholder="30"
                          value={couponForm.discountPercentage}
                          onChange={e => setCouponForm({ ...couponForm, discountPercentage: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Min Order Value (₹)</label>
                        <input
                          type="number"
                          value={couponForm.minOrderValue}
                          onChange={e => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                          placeholder="499"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Max Discount Cap (₹)</label>
                        <input
                          type="number"
                          value={couponForm.maxDiscountAmount}
                          onChange={e => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                          placeholder="1000"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setIsAddingCoupon(false)} className="px-3 py-1.5 rounded-lg text-[#6B665E] hover:text-[#1F2421] transition-colors">Cancel</button>
                      <button type="submit" className="btn-cta px-4 py-1.5 rounded-lg font-bold text-white shadow-sm">Publish Coupon</button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto rounded-xl border border-[#E7DFD2] bg-[#FFFFFF] shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EF] text-[#6B665E] uppercase font-mono tracking-wider border-b border-[#E7DFD2]">
                      <tr>
                        <th className="p-3">Code</th>
                        <th className="p-3">Discount</th>
                        <th className="p-3">Min Order</th>
                        <th className="p-3">Redeemed</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7DFD2]">
                      {coupons.map((c) => (
                        <tr key={c._id} className="hover:bg-[#FAF6EF]/70 transition-colors">
                          <td className="p-3 font-mono font-bold text-[#C2603F]">{c.code}</td>
                          <td className="p-3 font-mono text-[#1E3A34] font-semibold">{c.discountPercentage}% OFF</td>
                          <td className="p-3 font-mono text-[#6B665E]">₹{c.minOrderValue}</td>
                          <td className="p-3 font-mono text-[#6B665E]">{c.usedCount || 0} times</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleDeleteCoupon(c._id)} className="p-1.5 rounded-lg text-[#A63D2F] hover:bg-[#A63D2F]/10 cursor-pointer transition-colors">
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

            {/* 6. CUSTOMER GOVERNANCE TAB (FR-36) */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD2]">
                  <span className="text-xs text-[#6B665E] font-bold uppercase tracking-wider">Registered Shoppers ({usersList.length})</span>
                  <button onClick={fetchUsers} className="flex items-center gap-1 text-xs text-[#1E3A34] hover:text-[#C2603F] hover:underline cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh List</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E7DFD2] bg-[#FFFFFF] shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EF] text-[#6B665E] uppercase font-mono tracking-wider border-b border-[#E7DFD2]">
                      <tr>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Governance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7DFD2]">
                      {loadingUsers ? (
                        <tr><td colSpan="5" className="text-center py-10 text-[#1E3A34]">Loading Users...</td></tr>
                      ) : usersList.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-10 text-[#6B665E]">No customer accounts registered yet.</td></tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u._id} className="hover:bg-[#FAF6EF]/70 transition-colors">
                            <td className="p-3 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1E3A34] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                {u.name ? u.name[0] : 'U'}
                              </div>
                              <div>
                                <span className="font-semibold text-[#1F2421] block">{u.name}</span>
                                <span className="text-[10px] text-[#6B665E]">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="p-3 text-[#1F2421]">
                              <span>{u.email}</span>
                              <span className="block text-[10px] text-[#6B665E]">{u.phone || 'No phone'}</span>
                            </td>
                            <td className="p-3 font-mono text-[#1E3A34] font-medium">@{u.username}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                u.status === 'active' ? 'bg-[#4F7A5A]/15 text-[#4F7A5A] border border-[#4F7A5A]/30' : 'bg-[#A63D2F]/15 text-[#A63D2F] border border-[#A63D2F]/30'
                              }`}>
                                {u.status || 'Active'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {u.status !== 'deleted' ? (
                                <button
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  className="px-2.5 py-1 rounded-lg bg-[#A63D2F]/10 hover:bg-[#A63D2F] text-[#A63D2F] hover:text-white font-bold text-[11px] border border-[#A63D2F]/20 transition-colors cursor-pointer"
                                  title="Deactivate & Anonymize Account"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <span className="text-[10px] text-[#6B665E] italic">Anonymized</span>
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

            {/* 7. HERO BANNERS / POSTERS TAB */}
            {activeTab === 'banners' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD2]">
                  <div>
                    <span className="text-xs text-[#1E3A34] font-bold uppercase tracking-wider font-serif">Auto-Slide Hero Posters ({banners.length})</span>
                    <p className="text-[11px] text-[#6B665E]">Controls the auto-swiping promotional hero banners shown at the top of the customer store.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBanner(null);
                      setBannerForm({ title: '', subtitle: '', discountTag: 'LIMITED EXCLUSIVE DEAL', targetSlug: 'mobiles', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200' });
                      setIsAddingBanner(!isAddingBanner);
                    }}
                    className="btn-cta text-xs py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingBanner ? 'Cancel' : 'Add Hero Poster'}
                  </button>
                </div>

                {isAddingBanner && (
                  <form onSubmit={handleCreateOrUpdateBanner} className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-4 text-xs shadow-sm">
                    <h4 className="font-bold text-[#1E3A34] font-serif text-sm">
                      {editingBanner ? `Edit Hero Poster: ${editingBanner.title}` : 'Create New Auto-Swipe Hero Poster'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Banner Headline</label>
                        <input
                          type="text"
                          required
                          value={bannerForm.title}
                          onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                          placeholder="e.g. Next-Gen Ultra Sound"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Subtitle / Subtext</label>
                        <input
                          type="text"
                          value={bannerForm.subtitle}
                          onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                          placeholder="e.g. Experience flagship acoustic precision"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Target Slug / Category</label>
                        <input
                          type="text"
                          required
                          value={bannerForm.targetSlug}
                          onChange={e => setBannerForm({ ...bannerForm, targetSlug: e.target.value })}
                          placeholder="mobiles / laptops / audio / watches"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[#6B665E] font-medium block mb-1">Discount Tag Badge</label>
                        <input
                          type="text"
                          value={bannerForm.discountTag}
                          onChange={e => setBannerForm({ ...bannerForm, discountTag: e.target.value })}
                          placeholder="e.g. FLAT 50% OFF, LIMITED DROP"
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#C2603F] font-bold focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[#6B665E] font-medium block mb-1">Poster Image URL (High-Res Landscape)</label>
                        <input
                          type="text"
                          required
                          value={bannerForm.imageUrl}
                          onChange={e => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                          className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                        />
                      </div>
                    </div>

                    {/* Live Preview */}
                    {bannerForm.imageUrl && (
                      <div className="h-36 rounded-xl overflow-hidden relative border border-[#B8935A]/30 bg-[#142922]">
                        <img src={bannerForm.imageUrl} alt="Banner Preview" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#142922] via-[#142922]/80 to-transparent p-4 flex flex-col justify-center">
                          <span className="text-[10px] text-[#B8935A] font-bold uppercase font-mono tracking-wider">{bannerForm.discountTag}</span>
                          <h5 className="font-serif text-lg font-bold text-[#FAF6EF]">{bannerForm.title || 'Poster Headline'}</h5>
                          <p className="text-[11px] text-[#FAF6EF]/80 truncate">{bannerForm.subtitle}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsAddingBanner(false); setEditingBanner(null); }}
                        className="px-3 py-1.5 rounded-lg text-[#6B665E] hover:text-[#1F2421] transition-colors"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-cta px-4 py-1.5 rounded-lg font-bold text-white shadow-sm">
                        {editingBanner ? 'Update Poster' : 'Publish Poster'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {banners.map((b) => (
                    <div key={b._id} className="relative rounded-xl overflow-hidden border border-[#E7DFD2] bg-[#142922] h-44 group shadow-sm">
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#142922] via-[#142922]/85 to-transparent p-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#B8935A] uppercase font-mono tracking-wider">{b.discountTag || 'OFFER'}</span>
                          <h5 className="font-serif font-bold text-base text-[#FAF6EF] mt-0.5">{b.title}</h5>
                          {b.subtitle && <p className="text-[11px] text-[#FAF6EF]/80 line-clamp-1 mt-0.5">{b.subtitle}</p>}
                          <span className="text-[10px] text-[#B8935A]/90 font-mono block mt-1">Target: {b.targetSlug}</span>
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditBannerClick(b)}
                            className="p-1.5 rounded-lg bg-[#FAF6EF]/20 text-[#FAF6EF] hover:bg-[#C2603F] hover:text-white transition-colors cursor-pointer backdrop-blur-sm"
                            title="Edit Poster"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(b._id)}
                            className="p-1.5 rounded-lg bg-[#A63D2F]/20 text-[#FAF6EF] hover:bg-[#A63D2F] hover:text-white transition-colors cursor-pointer backdrop-blur-sm"
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

            {/* 8. STORE SETTINGS & LIVE ANNOUNCEMENT TICKER TAB */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h4 className="font-bold text-base text-[#1E3A34] font-serif">Storefront Live Control & Announcements</h4>
                  <p className="text-xs text-[#6B665E] mt-0.5 font-sans">
                    Changes made here directly and immediately update what every customer sees on the landing page, navigation bar, and checkout drawer in real time.
                  </p>
                </div>

                {settingsSavedAlert && (
                  <div className="p-3.5 rounded-xl bg-[#4F7A5A]/15 border border-[#4F7A5A]/30 text-[#4F7A5A] text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 shrink-0 text-[#4F7A5A]" />
                    <span>Store settings successfully updated and broadcast to all active shopper sessions!</span>
                  </div>
                )}

                {/* Live Announcement Bar Visual Preview */}
                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-2 shadow-sm">
                  <span className="text-[10px] text-[#6B665E] font-bold uppercase tracking-wider font-mono">Live Customer Announcement Bar Preview</span>
                  <div className="bg-[#142922] border border-[#B8935A]/30 rounded-lg py-2 px-3 text-center text-xs text-[#FAF6EF] font-medium flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-[#B8935A] font-bold">⚡ ANNOUNCEMENT:</span>
                    <span>{storeSettingsForm.announcementText || 'Flash offer running now...'}</span>
                    {storeSettingsForm.activePromoCode && (
                      <span className="inline-flex items-center gap-1 ml-1">
                        <span>Use Code:</span>
                        <span className="text-[#142922] font-mono font-black bg-[#B8935A] px-2 py-0.5 rounded shadow-sm text-[10px]">
                          {storeSettingsForm.activePromoCode}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveStoreSettings} className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-4 text-xs font-sans shadow-sm">
                  <div>
                    <label className="text-[#1E3A34] font-semibold block mb-1">Top Announcement Bar Text</label>
                    <textarea
                      rows={2}
                      required
                      value={storeSettingsForm.announcementText}
                      onChange={e => setStoreSettingsForm({ ...storeSettingsForm, announcementText: e.target.value })}
                      placeholder="e.g. ⚡ FLASH OFFER: Enjoy Free Express Delivery on orders above ₹499"
                      className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg p-2.5 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#1E3A34] font-semibold block mb-1">Active Featured Promo Code</label>
                      <input
                        type="text"
                        value={storeSettingsForm.activePromoCode}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, activePromoCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. SAVE10, FESTIVE30"
                        className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#C2603F] font-mono font-bold uppercase focus:outline-none focus:border-[#1E3A34]"
                      />
                      <span className="text-[10px] text-[#6B665E] mt-0.5 block">Displayed prominently to users in top ticker</span>
                    </div>

                    <div>
                      <label className="text-[#1E3A34] font-semibold block mb-1">Free Shipping Minimum Cart Value (₹)</label>
                      <input
                        type="number"
                        required
                        value={storeSettingsForm.freeShippingMinAmount}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, freeShippingMinAmount: Number(e.target.value) })}
                        className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                      />
                      <span className="text-[10px] text-[#6B665E] mt-0.5 block">Orders above this get free delivery in Cart</span>
                    </div>

                    <div>
                      <label className="text-[#1E3A34] font-semibold block mb-1">Standard Delivery Fee (₹)</label>
                      <input
                        type="number"
                        required
                        value={storeSettingsForm.shippingFee}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, shippingFee: Number(e.target.value) })}
                        className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] font-mono focus:outline-none focus:border-[#1E3A34]"
                      />
                    </div>

                    <div>
                      <label className="text-[#1E3A34] font-semibold block mb-1">Concierge Support Phone</label>
                      <input
                        type="text"
                        value={storeSettingsForm.supportPhone}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, supportPhone: e.target.value })}
                        className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[#1E3A34] font-semibold block mb-1">Concierge Support Email</label>
                      <input
                        type="email"
                        value={storeSettingsForm.supportEmail}
                        onChange={e => setStoreSettingsForm({ ...storeSettingsForm, supportEmail: e.target.value })}
                        className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="btn-cta px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-md text-xs text-white"
                    >
                      <Check className="w-4 h-4" />
                      <span>{savingSettings ? 'Publishing...' : 'Save & Publish to Live Store'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 9. CUSTOMER REVIEWS MODERATION TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD2]">
                  <div>
                    <span className="text-xs text-[#1E3A34] font-bold uppercase tracking-wider font-serif">Customer Reviews Moderation ({adminReviews.length})</span>
                    <p className="text-[11px] text-[#6B665E]">Moderate, audit, or purge reviews. Product ratings recalculate automatically upon removal.</p>
                  </div>
                  <button
                    onClick={fetchAdminReviews}
                    className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E7DFD2] text-[#1E3A34] hover:bg-[#FAF6EF] transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingReviews ? (
                  <div className="text-center py-10 text-[#1E3A34]">Loading customer reviews...</div>
                ) : adminReviews.length === 0 ? (
                  <div className="text-center py-16 p-6 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] text-[#6B665E] space-y-1 shadow-sm">
                    <MessageSquare className="w-8 h-8 mx-auto text-[#6B665E]/50 mb-2" />
                    <p className="font-semibold text-sm text-[#1F2421]">No Customer Reviews Yet</p>
                    <p className="text-xs">Customer verified product reviews will appear here for governance and moderation.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminReviews.map((r) => (
                      <div key={r._id} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[#FAF6EF] border border-[#E7DFD2] p-1 flex items-center justify-center shrink-0">
                            <img src={r.productId?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'} alt="Product" className="max-w-full max-h-full object-contain" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#1F2421]">{r.productId?.name || 'Catalog Item'}</span>
                              <div className="flex items-center text-[#B8935A]">
                                {[...Array(r.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-[#B8935A]" />
                                ))}
                              </div>
                            </div>
                            <h6 className="text-xs font-semibold text-[#1E3A34]">{r.title}</h6>
                            <p className="text-xs text-[#6B665E] leading-relaxed max-w-2xl">{r.comment}</p>
                            <div className="flex items-center gap-3 text-[10px] text-[#6B665E] pt-1">
                              <span>By: <strong className="text-[#1F2421]">{r.userName || r.userId?.name}</strong></span>
                              <span>•</span>
                              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                              {r.isVerifiedPurchase && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#4F7A5A] font-bold">Verified Buyer</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end shrink-0">
                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="px-3 py-1.5 rounded-lg bg-[#A63D2F]/10 hover:bg-[#A63D2F] text-[#A63D2F] hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-[#A63D2F]/20"
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

            {/* 10. BROADCAST DEALS TAB */}
            {activeTab === 'broadcast' && (
              <div className="max-w-xl mx-auto p-6 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-4 shadow-sm">
                <div>
                  <h4 className="font-bold text-base text-[#1E3A34] font-serif">Push Live Flash Deal Broadcast</h4>
                  <p className="text-xs text-[#6B665E] mt-1 font-sans">
                    Instantly notifies all active shoppers via real-time WebSockets and stores deal in notification drawer.
                  </p>
                </div>

                {broadcastStatus.text && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    broadcastStatus.type === 'success' ? 'bg-[#4F7A5A]/15 text-[#4F7A5A] border border-[#4F7A5A]/30' : 'bg-[#A63D2F]/15 text-[#A63D2F] border border-[#A63D2F]/30'
                  }`}>
                    {broadcastStatus.text}
                  </div>
                )}

                <form onSubmit={handleBroadcastDeal} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[#6B665E] font-medium block mb-1">Deal Badge Tag</label>
                    <input
                      type="text"
                      value={broadcastForm.dealTag}
                      onChange={e => setBroadcastForm({ ...broadcastForm, dealTag: e.target.value })}
                      placeholder="e.g. ⚡ MIDNIGHT DROP"
                      className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#C2603F] font-bold font-mono focus:outline-none focus:border-[#1E3A34]"
                    />
                  </div>
                  <div>
                    <label className="text-[#6B665E] font-medium block mb-1">Deal Headline</label>
                    <input
                      type="text"
                      required
                      value={broadcastForm.title}
                      onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      placeholder="e.g. 40% OFF Noise-Cancelling Headphones"
                      className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                    />
                  </div>
                  <div>
                    <label className="text-[#6B665E] font-medium block mb-1">Broadcast Message</label>
                    <textarea
                      required
                      rows={3}
                      value={broadcastForm.message}
                      onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      placeholder="Limited allocation: Only 50 units reserved for verified members."
                      className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                    />
                  </div>
                  <button type="submit" className="w-full btn-cta py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-white">
                    <Send className="w-4 h-4" />
                    <span>Broadcast to All Connected Clients</span>
                  </button>
                </form>
              </div>
            )}

            {/* 11. ANALYTICS & REPORTS TAB (FR-38, FR-39) */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD2]">
                  <span className="text-xs text-[#1E3A34] font-bold uppercase tracking-wider font-serif">Business Analytics & Inventory Health</span>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-cta text-xs font-bold cursor-pointer text-white shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Complete Settlement (CSV)</span>
                  </button>
                </div>

                {loadingAnalytics ? (
                  <div className="text-center py-10 text-[#1E3A34]">Loading Analytics Data...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stock Health */}
                    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-3 shadow-sm">
                      <h4 className="font-serif font-bold text-sm text-[#1E3A34]">Warehouse Stock Health</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#FAF6EF] border border-[#E7DFD2]">
                          <span className="text-[#4F7A5A] font-semibold">Healthy Stock (&ge; 5 units):</span>
                          <span className="font-mono font-bold text-[#1F2421]">{analyticsData?.stockHealth?.healthyStock || 0} items</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#FAF6EF] border border-[#E7DFD2]">
                          <span className="text-[#C2603F] font-semibold">Low Stock (&lt; 5 units):</span>
                          <span className="font-mono font-bold text-[#C2603F]">{analyticsData?.stockHealth?.lowStock || 0} items</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#FAF6EF] border border-[#E7DFD2]">
                          <span className="text-[#A63D2F] font-semibold">Out of Stock:</span>
                          <span className="font-mono font-bold text-[#A63D2F]">{analyticsData?.stockHealth?.outOfStock || 0} items</span>
                        </div>
                      </div>
                    </div>

                    {/* Department Allocation */}
                    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E7DFD2] space-y-3 md:col-span-2 shadow-sm">
                      <h4 className="font-serif font-bold text-sm text-[#1E3A34]">Department Inventory Allocation</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        {analyticsData?.categoryDistribution?.map(c => (
                          <div key={c._id || 'other'} className="p-3 rounded-lg bg-[#FAF6EF] border border-[#E7DFD2]">
                            <span className="text-[#1E3A34] font-bold capitalize block font-serif">{c._id || 'general'}</span>
                            <div className="flex justify-between text-[#6B665E] text-[11px] mt-1 font-mono">
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
