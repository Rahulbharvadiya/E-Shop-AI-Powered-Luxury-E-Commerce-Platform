import React from 'react';
import { Filter, RotateCcw, Star, Check, SlidersHorizontal, X } from 'lucide-react';

export default function SidebarFilters({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  priceRange = [0, 100000],
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
    priceRange[1] < 100000 ||
    minRating > 0 ||
    minDiscount > 0 ||
    inStockOnly ||
    sortBy !== 'featured';

  const filterContent = (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F8F6F6]/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#FF9E00]" />
          <h2 className="text-sm font-bold text-[#F8F6F6] uppercase tracking-wider font-poppins">Filters & Sorting</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#FF9E00] hover:text-[#FFAE26] transition-colors py-1 px-2 rounded-lg bg-[#FF9E00]/10 hover:bg-[#FF9E00]/20"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Sort By Dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#786E6E] uppercase tracking-wider block">
          Sort By
        </label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00] focus:ring-1 focus:ring-[#FF9E00] transition-all cursor-pointer appearance-none font-poppins"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#140B0B] text-[#F8F6F6]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#B8B0B0]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-[#786E6E] uppercase tracking-wider block">
          Department
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
              selectedCategory === ''
                ? 'bg-[#FF9E00]/15 text-[#FF9E00] font-bold border border-[#FF9E00]/40'
                : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
            }`}
          >
            <span>All Departments</span>
            {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-[#FF9E00]" />}
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat._id || cat.slug}
                onClick={() => onSelectCategory(isSelected ? '' : cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  isSelected
                    ? 'bg-[#FF9E00]/15 text-[#FF9E00] font-bold border border-[#FF9E00]/40'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FF9E00] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#786E6E] uppercase tracking-wider">
            Price Range
          </label>
          <span className="text-[11px] font-mono text-[#FF9E00] font-bold">
            ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
          </span>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full h-1.5 bg-[#251515] rounded-lg appearance-none cursor-pointer accent-[#FF9E00]"
          />
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 bg-[#160D0D] border border-[#F8F6F6]/10 rounded-lg px-2.5 py-1.5 flex items-center gap-1">
              <span className="text-[#786E6E]">₹</span>
              <input
                type="number"
                value={priceRange[0]}
                min="0"
                max={priceRange[1]}
                onChange={(e) => onPriceChange([Math.max(0, Number(e.target.value)), priceRange[1]])}
                className="w-full bg-transparent text-[#F8F6F6] focus:outline-none font-mono text-xs"
                placeholder="Min"
              />
            </div>
            <span className="text-[#786E6E]">to</span>
            <div className="flex-1 bg-[#160D0D] border border-[#F8F6F6]/10 rounded-lg px-2.5 py-1.5 flex items-center gap-1">
              <span className="text-[#786E6E]">₹</span>
              <input
                type="number"
                value={priceRange[1]}
                min={priceRange[0]}
                max="100000"
                onChange={(e) => onPriceChange([priceRange[0], Math.min(100000, Number(e.target.value))])}
                className="w-full bg-transparent text-[#F8F6F6] focus:outline-none font-mono text-xs"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#786E6E] uppercase tracking-wider block">
          Minimum Rating
        </label>
        <div className="space-y-1.5">
          {ratingOptions.map((opt) => {
            const isSelected = minRating === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onRatingChange(isSelected ? 0 : opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  isSelected
                    ? 'bg-[#FF9E00]/15 text-[#FF9E00] font-bold border border-[#FF9E00]/40'
                    : 'text-[#B8B0B0] hover:bg-[#1A1010] hover:text-[#F8F6F6]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#FF9E00] text-[#FF9E00]" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FF9E00]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount Filter */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#786E6E] uppercase tracking-wider block">
          Minimum Discount
        </label>
        <div className="grid grid-cols-2 gap-2">
          {discountOptions.map((opt) => {
            const isSelected = minDiscount === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onDiscountChange(isSelected ? 0 : opt.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-center ${
                  isSelected
                    ? 'bg-[#FF9E00] text-[#0D0606] shadow-md shadow-[#FF9E00]/20'
                    : 'bg-[#160D0D] text-[#B8B0B0] border border-[#F8F6F6]/10 hover:border-[#F8F6F6]/25 hover:text-[#F8F6F6]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability / In-Stock Toggle */}
      <div className="pt-2 border-t border-[#F8F6F6]/10">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-semibold text-[#B8B0B0] group-hover:text-[#F8F6F6] transition-colors">
            In-Stock Items Only
          </span>
          <div
            onClick={onInStockToggle}
            className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
              inStockOnly ? 'bg-[#FF9E00]' : 'bg-[#251515]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full transition-transform ${
                inStockOnly ? 'translate-x-5 bg-[#0D0606]' : 'translate-x-0 bg-[#B8B0B0]'
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
        <div className="sticky top-28 max-h-[calc(100vh-8.5rem)] overflow-y-auto no-scrollbar bg-[#140B0B] border border-[#F8F6F6]/10 rounded-2xl p-5 shadow-2xl">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-[#0D0606]/80 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-[#140B0B] border-l border-[#F8F6F6]/10 p-5 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F8F6F6]/10">
                <span className="font-giliran font-bold text-[#F8F6F6] text-lg">Filters & Sort</span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#B8B0B0] hover:text-[#F8F6F6] hover:bg-[#201313]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-[#FF9E00] hover:bg-[#FFAE26] text-[#0D0606] font-bold rounded-xl text-center shadow-lg transition-colors cursor-pointer"
            >
              Apply Selection
            </button>
          </div>
        </div>
      )}
    </>
  );
}
