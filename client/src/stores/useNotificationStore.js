import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isDrawerOpen: false,

  fetchNotifications: async () => {
    const token = localStorage.getItem('eshop_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch('/api/notifications', { headers });
      const data = await res.json();
      if (data.success && data.data) {
        set({
          notifications: data.data,
          unreadCount: data.data.length
        });
      }
    } catch (e) {}
  },

  dismissNotification: async (id) => {
    // Optimistic UI update
    const filtered = get().notifications.filter(n => n._id !== id);
    set({ notifications: filtered, unreadCount: filtered.length });

    const token = localStorage.getItem('eshop_token');
    if (token) {
      try {
        await fetch(`/api/notifications/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }
  },

  toggleDrawer: (open) => {
    set({ isDrawerOpen: open !== undefined ? open : !get().isDrawerOpen });
  }
}));
