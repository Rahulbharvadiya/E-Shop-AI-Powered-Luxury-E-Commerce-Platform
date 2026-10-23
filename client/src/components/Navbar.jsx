import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  ChevronDown,
  User,
  Bell,
  Sparkles,
  LogOut,
  Package,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useNotificationStore } from '../stores/useNotificationStore';

export default function Navbar({ onSelectCategory, onSearch, onOpenAdmin, onOpenAccount }) {
  const { user, isAuthenticated, openAuthModal, logout } = useAuthStore();
  const { totalItems, toggleCartDrawer } = useCartStore();
  const { wishlistIds } = useWishlistStore();
  const { unreadCount, toggleDrawer } = useNotificationStore();

  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({
    announcementText: '⚡ FLASH OFFER: Enjoy Free Express Delivery on orders above ₹499 • Use Code SAVE10',
    activePromoCode: 'SAVE10'
  });

  const loadCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  };

  const loadSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCategories();
    loadSettings();

    const handleSettingsUpdated = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        loadSettings();
      }
    };

    const handleCategoriesUpdated = () => {
      loadCategories();
    };

    window.addEventListener('eshop_settings_updated', handleSettingsUpdated);
    window.addEventListener('eshop_categories_updated', handleCategoriesUpdated);

    return () => {
      window.removeEventListener('eshop_settings_updated', handleSettingsUpdated);
      window.removeEventListener('eshop_categories_updated', handleCategoriesUpdated);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1E3A34] text-[#FAF6EF] border-b border-[#B8935A]/35 shadow-classic">
      {/* Top Luxury Announcement Ticker - Controlled by Admin */}
      <div className="bg-[#142922] border-b border-[#B8935A]/25 py-1.5 px-4 text-center text-[11px] text-[#FAF6EF]/85 font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="text-[#B8935A] font-bold">⚡ ANNOUNCEMENT:</span>
        <span>{settings.announcementText || 'Enjoy luxury shopping with certified authentic assurance.'}</span>
        {settings.activePromoCode && (
          <span className="hidden sm:inline-flex items-center gap-1 ml-2">
            <span>Use Code:</span>
            <span className="text-[#142922] font-mono font-black bg-[#B8935A] px-2 py-0.5 rounded shadow text-[10px] tracking-wider">
              {settings.activePromoCode}
            </span>
          </span>
        )}
      </div>

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Animated Category Dropdown */}
        <div className="flex items-center gap-6 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onSelectCategory) onSelectCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group text-decoration-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-[6px] bg-[#C2603F] text-white flex items-center justify-center shadow-md font-black group-hover:scale-105 transition-transform shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-2xl tracking-tight text-white block leading-none drop-shadow-sm">
                E<span className="text-[#C2603F]">·</span>SHOP
              </span>
              <span className="text-[10px] font-semibold text-[#B8935A] uppercase tracking-widest block mt-1 font-sans">
                Haute Commerce
              </span>
            </div>
          </a>

          {/* Animated Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-[6px] bg-[#142922] hover:bg-[#2A524A] border border-[#B8935A]/35 text-[#FAF6EF] text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <span>Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#B8935A] transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-[#1E3A34] border border-[#B8935A]/40 rounded-[8px] shadow-2xl p-2 z-50 animate-slide-down"
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                <div className="text-[10px] font-bold text-[#B8935A] px-3 py-1.5 uppercase tracking-wider font-sans">
                  Curated Departments
                </div>
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('all');
                    setIsCategoryOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-[6px] text-xs font-semibold text-[#FAF6EF] hover:bg-[#2A524A] transition-colors flex items-center justify-between"
                >
                  <span>✨ All Collections</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat.slug);
                      setIsCategoryOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-[6px] text-xs font-medium text-[#FAF6EF]/85 hover:bg-[#2A524A] hover:text-[#FAF6EF] transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[9px] text-[#142922] bg-[#B8935A] px-1.5 py-0.5 rounded font-bold font-mono">
                      {cat.discountTag || 'OFFER'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Smart AI Search Bar */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search luxury tech, fashion, sneakers, or ask AI..."
              className="w-full bg-[#142922] border border-[#B8935A]/35 rounded-[6px] py-2.5 pl-4 pr-12 text-xs text-[#FAF6EF] placeholder-[#FAF6EF]/55 focus:outline-none focus:border-[#B8935A] focus:ring-1 focus:ring-[#B8935A] transition-all font-sans"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 rounded-[6px] bg-[#C2603F] hover:bg-[#A44E31] text-white transition-transform active:scale-95 shadow-sm cursor-pointer"
              title="Search"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Right Badges & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Notifications Bell */}
          <button
            onClick={() => toggleDrawer(true)}
            className="relative p-2.5 rounded-[6px] bg-[#142922] hover:bg-[#2A524A] border border-[#B8935A]/35 text-[#FAF6EF] transition-colors cursor-pointer"
            title="Deal Broadcasts"
          >
            <Bell className="w-4 h-4 text-[#FAF6EF]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C2603F] text-white text-[10px] font-black flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Wishlist Heart */}
          <button
            onClick={() => {
              const elem = document.getElementById('catalog-section');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative p-2.5 rounded-[6px] bg-[#142922] hover:bg-[#2A524A] border border-[#B8935A]/35 text-[#FAF6EF] transition-colors cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-4 h-4 text-[#FAF6EF]" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C2603F] text-white text-[10px] font-black flex items-center justify-center font-mono">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            id="cart-drawer-trigger"
            aria-label="Shopping Cart"
            onClick={(e) => {
              e.preventDefault();
              toggleCartDrawer(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[6px] bg-[#C2603F] hover:bg-[#A44E31] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden md:inline">Cart</span>
            <span className="w-5 h-5 rounded-full bg-[#142922] text-[#FAF6EF] text-[10px] font-black flex items-center justify-center font-mono">
              {totalItems}
            </span>
          </button>

          {/* Store Admin Direct Access Button */}
          {user?.role?.toLowerCase() === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-[#142922] hover:bg-[#2A524A] text-[#B8935A] hover:text-[#FAF6EF] border border-[#B8935A]/50 font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="Open Admin Operations Console"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Admin Portal</span>
            </button>
          )}

          {/* Profile / Account / Admin */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-[6px] bg-[#142922] hover:bg-[#2A524A] border border-[#B8935A]/35 text-[#FAF6EF] transition-all cursor-pointer"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.name}
                  className="w-7 h-7 rounded-md object-cover border border-[#B8935A]"
                />
                <ChevronDown className="w-3.5 h-3.5 text-[#B8935A]" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#1E3A34] border border-[#B8935A]/40 rounded-[8px] shadow-2xl p-2 z-50 animate-slide-down"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#B8935A]/25">
                    <p className="text-xs font-bold text-[#FAF6EF] truncate">{user?.name}</p>
                    <p className="text-[10px] text-[#FAF6EF]/70 truncate">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B8935A] text-[#142922]">
                        Store Admin
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenAccount) onOpenAccount('orders');
                      }}
                      className="w-full text-left px-3 py-2 rounded-[6px] text-xs font-semibold text-[#FAF6EF]/85 hover:text-white hover:bg-[#2A524A] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-[#B8935A]" />
                      My Orders & Tracking
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenAdmin) onOpenAdmin();
                        }}
                        className="w-full text-left px-3 py-2 rounded-[6px] text-xs font-bold text-[#B8935A] hover:bg-[#2A524A] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Console
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-[6px] text-xs font-semibold text-rose-300 hover:bg-rose-900/30 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#142922] hover:bg-[#2A524A] border border-[#B8935A]/35 text-[#FAF6EF] text-xs font-bold transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#B8935A]" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
