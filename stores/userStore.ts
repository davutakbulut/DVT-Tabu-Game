import { create } from 'zustand';

interface UserStoreState {
  guestName: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
  
  // Actions
  setGuestName: (name: string) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  guestName: 'Tabucu',
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',

  setGuestName: (name) => set({ guestName: name }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
  setTheme: (theme) => set({ theme }),
}));
