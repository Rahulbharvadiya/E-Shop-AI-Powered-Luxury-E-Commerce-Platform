import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Filter, Search, X, Sparkles, SlidersHorizontal, 
  ArrowUpDown, Flame, PackageCheck, AlertCircle, ShoppingBag, Heart
} from 'lucide-react';

// Zustand Stores
import { useAuthStore } from './stores/useAuthStore';
import { useCartStore } from './stores/useCartStore';
import { useWishlistStore } from './stores/useWishlistStore';
import { useNotificationStore } from './stores/useNotificationStore';

// Components
import Navbar from './components/Navbar';
import AutoBannerCarousel from './components/AutoBannerCarousel';
import CategoryStrip from './components/CategoryStrip';
import SidebarFilters from './components/SidebarFilters';
import ProductCard from './components/ProductCard';
import AIRecGrid from './components/AIRecGrid';
import Web3CanvasFooter from './components/Web3CanvasFooter';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import ProductDetailModal from './components/ProductDetailModal';
import AccountModal from './components/AccountModal';
import NotificationDrawer from './components/NotificationDrawer';
import StickyGlassAIAssistant from './components/StickyGlassAIAssistant';
import AdminPortalModal from './components/AdminPortalModal';

export default function App() {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchCart: loadCartStore } = useCartStore();
  const { fetchWishlist, wishlistIds } = useWishlistStore();
  const { fetchNotifications } = useNotificationStore();

  // Categories & Products Catalog State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters & Sorting State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Modals & UI States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState('orders');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Toast Deal Alert Notification
  const [toastNotification, setToastNotification] = useState(null);
  const [catalogRefreshTrigger, setCatalogRefreshTrigger] = useState(0);

  // Socket Connection for Real-Time Deal Broadcasting & Admin Content Sync
  useEffect(() => {
    const socket = io();

    socket.on('deal_notification', (data) => {
      setToastNotification(data);
      fetchNotifications();
      setTimeout(() => setToastNotification(null), 6000);
    });

    socket.on('settings_updated', (settings) => {
      window.dispatchEvent(new CustomEvent('eshop_settings_updated', { detail: settings }));
    });

    socket.on('categories_updated', () => {
      window.dispatchEvent(new CustomEvent('eshop_categories_updated'));
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) setCategories(data.data);
        })
        .catch(() => {});
    });

    socket.on('banners_updated', () => {
      window.dispatchEvent(new CustomEvent('eshop_banners_updated'));
    });

    socket.on('products_updated', () => {
      setCatalogRefreshTrigger(prev => prev + 1);
    });

    const handleLocalProductsUpdated = () => {
      setCatalogRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('eshop_products_updated', handleLocalProductsUpdated);

    return () => {
      window.removeEventListener('eshop_products_updated', handleLocalProductsUpdated);
      socket.disconnect();
    };
  }, []);

  // Sync session & stores on mount
  useEffect(() => {
    loadCartStore();
    fetchWishlist();
    fetchNotifications();

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Catalog Products dynamically based on applied filters
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingProducts(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (priceRange[0] > 0) params.append('minPrice', priceRange[0]);
        if (priceRange[1] < 100000) params.append('maxPrice', priceRange[1]);
        if (minRating > 0) params.append('rating', minRating);
        if (minDiscount > 0) params.append('minDiscount', minDiscount);
        if (inStockOnly) params.append('inStock', 'true');
        if (sortBy) params.append('sort', sortBy);
        params.append('limit', '40');

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.data) {
          let list = Array.isArray(data.data) ? data.data : (data.data.products || []);
          if (showWishlistOnly) {
            list = list.filter(p => wishlistIds.includes(p._id));
          }
          setProducts(list);
          setTotalProducts(data.pagination?.total || data.data?.pagination?.total || list.length);
        }
      } catch (e) {
        console.error('Error fetching catalog:', e);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCatalog();
  }, [selectedCategory, searchQuery, priceRange, minRating, minDiscount, inStockOnly, sortBy, showWishlistOnly, wishlistIds, catalogRefreshTrigger]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange([0, 100000]);
    setMinRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setSortBy('featured');
    setShowWishlistOnly(false);
  };

  const handleFilterMegaDiscounts = () => {
    setMinDiscount(30);
    setSortBy('discount-desc');
    const catalogElem = document.getElementById('catalog-section');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBannerProduct = (slug) => {
    const found = products.find(p => p.slug === slug);
    if (found) {
      setSelectedProduct(found);
    } else {
      fetch(`/api/products/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) setSelectedProduct(data.data);
        })
        .catch(() => {});
    }
  };

  const handleDealNotificationClick = (notif) => {
    if (notif.targetUrl && notif.targetUrl.includes('mega')) {
      handleFilterMegaDiscounts();
    } else {
      setSortBy('discount-desc');
    }
    const catalogElem = document.getElementById('catalog-section');
    if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D0606] text-[#F8F6F6] flex flex-col selection:bg-[#FF9E00] selection:text-[#0D0606] relative font-poppins">
      
      {/* Real-time Broadcast Toast in Luxury Amber Style */}
      {toastNotification && (
        <div className="fixed top-24 right-5 z-50 max-w-sm bg-[#140B0B] border border-[#FF9E00]/40 p-4 rounded-2xl shadow-2xl animate-slide-left flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#FF9E00]/15 text-[#FF9E00] shrink-0 font-bold">
            <Flame className="w-5 h-5 fill-[#FF9E00]" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9E00] font-mono">
              {toastNotification.dealTag || '⚡ FLASH BROADCAST'}
            </span>
            <h5 className="text-xs font-bold text-[#F8F6F6] mt-0.5 font-giliran">{toastNotification.title}</h5>
            <p className="text-[11px] text-[#B8B0B0] mt-1 line-clamp-2">{toastNotification.message}</p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-[#786E6E] hover:text-[#F8F6F6] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        onSelectCategory={(slug) => {
          setSelectedCategory(slug === 'all' ? '' : slug);
          const elem = document.getElementById('catalog-section');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onSearch={(query) => {
          setSearchQuery(query);
          const elem = document.getElementById('catalog-section');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenAccount={() => {
          setAccountInitialTab('orders');
          setIsAccountModalOpen(true);
        }}
      />

      {/* 1. Auto-Swipe Discount Posters Hero Carousel (left-to-right every 4s) */}
      <AutoBannerCarousel
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          const elem = document.getElementById('catalog-section');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectProductSlug={handleSelectBannerProduct}
      />

      {/* 2. Visual Category Boxes with pulsating "🔥 Mega Discounts" button */}
      <CategoryStrip
        activeCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(selectedCategory === slug ? '' : slug);
          const elem = document.getElementById('catalog-section');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onFilterMegaDiscounts={handleFilterMegaDiscounts}
      />

      {/* 3. Main Catalog Section with Responsive Left Sidebar Filter */}
      <section id="catalog-section" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 mt-10 mb-20 flex-1 scroll-mt-28">
        
        {/* Active Filter Indicator Bar & Mobile Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F8F6F6]/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#140B0B] border border-[#F8F6F6]/10 text-xs font-bold text-[#F8F6F6]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#FF9E00]" />
              <span>Filters</span>
            </button>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F8F6F6] font-giliran flex items-center gap-2.5">
                <span>{selectedCategory ? `${selectedCategory.toUpperCase()} COLLECTION` : 'HAUTE CATALOG'}</span>
                <span className="text-xs font-mono font-bold text-[#FF9E00] bg-[#FF9E00]/10 border border-[#FF9E00]/25 px-2.5 py-0.5 rounded-full">
                  {totalProducts} items
                </span>
              </h2>
              {searchQuery && (
                <p className="text-xs text-[#FF9E00] mt-0.5">
                  Filtered query: &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 text-xs">
            {wishlistIds.length > 0 && (
              <button
                onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  showWishlistOnly
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold border-[#FF9E00]'
                    : 'bg-[#140B0B] text-[#B8B0B0] border-[#F8F6F6]/10 hover:text-[#F8F6F6]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showWishlistOnly ? 'fill-[#0D0606]' : ''}`} />
                <span>Wishlist ({wishlistIds.length})</span>
              </button>
            )}

            {(selectedCategory || searchQuery || minDiscount > 0 || minRating > 0 || inStockOnly || showWishlistOnly) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[#786E6E] hover:text-[#F8F6F6] px-2.5 py-1.5 rounded-xl bg-[#140B0B] border border-[#F8F6F6]/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Split Layout: Sidebar + Product Grid */}
        <div className="flex gap-8 items-stretch">
          {/* Left Sidebar Filter */}
          <SidebarFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            minRating={minRating}
            onRatingChange={setMinRating}
            minDiscount={minDiscount}
            onDiscountChange={setMinDiscount}
            inStockOnly={inStockOnly}
            onInStockToggle={() => setInStockOnly(!inStockOnly)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetFilters={handleResetFilters}
            isOpen={isMobileFiltersOpen}
            onClose={() => setIsMobileFiltersOpen(false)}
          />

          {/* Products Grid */}
          <div className="flex-1">
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-96 rounded-3xl skeleton" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-[#140B0B] rounded-3xl border border-[#F8F6F6]/10">
                <ShoppingBag className="w-12 h-12 text-[#786E6E] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#F8F6F6] font-giliran">No products match your criteria</h3>
                <p className="text-xs text-[#786E6E] mt-1 max-w-sm mx-auto font-poppins">
                  Try broadening your price range or clearing department filters to discover more items.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-xl btn-theme-primary text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {products.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    onOpenDetail={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. 3x4 AI-Recommended Products Grid (12 Items) */}
      <AIRecGrid onOpenDetail={setSelectedProduct} />

      {/* 5. Interactive Web3 HTML5 Canvas Particle Footer with Contact Info */}
      <Web3CanvasFooter onSelectCategory={(cat) => {
        setSelectedCategory(cat);
        const elem = document.getElementById('catalog-section');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }} />

      {/* 6. Sticky Floating Glassmorphism AI Shopping Concierge Bar (Pinned Bottom-Center) */}
      <StickyGlassAIAssistant onSelectProduct={setSelectedProduct} />

      {/* 7. Drawers & Modals */}
      <AuthModal />
      <CartDrawer onOpenAccount={() => {
        setAccountInitialTab('orders');
        setIsAccountModalOpen(true);
      }} />
      <NotificationDrawer onSelectDeal={handleDealNotificationClick} />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* User Account / Orders / 5-Step Stepper Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        initialTab={accountInitialTab}
      />

      {/* Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}
