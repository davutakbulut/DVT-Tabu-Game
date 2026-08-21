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
  User
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { analytics } from '@/lib/analytics';
import { Card } from '@/types/game';

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

  const handleStartSingleDevice = () => {
    setIsGameSetupOpen(true);
  };

  const handleApplyAiMode = (mode: any) => {
    updateSettings({
      turn_duration: mode.recommended_duration_seconds,
      pass_limit: mode.recommended_pass_limit || 2,
    });
    soundManager.play('correct');
  };

  const handleAddAiCards = (cards: Card[]) => {
    setCustomCards((prev) => [...prev, ...cards]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-lg mx-auto w-full">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl">
            T
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-tight">
              DVT TABU
            </h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">
              Kelime Arenası
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Profile Avatar */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-200 transition-all relative"
            title="Profil & Kariyer"
          >
            {isMounted && userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-6 h-6 rounded-xl object-cover" />
            ) : (
              <div 
                suppressHydrationWarning
                className="w-6 h-6 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center"
              >
                {isMounted ? (guestName?.charAt(0)?.toUpperCase() || 'M') : 'M'}
              </div>
            )}
            <span suppressHydrationWarning className="text-xs font-black truncate max-w-[70px]">
              {isMounted ? guestName : 'Misafir'}
            </span>
            {isMounted && isProUser && (
              <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </button>

          <button
            onClick={handleSoundToggle}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setIsGameSetupOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Oyun Ayarları & Kurulum"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </header>

      {/* Hero / Main Section */}
      <div className="flex-1 flex flex-col justify-center gap-4 my-3">
        {/* Active Ongoing Game Recovery Banner */}
        <ActiveGameBanner />

        {/* Gemini AI Daily Insights Banner */}
        <AiDailyBanner
          currentSettings={settings}
          onApplyMode={handleApplyAiMode}
          onAddBonusCard={(card) => setCustomCards((prev) => [...prev, card])}
        />

        {/* Player Name / Quick Auth Action */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Oyuncu:</span>
            <input
              type="text"
              suppressHydrationWarning
              value={isMounted ? guestName : ''}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Takma Adın..."
              className="bg-transparent text-sm font-extrabold text-white flex-1 focus:outline-none placeholder-slate-600 truncate"
              maxLength={18}
            />
          </div>

          {!isLoggedIn ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 py-1.5 px-3 rounded-xl border border-indigo-500/20 flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" /> Giriş Yap
            </button>
          ) : (
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 py-1 px-2 rounded-lg border border-emerald-500/20 shrink-0"
            >
              ✓ Bağlı
            </button>
          )}
        </div>

        {/* Game Mode Actions */}
        <div className="flex flex-col gap-3">
          {/* Game Start Mode */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsGameSetupOpen(true)}
            fullWidth
            className="py-4 font-black tracking-wide text-base bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-95 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <Play className="w-5 h-5 fill-current" />
            Oyun Başlat
            <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full ml-1">
              Özelleştirilebilir
            </span>
          </Button>

          {/* Online Multiplayer Lobby */}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.push('/rooms')}
            fullWidth
            className="py-4 font-black text-sm flex items-center justify-center gap-2 border-indigo-500/30 hover:border-indigo-500/60"
          >
            <Users className="w-5 h-5 text-indigo-400" />
            Çok Oyunculu Odalar (Online)
            <span className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              Canlı
            </span>
          </Button>

          {/* AI Deck Generator */}
          <Button
            variant="ghost"
            size="md"
            onClick={() => setIsDeckModalOpen(true)}
            fullWidth
            className="py-3 font-bold text-xs flex items-center justify-center gap-2 border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 text-purple-200"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Gemini AI ile Özel Deste Üret
            {customCards.length > 0 && (
              <span className="bg-purple-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                +{customCards.length} Kart
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="flex items-center justify-between text-[11px] text-slate-500 py-2 border-t border-slate-900">
        <button
          onClick={() => setIsChangelogOpen(true)}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors font-bold bg-indigo-500/10 py-1 px-2.5 rounded-lg border border-indigo-500/20"
        >
          <History className="w-3.5 h-3.5" /> Sürüm v1.1.0 (Yenilikler)
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="hover:text-slate-300 transition-colors"
          >
            Nasıl Oynanır?
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
            title="Yönetici Paneli"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Yönetici
          </button>
        </div>
      </footer>

      {/* Modals & Wizards */}
      <GameSetupModal
        isOpen={isGameSetupOpen}
        onClose={() => setIsGameSetupOpen(false)}
      />

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenRules={() => setIsGameSetupOpen(true)}
        onOpenPaywall={() => setIsPaywallOpen(true)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartGame={handleStartSingleDevice}
      />

      <RuleSettingsModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        initialSettings={settings}
        onSave={(newSet) => updateSettings(newSet)}
      />

      <DeckGeneratorModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        onAddCards={handleAddAiCards}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        triggerSource="manual_upgrade"
      />

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </div>
  );
}
