import { create } from 'zustand';

export interface UserStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalCorrectWords: number;
  totalTaboosHit: number;
  totalPassesUsed: number;
}

interface UserStoreState {
  userId: string;
  guestName: string;
  userEmail: string | null;
  userAvatar: string | null;
  provider: 'guest' | 'google' | 'apple';
  isLoggedIn: boolean;
  isProUser: boolean;
  isHydrated: boolean;

  // Preferences (synced to Supabase)
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
  hasCompletedOnboarding: boolean;
  turnDuration: number;
  passLimit: number;
  favoriteCategories: string[];

  // Career Stats (synced to Supabase)
  stats: UserStats;
  totalGamesPlayed: number;

  // Actions
  initializeUser: () => Promise<void>;
  setGuestName: (name: string) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setOnboardingCompleted: (completed: boolean) => void;
  incrementGamesPlayed: () => number;
  setIsProUser: (isPro: boolean) => void;
  updateSettings: (settings: Partial<{ turnDuration: number; passLimit: number; favoriteCategories: string[] }>) => void;
  recordGameResult: (correct: number, taboos: number, passes: number, won: boolean) => void;
  loginWithSocial: (provider: 'google' | 'apple', email: string, name: string, avatarUrl?: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
}

const generateGuestId = (): string => {
  return 'gst_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
};

const getOrCreateUserId = (): string => {
  if (typeof window === 'undefined') return 'server_user';
  let id = localStorage.getItem('dvt_user_id');
  if (!id) {
    id = generateGuestId();
    localStorage.setItem('dvt_user_id', id);
  }
  return id;
};

export const useUserStore = create<UserStoreState>((set, get) => {
  const isClient = typeof window !== 'undefined';
  const savedUserId = isClient ? getOrCreateUserId() : 'temp_user';
  const savedName = isClient ? localStorage.getItem('dvt_display_name') || 'Usta Tabucu' : 'Usta Tabucu';
  const savedEmail = isClient ? localStorage.getItem('dvt_user_email') : null;
  const savedAvatar = isClient ? localStorage.getItem('dvt_user_avatar') : null;
  const savedProvider = isClient ? (localStorage.getItem('dvt_user_provider') as any) || 'guest' : 'guest';
  const savedIsPro = isClient ? localStorage.getItem('dvt_is_pro_user') === 'true' : false;
  const savedOnboarding = isClient ? localStorage.getItem('dvt_onboarding_completed') === 'true' : false;
  const savedGamesCount = isClient ? parseInt(localStorage.getItem('dvt_total_games_played') || '0', 10) : 0;
  const savedWins = isClient ? parseInt(localStorage.getItem('dvt_total_wins') || '0', 10) : 0;
  const savedCorrect = isClient ? parseInt(localStorage.getItem('dvt_total_correct') || '0', 10) : 0;
  const savedTaboos = isClient ? parseInt(localStorage.getItem('dvt_total_taboos') || '0', 10) : 0;
  const savedPasses = isClient ? parseInt(localStorage.getItem('dvt_total_passes') || '0', 10) : 0;

  const initialStats: UserStats = {
    totalGamesPlayed: savedGamesCount,
    totalWins: savedWins,
    totalCorrectWords: savedCorrect,
    totalTaboosHit: savedTaboos,
    totalPassesUsed: savedPasses,
  };

  return {
    userId: savedUserId,
    guestName: savedName,
    userEmail: savedEmail,
    userAvatar: savedAvatar,
    provider: savedProvider,
    isLoggedIn: savedProvider !== 'guest',
    isProUser: savedIsPro,
    isHydrated: false,

    soundEnabled: true,
    vibrationEnabled: true,
    theme: 'dark',
    hasCompletedOnboarding: savedOnboarding,
    turnDuration: 60,
    passLimit: 3,
    favoriteCategories: ['Genel Kültür', 'Sinema & Dizi'],

    stats: initialStats,
    totalGamesPlayed: savedGamesCount,

    initializeUser: async () => {
      const state = get();
      if (typeof window === 'undefined') return;

      try {
        // 1. Fetch live cloud profile & settings from Supabase
        const res = await fetch(`/api/user/profile?userId=${state.userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            set({
              guestName: data.profile.display_name || state.guestName,
              userEmail: data.profile.email || state.userEmail,
              userAvatar: data.profile.avatar_url || state.userAvatar,
              provider: data.profile.provider || state.provider,
              isLoggedIn: data.profile.provider !== 'guest',
              isProUser: Boolean(data.profile.is_pro),
            });
          }
          if (data.settings) {
            set({
              turnDuration: data.settings.turn_duration || state.turnDuration,
              passLimit: data.settings.pass_limit ?? state.passLimit,
              soundEnabled: data.settings.sound_enabled ?? state.soundEnabled,
              vibrationEnabled: data.settings.haptic_enabled ?? state.vibrationEnabled,
              favoriteCategories: data.settings.favorite_categories || state.favoriteCategories,
            });
          }
          if (data.stats) {
            const cloudStats: UserStats = {
              totalGamesPlayed: data.stats.total_games_played || 0,
              totalWins: data.stats.total_wins || 0,
              totalCorrectWords: data.stats.total_correct_words || 0,
              totalTaboosHit: data.stats.total_taboos_hit || 0,
              totalPassesUsed: data.stats.total_passes_used || 0,
            };
            set({
              stats: cloudStats,
              totalGamesPlayed: cloudStats.totalGamesPlayed,
            });
          }
        } else {
          // If not in Supabase yet, create the guest in cloud immediately
          await state.syncWithCloud();
        }
      } catch {
        // Fallback to local
      } finally {
        set({ isHydrated: true });
      }
    },

    setGuestName: (name) => {
      if (typeof window !== 'undefined') localStorage.setItem('dvt_display_name', name);
      set({ guestName: name });
      get().syncWithCloud();
    },

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
      const updatedStats = { ...get().stats, totalGamesPlayed: nextCount };
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_total_games_played', nextCount.toString());
      }
      set({ totalGamesPlayed: nextCount, stats: updatedStats });
      get().syncWithCloud();
      return nextCount;
    },

    setIsProUser: (isPro) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_is_pro_user', isPro ? 'true' : 'false');
      }
      set({ isProUser: isPro });
      get().syncWithCloud();
    },

    updateSettings: (newSettings) => {
      set((s) => ({
        turnDuration: newSettings.turnDuration ?? s.turnDuration,
        passLimit: newSettings.passLimit ?? s.passLimit,
        favoriteCategories: newSettings.favoriteCategories ?? s.favoriteCategories,
      }));
      get().syncWithCloud();
    },

    recordGameResult: (correct, taboos, passes, won) => {
      const s = get().stats;
      const updatedStats: UserStats = {
        totalGamesPlayed: s.totalGamesPlayed + 1,
        totalWins: s.totalWins + (won ? 1 : 0),
        totalCorrectWords: s.totalCorrectWords + correct,
        totalTaboosHit: s.totalTaboosHit + taboos,
        totalPassesUsed: s.totalPassesUsed + passes,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_total_games_played', updatedStats.totalGamesPlayed.toString());
        localStorage.setItem('dvt_total_wins', updatedStats.totalWins.toString());
        localStorage.setItem('dvt_total_correct', updatedStats.totalCorrectWords.toString());
        localStorage.setItem('dvt_total_taboos', updatedStats.totalTaboosHit.toString());
        localStorage.setItem('dvt_total_passes', updatedStats.totalPassesUsed.toString());
      }

      set({ stats: updatedStats, totalGamesPlayed: updatedStats.totalGamesPlayed });
      get().syncWithCloud();
    },

    loginWithSocial: async (provider, email, name, avatarUrl) => {
      const state = get();

      try {
        // Upgrade existing guest profile in Supabase to keep all stats and settings
        const res = await fetch('/api/user/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: state.userId,
            provider,
            email,
            displayName: name,
            avatarUrl,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.profile) {
            set({
              provider: json.profile.provider,
              isLoggedIn: true,
              userEmail: json.profile.email,
              guestName: json.profile.display_name,
              userAvatar: json.profile.avatar_url,
            });
          }
        }
      } catch {
        // Fallback local update
        set({
          provider,
          isLoggedIn: true,
          userEmail: email,
          guestName: name,
          userAvatar: avatarUrl || null,
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_user_email', email);
        localStorage.setItem('dvt_user_provider', provider);
        localStorage.setItem('dvt_display_name', name);
        if (avatarUrl) localStorage.setItem('dvt_user_avatar', avatarUrl);
      }
    },

    logoutUser: async () => {
      const newGuestId = generateGuestId();
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_user_id', newGuestId);
        localStorage.removeItem('dvt_user_email');
        localStorage.removeItem('dvt_user_avatar');
        localStorage.setItem('dvt_user_provider', 'guest');
        localStorage.setItem('dvt_display_name', 'Misafir Tabucu');
        localStorage.setItem('dvt_total_games_played', '0');
        localStorage.setItem('dvt_total_wins', '0');
        localStorage.setItem('dvt_total_correct', '0');
        localStorage.setItem('dvt_total_taboos', '0');
        localStorage.setItem('dvt_total_passes', '0');
      }

      const freshStats: UserStats = {
        totalGamesPlayed: 0,
        totalWins: 0,
        totalCorrectWords: 0,
        totalTaboosHit: 0,
        totalPassesUsed: 0,
      };

      set({
        userId: newGuestId,
        provider: 'guest',
        isLoggedIn: false,
        userEmail: null,
        userAvatar: null,
        guestName: 'Misafir Tabucu',
        stats: freshStats,
        totalGamesPlayed: 0,
      });

      // Create new fresh guest record in Supabase
      await get().syncWithCloud();
    },

    syncWithCloud: async () => {
      const state = get();
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: state.userId,
            displayName: state.guestName,
            email: state.userEmail,
            avatarUrl: state.userAvatar,
            provider: state.provider,
            isPro: state.isProUser,
            settings: {
              turnDuration: state.turnDuration,
              passLimit: state.passLimit,
              soundEnabled: state.soundEnabled,
              hapticEnabled: state.vibrationEnabled,
              favoriteCategories: state.favoriteCategories,
            },
            stats: state.stats,
          }),
        });
      } catch {}
    },
  };
});
