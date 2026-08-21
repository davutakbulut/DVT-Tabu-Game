import { create } from 'zustand';

interface UserStoreState {
  guestName: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
  hasCompletedOnboarding: boolean;
  totalGamesPlayed: number;
  isProUser: boolean;
  
  // Actions
  setGuestName: (name: string) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setOnboardingCompleted: (completed: boolean) => void;
  incrementGamesPlayed: () => number;
  setIsProUser: (isPro: boolean) => void;
}

export const useUserStore = create<UserStoreState>((set, get) => {
  // Read initial values from localStorage if in browser
  const isClient = typeof window !== 'undefined';
  const savedOnboarding = isClient ? localStorage.getItem('dvt_onboarding_completed') === 'true' : false;
  const savedGamesCount = isClient ? parseInt(localStorage.getItem('dvt_total_games_played') || '0', 10) : 0;
  const savedIsPro = isClient ? localStorage.getItem('dvt_is_pro_user') === 'true' : false;

  return {
    guestName: 'Tabucu',
    soundEnabled: true,
    vibrationEnabled: true,
    theme: 'dark',
    hasCompletedOnboarding: savedOnboarding,
    totalGamesPlayed: savedGamesCount,
    isProUser: savedIsPro,

    setGuestName: (name) => set({ guestName: name }),
    toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
    toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
    setTheme: (theme) => set({ theme }),
    
    setOnboardingCompleted: (completed) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_onboarding_completed', completed ? 'true' : 'false');
      }
      set({ hasCompletedOnboarding: completed });
    },

    incrementGamesPlayed: () => {
      const nextCount = get().totalGamesPlayed + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_total_games_played', nextCount.toString());
      }
      set({ totalGamesPlayed: nextCount });
      return nextCount;
    },

    setIsProUser: (isPro) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_is_pro_user', isPro ? 'true' : 'false');
      }
      set({ isProUser: isPro });
    }
  };
});
