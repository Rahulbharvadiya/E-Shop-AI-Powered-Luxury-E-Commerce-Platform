import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('eshop_cart') || '[]'),
  totalItems: 0,
  subtotal: 0,
  isCartOpen: false,

  recomputeTotals: () => {
    const items = get().items;
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    localStorage.setItem('eshop_cart', JSON.stringify(items));
    set({ totalItems, subtotal });
  },

  fetchCart: async () => {
    const token = localStorage.getItem('eshop_token');
    if (!token) {
      get().recomputeTotals();
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        set({
          items: data.data.items || [],
          totalItems: data.data.totalItems || 0,
          subtotal: data.data.subtotal || 0
        });
        localStorage.setItem('eshop_cart', JSON.stringify(data.data.items || []));
      }
    } catch (e) {
      get().recomputeTotals();
    }
  },

  addToCart: async (product, quantity = 1) => {
    const token = localStorage.getItem('eshop_token');
    const items = [...get().items];
    const index = items.findIndex(i => (i.productId || i._id) === (product._id || product.productId));

    if (index > -1) {
      items[index].quantity = Math.min(10, items[index].quantity + quantity);
    } else {
      items.push({
        productId: product._id || product.productId,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || product.image || '',
        price: product.discountedPrice || product.price,
        originalPrice: product.originalPrice,
        discountPercent: product.discountPercent,
        quantity: quantity
      });
    }

    set({ items });
    get().recomputeTotals();

    // Sync with backend if logged in
    if (token) {
      try {
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product._id || product.productId, quantity })
        });
      } catch (e) {}
    }
  },

  updateQuantity: async (productId, quantity) => {
    const token = localStorage.getItem('eshop_token');
    let items = [...get().items];

    if (quantity <= 0) {
      items = items.filter(i => (i.productId || i._id) !== productId);
    } else {
      const item = items.find(i => (i.productId || i._id) === productId);
      if (item) item.quantity = Math.min(10, quantity);
    }

    set({ items });
    get().recomputeTotals();

    if (token) {
      try {
        await fetch(`/api/cart/item/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
      } catch (e) {}
    }
  },

  removeItem: async (productId) => {
    get().updateQuantity(productId, 0);
  },

  clearCart: () => {
    set({ items: [], totalItems: 0, subtotal: 0 });
    localStorage.removeItem('eshop_cart');
  },

  toggleCartDrawer: (open) => {
    set({ isCartOpen: open !== undefined ? open : !get().isCartOpen });
  }
}));
