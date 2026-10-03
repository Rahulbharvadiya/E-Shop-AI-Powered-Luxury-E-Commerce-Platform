import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Tag } from 'lucide-react';

const FALLBACK_CAT_IMG = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';

export default function CategoryStrip({ activeCategory, onSelectCategory, onFilterMegaDiscounts }) {
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    loadCategories();

    const handleCategoriesUpdated = () => {
      loadCategories();
    };

    window.addEventListener('eshop_categories_updated', handleCategoriesUpdated);
    return () => {
      window.removeEventListener('eshop_categories_updated', handleCategoriesUpdated);
    };
  }, []);

  return (
    <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 mt-10 font-poppins">
      
      {/* Header with Title and Mega Discount Shortcut Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#F8F6F6] font-giliran">
            Curated Collections & Mega Deals
          </h3>
          <p className="text-xs text-[#B8B0B0] mt-0.5 font-poppins">
            Handpicked premium electronics, apparel, and lifestyle essentials
          </p>
        </div>

        {/* Pulsating Animated Mega Discounts Button in #FF9E00 */}
        <button
          onClick={onFilterMegaDiscounts}
          className="btn-pulsate-discount py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-extrabold shadow-lg cursor-pointer transition-transform active:scale-95"
        >
          <Flame className="w-4 h-4 fill-[#0D0606]" />
          <span>🔥 Mega Discounts (30%+ OFF)</span>
        </button>
      </div>

      {/* Category Visual Boxes: Strictly Uniform 6-Column Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <div
              key={cat._id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`group relative rounded-2xl p-3.5 cursor-pointer transition-all duration-300 border flex flex-col items-center text-center h-44 justify-between select-none ${
                isSelected
                  ? 'bg-[#1F1212] border-[#FF9E00] shadow-xl shadow-[#FF9E00]/15 scale-[1.02]'
                  : 'bg-[#160D0D] hover:bg-[#201313] border-[#F8F6F6]/10 hover:border-[#FF9E00]/40'
              }`}
            >
              {/* Category Image Box: Strictly Fixed Square 24-unit size with Containment */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-gradient-to-b from-[#1A1010] to-[#0D0606] relative border border-[#F8F6F6]/10 flex items-center justify-center p-2.5 group-hover:border-[#FF9E00]/30 transition-all">
                <img
                  src={cat.imageUrl || FALLBACK_CAT_IMG}
                  alt={cat.name}
                  onError={(e) => { e.currentTarget.src = FALLBACK_CAT_IMG; }}
                  className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Title & Discount Tag */}
              <div className="w-full">
                <span className="font-poppins font-semibold text-xs text-[#F8F6F6] group-hover:text-[#FF9E00] transition-colors truncate block">
                  {cat.name}
                </span>
                
                <span className="text-[10px] font-bold text-[#FF9E00] bg-[#FF9E00]/10 border border-[#FF9E00]/25 px-2 py-0.5 rounded-full mt-1.5 inline-block font-mono">
                  {cat.discountTag || 'Trending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
