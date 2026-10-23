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
      <div className="relative w-full h-72 sm:h-80 md:h-[390px] rounded-[8px] overflow-hidden border border-[#B8935A]/30 shadow-classic bg-[#1E3A34] group">
        
        {/* Banner Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200'; }}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A34] via-[#1E3A34]/90 to-transparent" />
        </div>

        {/* Banner Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl">
          
          {/* Discount Badge in Brick Red */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="badge-discount inline-flex items-center gap-1.5 text-[11px] font-bold uppercase rounded-[4px] px-2.5 py-1 bg-[#A63D2F] text-white">
              <Flame className="w-3.5 h-3.5 fill-white text-white" />
              <span>{currentBanner.discountTag || currentBanner.discountText || 'LIMITED EXCLUSIVE DEAL'}</span>
            </span>
          </div>

          {/* Heading in High-Contrast Playfair Serif */}
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold !text-white leading-[1.1] mb-3 drop-shadow-lg tracking-tight">
            {currentBanner.title}
          </h2>

          {/* Subtitle in Clean Inter / DM Sans */}
          <p className="text-xs sm:text-sm !text-[#FAF6EF] max-w-lg mb-6 line-clamp-2 font-sans leading-relaxed drop-shadow-sm font-medium">
            {currentBanner.subtitle || 'Experience flagship craftsmanship, uncompromised performance, and member-exclusive savings.'}
          </p>

          {/* Direct CTA Action Button in Terracotta */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBannerClick}
              className="btn-cta px-6 py-3 rounded-[6px] text-xs sm:text-sm font-bold flex items-center gap-2 tracking-wider uppercase cursor-pointer bg-[#C2603F] hover:bg-[#A44E31] text-white shadow-sm"
            >
              <span>{currentBanner.ctaText || 'Claim Offer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Left / Right Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-[6px] bg-[#142922]/85 hover:bg-[#C2603F] text-[#FAF6EF] border border-[#B8935A]/35 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-[6px] bg-[#142922]/85 hover:bg-[#C2603F] text-[#FAF6EF] border border-[#B8935A]/35 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
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
                idx === currentIndex ? 'w-8 bg-[#C2603F]' : 'w-2 bg-[#FAF6EF]/40 hover:bg-[#FAF6EF]/70'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
