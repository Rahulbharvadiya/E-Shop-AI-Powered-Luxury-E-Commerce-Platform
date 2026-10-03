import React, { useState } from 'react';
import { Heart, Plus, Minus, ShoppingBag, Star, Zap } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useAuthStore } from '../stores/useAuthStore';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

export default function ProductCard({ product, onOpenDetail }) {
  const { user } = useAuthStore();
  const { items, addToCart, updateQuantity, toggleCartDrawer } = useCartStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();

  const isWishlisted = wishlistIds.includes(product._id);
  const cartItem = items.find(i => (i.productId || i._id) === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const [isHeartPopping, setIsHeartPopping] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setIsHeartPopping(true);
    toggleWishlist(product._id);
    setTimeout(() => setIsHeartPopping(false), 300);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (user?.role?.toLowerCase() === 'admin') {
      alert('Administrators are restricted from customer shopping (RBAC rule). Please switch to a Customer account to buy products.');
      return;
    }
    addToCart(product, 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateQuantity(product._id, quantityInCart + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(product._id, quantityInCart - 1);
  };

  const primaryImage = (!imgError && product.images?.[0]) ? product.images[0] : FALLBACK_IMAGE;

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(product)}
      className="card-3d p-4 flex flex-col justify-between h-[450px] min-h-[450px] cursor-pointer group select-none font-poppins relative rounded-2xl bg-[#160D0D] border border-[#F8F6F6]/10 hover:border-[#FF9E00]/40 transition-all duration-300"
    >
      <div>
        {/* Uniform Framing Container: Strictly 224px (h-56) with Centered Containment */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-gradient-to-b from-[#180E0E] to-[#0D0606] mb-3 border border-[#F8F6F6]/10 flex items-center justify-center p-3 group-hover:border-[#FF9E00]/30 transition-colors">
          <img
            src={primaryImage}
            alt={product.name}
            onError={() => setImgError(true)}
            className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Top Left Discount Badge */}
          {product.discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 badge-discount z-10">
              -{product.discountPercent}% OFF
            </div>
          )}

          {/* Top Right Wishlist Heart Toggle */}
          <button
            onClick={handleHeartClick}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-[#0D0606]/80 backdrop-blur-md border border-[#F8F6F6]/15 hover:scale-110 active:scale-95 ${
              isHeartPopping ? 'scale-125' : ''
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted
                  ? 'fill-[#FF9E00] text-[#FF9E00]'
                  : 'text-[#F8F6F6] hover:text-[#FF9E00]'
              }`}
            />
          </button>
        </div>

        {/* Brand & Category Label: Fixed Height (h-5) */}
        <div className="flex items-center justify-between text-[11px] text-[#786E6E] mb-1 font-semibold uppercase tracking-wider h-5">
          <span className="truncate max-w-[140px]">{product.brand || 'Exclusive'}</span>
          <div className="flex items-center gap-1 text-[#FF9E00] shrink-0">
            <Star className="w-3 h-3 fill-[#FF9E00]" />
            <span className="font-mono font-bold text-[#F8F6F6]">{product.ratingAverage || '4.5'}</span>
          </div>
        </div>

        {/* Title: Fixed Height (h-10) with 2-line clamp */}
        <h4 
          className="font-poppins font-semibold text-sm text-[#F8F6F6] group-hover:text-[#FF9E00] transition-colors line-clamp-2 leading-snug mb-1 h-10 overflow-hidden"
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Short Highlight info: Fixed Height (h-4) */}
        <p className="text-[11px] text-[#B8B0B0] line-clamp-1 mb-2 h-4 overflow-hidden">
          {product.shortInfo || product.description || 'Verified authentic luxury quality'}
        </p>
      </div>

      {/* Bottom Pricing & Inline Cart Quantity Stepper: Fixed Height (h-14) pinned to bottom */}
      <div className="mt-auto pt-3 border-t border-[#F8F6F6]/10 flex items-center justify-between gap-2 h-14">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-poppins font-bold text-base text-[#F8F6F6] truncate">
              ₹{product.discountedPrice?.toLocaleString()}
            </span>
            {product.originalPrice > product.discountedPrice && (
              <span className="text-[11px] text-[#786E6E] line-through font-mono">
                ₹{product.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[9px] text-[#B8B0B0] block">In Stock & Verified</span>
        </div>

        {/* Inline Stepper: [-] [qty] [+] or [Add to Cart] button */}
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          {quantityInCart > 0 ? (
            <div className="flex items-center bg-[#0D0606] border border-[#FF9E00]/60 rounded-xl p-0.5 shadow-md">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg bg-[#160D0D] hover:bg-[#FF9E00] hover:text-[#0D0606] text-[#F8F6F6] flex items-center justify-center transition-colors font-bold cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center font-bold text-xs text-[#FF9E00] font-mono select-none">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg bg-[#FF9E00] hover:bg-[#FFAE26] text-[#0D0606] flex items-center justify-center transition-colors font-bold cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF9E00] hover:bg-[#FFAE26] text-[#0D0606] text-xs font-bold transition-all shadow-md shadow-[#FF9E00]/25 cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
