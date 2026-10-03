import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame } from 'lucide-react';

export default function AutoBannerCarousel({ onSelectCategory, onSelectProductSlug }) {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  const loadBanners = () => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setBanners(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadBanners();

    const handleBannersUpdated = () => {
      loadBanners();
    };

    window.addEventListener('eshop_banners_updated', handleBannersUpdated);
    return () => {
      window.removeEventListener('eshop_banners_updated', handleBannersUpdated);
    };
  }, []);

  // Automatic slide from left to right every 4 seconds
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(autoPlayRef.current);
  }, [banners.length, isPaused]);

  if (banners.length === 0) {
    return (
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 mt-6">
        <div className="w-full h-72 sm:h-88 rounded-3xl skeleton"></div>
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];

  const handleBannerClick = () => {
    if (!currentBanner) return;
    if (onSelectCategory && (currentBanner.targetSlug === 'mobiles' || currentBanner.targetSlug === 'laptops' || currentBanner.targetSlug === 'audio' || currentBanner.targetSlug === 'watches')) {
      onSelectCategory(currentBanner.targetSlug);
    } else if (onSelectProductSlug) {
      onSelectProductSlug(currentBanner.targetSlug);
    }
  };

  return (
    <div
      className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 mt-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-72 sm:h-80 md:h-[390px] rounded-3xl overflow-hidden border border-[#F8F6F6]/10 shadow-2xl bg-[#140B0B] group">
        
        {/* Banner Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200'; }}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0606] via-[#0D0606]/85 to-transparent" />
        </div>

        {/* Banner Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl">
          
          {/* Discount Badge */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="badge-theme-accent inline-flex items-center gap-1.5 text-[11px] font-black uppercase">
              <Flame className="w-3.5 h-3.5 fill-[#0D0606]" />
              <span>{currentBanner.discountTag || currentBanner.discountText || 'LIMITED EXCLUSIVE DEAL'}</span>
            </span>
          </div>

          {/* Heading in Giliran Luxury Serif */}
          <h2 className="font-giliran text-2xl sm:text-4xl md:text-5xl font-black text-[#F8F6F6] leading-[1.1] mb-3">
            {currentBanner.title}
          </h2>

          {/* Subtitle in Poppins */}
          <p className="text-xs sm:text-sm text-[#B8B0B0] max-w-lg mb-6 line-clamp-2 font-poppins leading-relaxed">
            {currentBanner.subtitle || 'Experience flagship craftsmanship, uncompromised performance, and member-exclusive savings.'}
          </p>

          {/* Direct CTA Action Button in #FF9E00 */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBannerClick}
              className="btn-theme-primary px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 tracking-wide cursor-pointer"
            >
              <span>{currentBanner.ctaText || 'Claim Offer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Left / Right Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#160D0D]/80 hover:bg-[#FF9E00] hover:text-[#0D0606] text-[#F8F6F6] border border-[#F8F6F6]/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#160D0D]/80 hover:bg-[#FF9E00] hover:text-[#0D0606] text-[#F8F6F6] border border-[#F8F6F6]/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-[#FF9E00]' : 'w-2 bg-[#F8F6F6]/30 hover:bg-[#F8F6F6]/60'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
