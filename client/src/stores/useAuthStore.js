import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('eshop_user') || 'null'),
  token: localStorage.getItem('eshop_token') || null,
  isAuthenticated: !!localStorage.getItem('eshop_token'),
  isAuthModalOpen: false,
  authModalMode: 'login', // 'login' | 'register' | 'forgot'

  setAuth: (user, token) => {
    localStorage.setItem('eshop_user', JSON.stringify(user));
    localStorage.setItem('eshop_token', token);
    set({ user, token, isAuthenticated: true, isAuthModalOpen: false });
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('eshop_user');
    localStorage.removeItem('eshop_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('eshop_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  openAuthModal: (mode = 'login') => {
    set({ isAuthModalOpen: true, authModalMode: mode });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false });
  }
}));
