import React from 'react';
import { Filter, RotateCcw, Star, Check, SlidersHorizontal, X } from 'lucide-react';

export default function SidebarFilters({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  priceRange = [0, 1000000],
  onPriceChange,
  minRating = 0,
  onRatingChange,
  minDiscount = 0,
  onDiscountChange,
  inStockOnly = false,
  onInStockToggle,
  sortBy = 'featured',
  onSortChange,
  onResetFilters,
  isOpen = false,
  onClose
}) {
  const discountOptions = [
    { label: '50% or more', value: 50 },
    { label: '30% or more', value: 30 },
    { label: '20% or more', value: 20 },
    { label: '10% or more', value: 10 },
  ];

  const ratingOptions = [
    { label: '4★ & above', value: 4 },
    { label: '3★ & above', value: 3 },
    { label: '2★ & above', value: 2 },
  ];

  const sortOptions = [
    { label: 'Featured Collections', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Customer Rating', value: 'rating-desc' },
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Discount: High to Low', value: 'discount-desc' },
  ];

  const hasActiveFilters = 
    selectedCategory !== '' ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000000 ||
    minRating > 0 ||
    minDiscount > 0 ||
    inStockOnly ||
    sortBy !== 'featured';

  const filterContent = (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD2]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1E3A34]" />
          <h2 className="text-sm font-bold text-[#1E3A34] uppercase tracking-wider font-sans">Filters & Sorting</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#C2603F] hover:text-[#A44E31] transition-colors py-1 px-2 rounded-[4px] bg-[#FAF6EF] border border-[#C2603F]/20 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Sort By Dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#6B665E] uppercase tracking-wider block">
          Sort By
        </label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-[#FAF6EF] border border-[#E7DFD2] rounded-[6px] px-3.5 py-2.5 text-xs text-[#1F2421] focus:outline-none focus:border-[#1E3A34] focus:ring-1 focus:ring-[#1E3A34] transition-all cursor-pointer appearance-none font-sans"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#FFFFFF] text-[#1F2421]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6B665E]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-[#6B665E] uppercase tracking-wider block">
          Department
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs transition-all text-left cursor-pointer ${
              selectedCategory === ''
                ? 'bg-[#FAF6EF] text-[#1E3A34] font-bold border border-[#B8935A]/50'
                : 'text-[#6B665E] hover:bg-[#FAF6EF] hover:text-[#1F2421]'
            }`}
          >
            <span>All Departments</span>
            {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-[#B8935A]" />}
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat._id || cat.slug}
                onClick={() => onSelectCategory(isSelected ? '' : cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#FAF6EF] text-[#1E3A34] font-bold border border-[#B8935A]/50'
                    : 'text-[#6B665E] hover:bg-[#FAF6EF] hover:text-[#1F2421]'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#B8935A] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#6B665E] uppercase tracking-wider">
            Price Range
          </label>
          <span className="text-[11px] font-sans text-[#1E3A34] font-bold tabular-nums">
            ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
          </span>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="1000000"
            step="5000"
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full h-1.5 bg-[#E7DFD2] rounded-lg appearance-none cursor-pointer accent-[#C2603F]"
          />
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 bg-[#FAF6EF] border border-[#E7DFD2] rounded-[6px] px-2.5 py-1.5 flex items-center gap-1">
              <span className="text-[#6B665E]">₹</span>
              <input
                type="number"
                value={priceRange[0]}
                min="0"
                max={priceRange[1]}
                onChange={(e) => onPriceChange([Math.max(0, Number(e.target.value)), priceRange[1]])}
                className="w-full bg-transparent text-[#1F2421] focus:outline-none font-sans tabular-nums text-xs"
                placeholder="Min"
              />
            </div>
            <span className="text-[#6B665E]">to</span>
            <div className="flex-1 bg-[#FAF6EF] border border-[#E7DFD2] rounded-[6px] px-2.5 py-1.5 flex items-center gap-1">
              <span className="text-[#6B665E]">₹</span>
              <input
                type="number"
                value={priceRange[1]}
                min={priceRange[0]}
                max="1000000"
                onChange={(e) => onPriceChange([priceRange[0], Math.min(1000000, Number(e.target.value))])}
                className="w-full bg-transparent text-[#1F2421] focus:outline-none font-sans tabular-nums text-xs"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#6B665E] uppercase tracking-wider block">
          Minimum Rating
        </label>
        <div className="space-y-1.5">
          {ratingOptions.map((opt) => {
            const isSelected = minRating === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onRatingChange(isSelected ? 0 : opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#FAF6EF] text-[#1E3A34] font-bold border border-[#B8935A]/50'
                    : 'text-[#6B665E] hover:bg-[#FAF6EF] hover:text-[#1F2421]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#B8935A] text-[#B8935A]" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#B8935A]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount Filter */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#6B665E] uppercase tracking-wider block">
          Minimum Discount
        </label>
        <div className="grid grid-cols-2 gap-2">
          {discountOptions.map((opt) => {
            const isSelected = minDiscount === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onDiscountChange(isSelected ? 0 : opt.value)}
                className={`px-3 py-2 rounded-[6px] text-xs font-semibold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#C2603F] text-white shadow-sm'
                    : 'bg-[#FAF6EF] text-[#6B665E] border border-[#E7DFD2] hover:border-[#B8935A] hover:text-[#1F2421]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability / In-Stock Toggle */}
      <div className="pt-2 border-t border-[#E7DFD2]">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-semibold text-[#6B665E] group-hover:text-[#1F2421] transition-colors">
            In-Stock Items Only
          </span>
          <div
            onClick={onInStockToggle}
            className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
              inStockOnly ? 'bg-[#4F7A5A]' : 'bg-[#E7DFD2]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full transition-transform bg-white shadow-sm ${
                inStockOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 self-stretch">
        <div className="sticky top-28 max-h-[calc(100vh-8.5rem)] overflow-y-auto no-scrollbar bg-[#FFFFFF] border border-[#E7DFD2] rounded-[6px] p-5 shadow-classic">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-[#0D0606]/60 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-[#FFFFFF] border-l border-[#E7DFD2] p-5 overflow-y-auto z-10 flex flex-col justify-between text-[#1F2421]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7DFD2]">
                <span className="font-serif font-bold text-[#1E3A34] text-lg">Filters & Sort</span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-[4px] text-[#6B665E] hover:text-[#1F2421] hover:bg-[#FAF6EF] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-[#C2603F] hover:bg-[#A44E31] text-white font-bold rounded-[6px] text-center shadow-sm uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Apply Selection
            </button>
          </div>
        </div>
      )}
    </>
  );
}
