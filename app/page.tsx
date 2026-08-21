'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useRoomStore } from '@/stores/roomStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { ActiveGameBanner } from '@/components/game/ActiveGameBanner';
import { AiDailyBanner } from '@/components/ai/AiDailyBanner';
import { DeckGeneratorModal } from '@/components/ai/DeckGeneratorModal';
import { GameSetupModal } from '@/components/game/GameSetupModal';
import { RuleSettingsModal } from '@/components/game/RuleSettingsModal';
import { ChangelogModal } from '@/components/ui/ChangelogModal';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfileDrawer } from '@/components/profile/ProfileDrawer';
import { PaywallModal } from '@/components/monetization/PaywallModal';
import { 
  Play, 
  Users, 
  Sparkles, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Flame, 
  HelpCircle,
  Trophy,
  History,
  Crown,
  ShieldCheck,
  User,
  Dices,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { analytics } from '@/lib/analytics';
import { Card } from '@/types/game';

const RANDOM_NICKNAMES = [
  'UstaTabucu', 'GizemliKaplan', 'KelimeAvcısı', 'HızlıAnlatıcı', 
  'GeceKartalı', 'ZekiPanda', 'FırtınaTabu', 'Şampiyon99'
];

export default function HomePage() {
  const router = useRouter();
  const { initializeGame, teams, settings, updateSettings } = useGameStore();
  const { leaveRoom } = useRoomStore();
  const { 
    guestName, 
    setGuestName, 
    soundEnabled, 
    toggleSound, 
    hasCompletedOnboarding, 
    isProUser, 
    userAvatar, 
    isLoggedIn,
    initializeUser 
  } = useUserStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isGameSetupOpen, setIsGameSetupOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [customCards, setCustomCards] = useState<Card[]>([]);

  useEffect(() => {
    setIsMounted(true);
    analytics.pageView('/');
    initializeUser();
    if (!hasCompletedOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, [hasCompletedOnboarding]);

  const handleSoundToggle = () => {
    toggleSound();
    soundManager.toggleSound();
  };

  const handleRandomizeName = () => {
    const random = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    setGuestName(random);
    soundManager.play('pass');
  };

  const handleApplyAiMode = (mode: any) => {
    updateSettings({
      turn_duration: mode.recommended_duration_seconds,
      pass_limit: mode.recommended_pass_limit || 2,
    });
    soundManager.play('correct');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-lg mx-auto w-full select-none">
      {/* 1. Top Header Bar (Playful Arcade Style) */}
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-2xl border-2 border-white/20">
            T
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-tight flex items-center gap-1.5">
              DVT TABU
              <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                PRO
              </span>
            </h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">
              Kelime Arenası
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Profile Avatar Pill */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-2xl btn-3d-dark text-slate-200 transition-all"
            title="Profil & Kariyer"
          >
            {isMounted && userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-6 h-6 rounded-xl object-cover" />
            ) : (
              <div 
                suppressHydrationWarning
                className="w-6 h-6 rounded-xl bg-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-inner"
              >
                {isMounted ? (guestName?.charAt(0)?.toUpperCase() || 'M') : 'M'}
              </div>
            )}
            <span suppressHydrationWarning className="text-xs font-black truncate max-w-[75px]">
              {isMounted ? guestName : 'Misafir'}
            </span>
            {isMounted && isProUser && (
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-2.5 rounded-2xl btn-3d-dark text-slate-300 hover:text-white"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Settings / Rules Modal Trigger */}
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="p-2.5 rounded-2xl btn-3d-dark text-slate-300 hover:text-white"
            title="Kurallar & Ayarlar"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </header>

      {/* 2. Main Hero Play Arena */}
      <div className="flex-1 flex flex-col justify-center gap-4 my-2">
        {/* Active Ongoing Game Recovery Banner */}
        <ActiveGameBanner />

        {/* Gemini AI Daily Insights Banner */}
        <AiDailyBanner
          currentSettings={settings}
          onApplyMode={handleApplyAiMode}
          onAddBonusCard={(card) => setCustomCards((prev) => [...prev, card])}
        />

        {/* HERO CARD: OYUN BAŞLAT (Giant Tactile Arcade Card) */}
        <div className="p-5 rounded-3xl card-arcade flex flex-col gap-4 relative overflow-hidden">
          {/* Top Pill & Player Name */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-2xl px-3 py-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Oyuncu:</span>
              <input
                type="text"
                suppressHydrationWarning
                value={isMounted ? guestName : ''}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Takma Adın..."
                className="bg-transparent text-xs font-black text-white flex-1 focus:outline-none placeholder-slate-600 truncate"
                maxLength={18}
              />
              <button
                type="button"
                onClick={handleRandomizeName}
                className="p-1 text-slate-400 hover:text-amber-300"
                title="Zar At (Rastgele İsim)"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isLoggedIn ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[11px] font-extrabold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 py-2 px-3 rounded-2xl border border-indigo-500/30 flex items-center gap-1 shrink-0 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Giriş Yap
              </button>
            ) : (
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 py-1.5 px-2.5 rounded-xl border border-emerald-500/20 shrink-0">
                ✓ Bağlı
              </span>
            )}
          </div>

          {/* MAIN CTA: OYUN BAŞLAT (3D Emerald Giant Button) */}
          <button
            onClick={() => setIsGameSetupOpen(true)}
            className="w-full py-4.5 rounded-2xl btn-3d-emerald text-white font-black text-lg sm:text-xl tracking-wide flex items-center justify-center gap-3 shadow-xl"
          >
            <Play className="w-7 h-7 fill-white drop-shadow-md" />
            <span>OYUN BAŞLAT</span>
            <span className="text-[11px] font-extrabold bg-black/20 text-emerald-100 px-2.5 py-1 rounded-xl uppercase tracking-wider">
              {teams.length} Takım
            </span>
          </button>
        </div>

        {/* 3. BENTO GRID: Mode Actions (Multiplayer & AI Studio) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Online Multiplayer Lobby */}
          <button
            onClick={() => router.push('/rooms')}
            className="p-4 rounded-3xl card-arcade flex flex-col justify-between gap-3 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                Canlı
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">Çok Oyunculu</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Arkadaşlarınla online odalarda yarış</p>
            </div>
          </button>

          {/* Gemini AI Deck Generator */}
          <button
            onClick={() => setIsDeckModalOpen(true)}
            className="p-4 rounded-3xl card-arcade flex flex-col justify-between gap-3 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Sparkles className="w-5 h-5" />
              </div>
              {customCards.length > 0 ? (
                <span className="text-[9px] font-black bg-purple-500 text-white px-2 py-0.5 rounded-full">
                  +{customCards.length} Kart
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  AI Stüdyo
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-black text-white">Özel Deste Üret</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Yapay zeka ile kendi temalı desteni yarat</p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Bottom Quick Nav Bar */}
      <footer className="flex items-center justify-between py-3 border-t border-slate-800/80 text-xs">
        <button
          onClick={() => setIsProfileDrawerOpen(true)}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Kariyer & Maçlarım</span>
        </button>

        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>Nasıl Oynanır?</span>
        </button>

        <button
          onClick={() => setIsChangelogOpen(true)}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors"
        >
          <History className="w-4 h-4 text-cyan-400" />
          <span>v1.2.0</span>
        </button>
      </footer>

      {/* Modals & Drawers */}
      <GameSetupModal
        isOpen={isGameSetupOpen}
        onClose={() => setIsGameSetupOpen(false)}
      />

      <RuleSettingsModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        initialSettings={settings}
        onSave={(newSettings) => updateSettings(newSettings)}
      />

      <DeckGeneratorModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        onAddCards={(cards) => setCustomCards((prev) => [...prev, ...cards])}
      />

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenRules={() => setIsRuleModalOpen(true)}
        onOpenPaywall={() => setIsPaywallOpen(true)}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </div>
  );
}
