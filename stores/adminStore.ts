import { create } from 'zustand';

interface AdminStoreState {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const ADMIN_PINS = ['15789', 'admin2026', 'Akblt_15789'];
const STORAGE_KEY = 'dvt_admin_auth_token';

export const useAdminStore = create<AdminStoreState>((set) => ({
  isAuthenticated: typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) === 'true' : false,

  login: (pin: string) => {
    if (ADMIN_PINS.includes(pin.trim())) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      }
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    set({ isAuthenticated: false });
  },
}));
