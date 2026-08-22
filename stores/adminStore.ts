import { create } from 'zustand';

interface AdminStoreState {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  updatePin: (newPin: string) => boolean;
  getCurrentPin: () => string;
}

const DEFAULT_PINS = ['12345', '15789', 'admin2026', 'Akblt_15789'];
const STORAGE_KEY = 'dvt_admin_auth_token';
const CUSTOM_PIN_KEY = 'dvt_custom_admin_pin';

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  isAuthenticated: typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) === 'true' : false,

  getCurrentPin: () => {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem(CUSTOM_PIN_KEY);
      if (custom) return custom;
    }
    return DEFAULT_PINS[0];
  },

  login: (pin: string) => {
    const trimmed = pin.trim();
    const customPin = typeof window !== 'undefined' ? localStorage.getItem(CUSTOM_PIN_KEY) : null;
    const validPins = customPin ? [customPin, ...DEFAULT_PINS] : DEFAULT_PINS;

    if (validPins.includes(trimmed)) {
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

  updatePin: (newPin: string) => {
    const trimmed = newPin.trim();
    if (!trimmed || trimmed.length < 4) return false;

    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_PIN_KEY, trimmed);
    }
    return true;
  },
}));
