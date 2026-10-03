import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  wishlistIds: JSON.parse(localStorage.getItem('eshop_wishlist') || '[]'),

  fetchWishlist: async () => {
    const token = localStorage.getItem('eshop_token');
    if (!token) return;

    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const ids = data.data.map(p => p._id || p);
        set({ wishlistIds: ids });
        localStorage.setItem('eshop_wishlist', JSON.stringify(ids));
      }
    } catch (e) {}
  },

  toggleWishlist: async (productId) => {
    const current = [...get().wishlistIds];
    const index = current.indexOf(productId);
    let added = false;

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(productId);
      added = true;
    }

    set({ wishlistIds: current });
    localStorage.setItem('eshop_wishlist', JSON.stringify(current));

    const token = localStorage.getItem('eshop_token');
    if (token) {
      try {
        await fetch('/api/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
      } catch (e) {}
    }

    return added;
  },

  isWishlisted: (productId) => {
    return get().wishlistIds.includes(productId);
  }
}));
