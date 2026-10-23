import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  Send
} from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useAuthStore } from '../stores/useAuthStore';

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const { addToCart, toggleCartDrawer } = useCartStore();
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const { isAuthenticated, user, openAuthModal } = useAuthStore();

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAutoSlidePaused, setIsAutoSlidePaused] = useState(false);
  const [qty, setQty] = useState(1);

  // Delivery Estimator State (Defaults to 560035 Bengaluru)
  const [pincode, setPincode] = useState('560035');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: product.ratingAverage || 4.5, total: product.reviewCount || 0, distribution: {} });
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // 6-Second Auto-Slide Gallery Timer
  useEffect(() => {
    if (images.length <= 1 || isAutoSlidePaused) return;

    const timer = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % images.length);
    }, 6000); // exactly 6 seconds as requested

    return () => clearInterval(timer);
  }, [images.length, isAutoSlidePaused]);

  // Initial Pincode Lookup (560035)
  useEffect(() => {
    handleCheckPincode('560035');
    fetchReviews();
  }, [product._id]);

  const handleCheckPincode = async (pin) => {
    setDeliveryLoading(true);
    setDeliveryError('');
    try {
      const res = await fetch('/api/pincode/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin, subtotal: product.discountedPrice })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Invalid postal code');
      setDeliveryInfo(data.data);
    } catch (err) {
      setDeliveryError(err.message);
    } finally {
      setDeliveryLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`);
      const data = await res.json();
      if (data.success && data.data) {
        setReviews(data.data.reviews || []);
        setReviewSummary({
          average: data.data.average,
          total: data.data.total,
          distribution: data.data.distribution || {}
        });
      }
    } catch (e) {}
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const token = localStorage.getItem('eshop_token');
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: newRating,
          title: newTitle,
          comment: newComment
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Review failed');
      }

      setReviewSuccess('Review published successfully! Thank you for your feedback.');
      setNewTitle('');
      setNewComment('');
      fetchReviews();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const wishlisted = isWishlisted(product._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0D0606]/65 backdrop-blur-sm animate-fade-in font-sans">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#FFFFFF] border border-[#E7DFD2] rounded-2xl shadow-2xl overflow-y-auto text-[#1F2421]">
        
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#FAF6EF] hover:bg-[#1E3A34] hover:text-[#FAF6EF] text-[#6B665E] border border-[#E7DFD2] transition-colors shadow-md cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="p-6 md:p-10">
          
          {/* Main Top Section: Gallery + Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Thumbnail Strip + 6-Second Auto Hero Viewer */}
            <div className="md:col-span-6 flex gap-3">
              
              {/* Vertical Thumbnail Strip */}
              <div className="flex flex-col gap-2.5 shrink-0 max-h-[420px] overflow-y-auto pr-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden bg-[#FAF6EF] flex items-center justify-center p-1 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#B8935A] ring-2 ring-[#B8935A]/30 shadow-sm scale-105'
                        : 'border-[#E7DFD2] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="max-w-full max-h-full w-auto h-auto object-contain" />
                  </button>
                ))}
              </div>

              {/* Main Hero Viewer with 6s Auto-Slide & Hover Pause */}
              <div
                className="relative flex-1 h-[340px] sm:h-[420px] rounded-2xl overflow-hidden bg-[#FAF6EF] border border-[#E7DFD2] group flex items-center justify-center p-4"
                onMouseEnter={() => setIsAutoSlidePaused(true)}
                onMouseLeave={() => setIsAutoSlidePaused(false)}
              >
                <img
                  src={images[activeImageIndex]}
                  alt={product.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Left/Right manual arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex(prev => (prev - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-[#1E3A34] hover:text-[#FAF6EF] text-[#1F2421] border border-[#E7DFD2] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex(prev => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-[#1E3A34] hover:text-[#FAF6EF] text-[#1F2421] border border-[#E7DFD2] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Discount Tag */}
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 badge-discount">
                    -{product.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT: Product Info, Price, Delivery Estimator & Cart CTA */}
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#1E3A34] uppercase tracking-wider bg-[#FAF6EF] px-2.5 py-0.5 rounded-full border border-[#E7DFD2] font-mono">
                    {product.brand || 'Exclusive'}
                  </span>
                  <span className="text-xs text-[#6B665E] capitalize">Department: {product.categorySlug || 'Luxury'}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A34] font-serif leading-tight mb-2">
                  {product.name}
                </h2>

                {/* Rating Bar */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-[#B8935A] text-xs font-bold gap-1 bg-[#FAF6EF] px-2.5 py-1 rounded-lg border border-[#E7DFD2]">
                    <Star className="w-3.5 h-3.5 fill-[#B8935A]" />
                    <span className="font-mono text-sm">{reviewSummary.average}</span>
                  </div>
                  <span className="text-xs text-[#6B665E]">
                    ({reviewSummary.total} Verified Ratings & Reviews)
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-[#E7DFD2]">
                  <span className="text-3xl font-bold text-[#1E3A34] font-sans tabular-nums">
                    ₹{Number(product.discountedPrice).toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice > product.discountedPrice && (
                    <span className="text-base text-[#6B665E] line-through font-mono">
                      ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-[#4F7A5A]">
                    Inclusive of all taxes
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#6B665E] leading-relaxed mb-6 font-sans">
                  {product.description}
                </p>

                {/* Smart Pincode Delivery Estimator (Default 560035 Bengaluru) */}
                <div className="p-4 rounded-xl bg-[#FAF6EF] border border-[#E7DFD2] mb-6 font-sans">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1E3A34] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#1E3A34]" />
                      <span>Delivery Speed & Distance Calculator</span>
                    </span>
                    <span className="text-[11px] text-[#C2603F] font-mono font-semibold">PIN: 560035</span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCheckPincode(pincode);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter 6-digit PIN"
                      className="flex-1 bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs font-mono text-[#1F2421] focus:outline-none focus:border-[#1E3A34] focus:ring-1 focus:ring-[#1E3A34]"
                    />
                    <button
                      type="submit"
                      disabled={deliveryLoading}
                      className="btn-secondary text-xs px-4 py-2 rounded-lg font-bold cursor-pointer"
                    >
                      {deliveryLoading ? 'Calculating...' : 'Check'}
                    </button>
                  </form>

                  {deliveryError && (
                    <p className="text-xs text-[#A63D2F] mt-2">{deliveryError}</p>
                  )}

                  {deliveryInfo && (
                    <div className="mt-3 pt-3 border-t border-[#E7DFD2] text-xs space-y-1">
                      <div className="flex items-center gap-2 text-[#1E3A34] font-bold">
                        <Truck className="w-4 h-4 text-[#4F7A5A]" />
                        <span>Estimated Arrival: {deliveryInfo.deliveryFormatted}</span>
                      </div>
                      <p className="text-[#6B665E] text-[11px]">
                        Destination: <strong className="text-[#1F2421]">{deliveryInfo.city}, {deliveryInfo.state}</strong> (Warehouse Distance: {deliveryInfo.distanceKm} km)
                      </p>
                      <p className="text-[11px] text-[#6B665E]">
                        Shipping Fee: <strong className="text-[#C2603F]">{deliveryInfo.shippingFee === 0 ? 'FREE EXPRESS' : `₹${deliveryInfo.shippingFee}`}</strong> &bull; Cash on Delivery Available
                      </p>
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-[#6B665E]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1E3A34]" />
                    <span>{product.warranty || '1 Year Certified Warranty'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#1E3A34]" />
                    <span>7-Day Return / Replacement</span>
                  </div>
                </div>

                {/* Quantity & CTA Buttons */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#FAF6EF] border border-[#E7DFD2] rounded-lg px-2 py-1">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="text-[#1F2421] px-2 py-1 text-sm font-bold hover:text-[#C2603F] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-[#1E3A34] px-2 font-mono tabular-nums">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(10, qty + 1))}
                      className="text-[#1F2421] px-2 py-1 text-sm font-bold hover:text-[#C2603F] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (user?.role?.toLowerCase() === 'admin') {
                        alert('Administrators are restricted from customer shopping (RBAC rule). Please switch to a Customer account to buy products.');
                        return;
                      }
                      addToCart(product, qty);
                      onClose();
                    }}
                    className="flex-1 btn-cta py-3 font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>Add to Cart (₹{Number(product.discountedPrice * qty).toLocaleString('en-IN')})</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      wishlisted ? 'bg-[#C2603F]/10 border-[#C2603F] text-[#C2603F]' : 'bg-[#FAF6EF] border-[#E7DFD2] text-[#6B665E] hover:text-[#C2603F]'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[#C2603F]' : ''}`} />
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Verified Purchaser Reviews & Write Review Gate */}
          <div className="mt-12 pt-8 border-t border-[#E7DFD2] font-sans">
            <h3 className="text-lg font-bold text-[#1E3A34] font-serif mb-4">
              Customer Reviews & Verified Buyer Feedback
            </h3>

            {/* Write a Review Section (Strictly Gated to Verified Purchasers) */}
            <div className="p-5 rounded-xl bg-[#FAF6EF] border border-[#E7DFD2] mb-8">
              <h4 className="text-sm font-bold text-[#1E3A34] mb-2 flex items-center gap-2 font-serif">
                <CheckCircle2 className="w-4 h-4 text-[#4F7A5A]" />
                <span>Write a Verified Customer Review</span>
              </h4>
              <p className="text-xs text-[#6B665E] mb-4">
                *Only buyers whose account has an order in <strong>DELIVERED</strong> status containing this product can submit a review.
              </p>

              {reviewError && (
                <div className="mb-3 p-3 rounded-lg bg-[#A63D2F]/10 border border-[#A63D2F]/30 text-[#A63D2F] text-xs">
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="mb-3 p-3 rounded-lg bg-[#4F7A5A]/10 border border-[#4F7A5A]/30 text-[#4F7A5A] text-xs">
                  {reviewSuccess}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B665E] font-medium">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className={`text-lg transition-transform cursor-pointer ${star <= newRating ? 'text-[#B8935A] scale-110' : 'text-[#E7DFD2]'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Headline / Review Title (e.g. 'Phenomenal luxury quality and comfort!')"
                  className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] placeholder-[#6B665E]/60 focus:outline-none focus:border-[#1E3A34]"
                />

                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with this item..."
                  className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] placeholder-[#6B665E]/60 focus:outline-none focus:border-[#1E3A34]"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-cta py-2 px-5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </form>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-xs text-[#6B665E] italic">No reviews yet. Be the first verified purchaser to leave a review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-xl bg-[#FAF6EF] border border-[#E7DFD2]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1E3A34] text-[#FAF6EF] flex items-center justify-center text-[10px] font-bold uppercase font-mono">
                          {rev.userName[0]}
                        </div>
                        <span className="text-xs font-bold text-[#1F2421]">{rev.userName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="badge-sage text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[#B8935A] text-xs font-bold font-mono">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <h5 className="text-xs font-bold text-[#1F2421] mb-1 font-serif">{rev.title}</h5>
                    <p className="text-xs text-[#6B665E] leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-[#6B665E]/75 mt-2 block font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
