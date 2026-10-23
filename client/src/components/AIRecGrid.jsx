import React, { useState, useEffect } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import ProductCard from './ProductCard';

export default function AIRecGrid({ onOpenDetail }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/recommendations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setRecommendations(data.data.slice(0, 12)); // exactly 12 items for 3x4 grid
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 mt-16 mb-20 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E7DFD2]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-ai">
              <Bot className="w-3.5 h-3.5 text-[#1E3A34]" />
              <span className="font-semibold">Personalized Affinity Engine</span>
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1E3A34] font-serif tracking-tight section-title-accent">
            AI-Recommended Curations
          </h3>
          <p className="text-xs sm:text-sm text-[#6B665E] mt-1 font-sans">
            12 hand-selected items matched to trending shopper affinity and verified buyer satisfaction
          </p>
        </div>
      </div>

      {/* Grid (responsive 1/2/3/4 columns) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[450px] rounded-[6px] skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {recommendations.map((prod) => (
            <ProductCard
              key={prod._id}
              product={prod}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
}
