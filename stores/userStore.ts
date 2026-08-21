import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  provider: 'guest' | 'google' | 'apple' | 'facebook';
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
  loginWithSocial: (provider: 'google' | 'apple' | 'facebook', email: string, name: string, avatarUrl?: string) => Promise<void>;
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
  const savedIsLoggedIn = isClient ? localStorage.getItem('dvt_is_logged_in') === 'true' : false;
  const savedIsPro = isClient ? localStorage.getItem('dvt_is_pro_user') === 'true' : false;
  const savedOnboarding = isClient ? localStorage.getItem('dvt_onboarding_completed') === 'true' : false;

  const savedTurnDuration = isClient ? parseInt(localStorage.getItem('dvt_pref_turn_duration') || '60', 10) : 60;
  const savedPassLimit = isClient ? parseInt(localStorage.getItem('dvt_pref_pass_limit') || '3', 10) : 3;

  const initialStats: UserStats = {
    totalGamesPlayed: isClient ? parseInt(localStorage.getItem('dvt_total_games_played') || '0', 10) : 0,
    totalWins: isClient ? parseInt(localStorage.getItem('dvt_total_wins') || '0', 10) : 0,
    totalCorrectWords: isClient ? parseInt(localStorage.getItem('dvt_total_correct') || '0', 10) : 0,
    totalTaboosHit: isClient ? parseInt(localStorage.getItem('dvt_total_taboos') || '0', 10) : 0,
    totalPassesUsed: isClient ? parseInt(localStorage.getItem('dvt_total_passes') || '0', 10) : 0,
  };

  return {
    userId: savedUserId,
    guestName: savedName,
    userEmail: savedEmail,
    userAvatar: savedAvatar,
    provider: savedProvider,
    isLoggedIn: savedIsLoggedIn,
    isProUser: savedIsPro,
    isHydrated: false,

    soundEnabled: true,
    vibrationEnabled: true,
    theme: 'dark',
    hasCompletedOnboarding: savedOnboarding,
    turnDuration: savedTurnDuration,
    passLimit: savedPassLimit,
    favoriteCategories: ['Genel Kültür'],

    stats: initialStats,
    totalGamesPlayed: initialStats.totalGamesPlayed,

    initializeUser: async () => {
      const state = get();
      if (!isClient) return;

      try {
        const res = await fetch(`/api/user/profile?userId=${encodeURIComponent(state.userId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.profile) {
            const p = json.profile;
            const settings = json.settings || {};
            const stats = json.stats || {};

            set({
              guestName: p.display_name || state.guestName,
              userEmail: p.email || state.userEmail,
              userAvatar: p.avatar_url || state.userAvatar,
              provider: p.provider || state.provider,
              isLoggedIn: p.provider !== 'guest',
              isProUser: p.is_pro ?? state.isProUser,
              turnDuration: settings.turn_duration ?? state.turnDuration,
              passLimit: settings.pass_limit ?? state.passLimit,
              soundEnabled: settings.sound_enabled ?? state.soundEnabled,
              vibrationEnabled: settings.vibration_enabled ?? state.vibrationEnabled,
              stats: {
                totalGamesPlayed: stats.total_games_played ?? state.stats.totalGamesPlayed,
                totalWins: stats.total_wins ?? state.stats.totalWins,
                totalCorrectWords: stats.total_correct_words ?? state.stats.totalCorrectWords,
                totalTaboosHit: stats.total_taboos_hit ?? state.stats.totalTaboosHit,
                totalPassesUsed: stats.total_passes_used ?? state.stats.totalPassesUsed,
              },
              totalGamesPlayed: stats.total_games_played ?? state.totalGamesPlayed,
              isHydrated: true,
            });

            localStorage.setItem('dvt_display_name', p.display_name || state.guestName);
            localStorage.setItem('dvt_user_provider', p.provider || 'guest');
            localStorage.setItem('dvt_is_logged_in', p.provider !== 'guest' ? 'true' : 'false');
            return;
          }
        }
      } catch {
        // Fallback to local
      }

      set({ isHydrated: true });
    },

    setGuestName: (name: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_display_name', name);
      }
      set({ guestName: name });
      get().syncWithCloud();
    },

    toggleSound: () => {
      set((s) => ({ soundEnabled: !s.soundEnabled }));
      get().syncWithCloud();
    },

    toggleVibration: () => {
      set((s) => ({ vibrationEnabled: !s.vibrationEnabled }));
      get().syncWithCloud();
    },

    setTheme: (theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_theme', theme);
      }
      set({ theme });
    },

    setOnboardingCompleted: (completed) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_onboarding_completed', completed ? 'true' : 'false');
      }
      set({ hasCompletedOnboarding: completed });
    },

    incrementGamesPlayed: () => {
      const next = get().totalGamesPlayed + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_total_games_played', next.toString());
      }
      set((s) => ({
        totalGamesPlayed: next,
        stats: { ...s.stats, totalGamesPlayed: next },
      }));
      get().syncWithCloud();
      return next;
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
              guestName: json.profile.display_name || name,
              userAvatar: json.profile.avatar_url || avatarUrl || null,
            });

            if (typeof window !== 'undefined') {
              localStorage.setItem('dvt_user_provider', provider);
              localStorage.setItem('dvt_is_logged_in', 'true');
              localStorage.setItem('dvt_user_email', email);
              localStorage.setItem('dvt_display_name', name);
              if (avatarUrl) localStorage.setItem('dvt_user_avatar', avatarUrl);
            }
            return;
          }
        }
      } catch {}

      // Fallback local update
      set({
        provider,
        isLoggedIn: true,
        userEmail: email,
        guestName: name,
        userAvatar: avatarUrl || null,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_user_provider', provider);
        localStorage.setItem('dvt_is_logged_in', 'true');
        localStorage.setItem('dvt_user_email', email);
        localStorage.setItem('dvt_display_name', name);
        if (avatarUrl) localStorage.setItem('dvt_user_avatar', avatarUrl);
      }
    },

    logoutUser: async () => {
      const newGuestId = generateGuestId();
      const defaultName = 'Usta Tabucu';

      try {
        if (isSupabaseConfigured()) {
          await supabase.auth.signOut();
        }
      } catch {}

      if (typeof window !== 'undefined') {
        localStorage.setItem('dvt_user_id', newGuestId);
        localStorage.setItem('dvt_display_name', defaultName);
        localStorage.setItem('dvt_user_provider', 'guest');
        localStorage.setItem('dvt_is_logged_in', 'false');
        localStorage.removeItem('dvt_user_email');
        localStorage.removeItem('dvt_user_avatar');
      }

      set({
        userId: newGuestId,
        guestName: defaultName,
        userEmail: null,
        userAvatar: null,
        provider: 'guest',
        isLoggedIn: false,
        stats: {
          totalGamesPlayed: 0,
          totalWins: 0,
          totalCorrectWords: 0,
          totalTaboosHit: 0,
          totalPassesUsed: 0,
        },
        totalGamesPlayed: 0,
      });

      // Sync new fresh guest to Supabase
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: newGuestId,
            displayName: defaultName,
            provider: 'guest',
          }),
        });
      } catch {}
    },

    syncWithCloud: async () => {
      const state = get();
      if (!isClient) return;

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
              turn_duration: state.turnDuration,
              pass_limit: state.passLimit,
              sound_enabled: state.soundEnabled,
              vibration_enabled: state.vibrationEnabled,
              theme: state.theme,
            },
            stats: {
              total_games_played: state.stats.totalGamesPlayed,
              total_wins: state.stats.totalWins,
              total_correct_words: state.stats.totalCorrectWords,
              total_taboos_hit: state.stats.totalTaboosHit,
              total_passes_used: state.stats.totalPassesUsed,
            },
          }),
        });
      } catch {}
    },
  };
});
