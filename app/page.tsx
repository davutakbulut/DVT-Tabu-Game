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
  Radio,
  Gamepad2,
  ChevronRight,
  Star,
  Clock,
  RotateCcw,
  Check
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { analytics } from '@/lib/analytics';
import { Card } from '@/types/game';
import { motion } from 'framer-motion';

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
    userEmail, 
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

  const [isCharging, setIsCharging] = useState(false);

  const handleLaunchGameSetup = () => {
    soundManager.play('start');
    setIsGameSetupOpen(true);
  };

  const handleApplyAiMode = (mode: any) => {
    updateSettings({
      turn_duration: mode.recommended_duration_seconds,
      pass_limit: mode.recommended_pass_limit || 2,
    });
    soundManager.play('correct');
  };

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto w-full select-none justify-between gap-4">
      {/* 1. TOP HEADER BAR */}
      <header className="flex items-center justify-between py-1 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 text-slate-950 font-black text-xl border border-amber-300/40">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">
                DVT TABU
              </h1>
              <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase tracking-wider shadow-sm">
                2026
              </span>
            </div>
            <span className="text-[10px] text-amber-400/90 font-black uppercase tracking-widest block">
              Masa Arenası
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* User Profile Pill */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl btn-3d-dark text-slate-200"
            title="Profil & Kariyer"
          >
            {isMounted && userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-5 h-5 rounded-lg object-cover" />
            ) : (
              <div 
                suppressHydrationWarning
                className="w-5 h-5 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0"
              >
                {guestName ? guestName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span suppressHydrationWarning className="text-[11px] font-black truncate max-w-[80px]">
              {guestName || 'Usta Tabucu'}
            </span>
            {isProUser && (
              <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-2 rounded-xl btn-3d-dark text-slate-300 hover:text-white"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Settings / Rules Modal Trigger */}
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="p-2 rounded-xl btn-3d-dark text-slate-300 hover:text-white"
            title="Kurallar & Ayarlar"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT STAGE (Balanced & Filling Space Beautifully) */}
      <main className="flex-1 flex flex-col gap-3.5 my-auto justify-center">
        {/* Active Ongoing Game Recovery Banner */}
        <ActiveGameBanner />

        {/* HERO ARENA CARD: OYUN BAŞLAT (Centerpiece of the Screen) */}
        <div className="p-5 rounded-2xl card-arcade flex flex-col gap-4 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl">
          {/* Hero Decorative Header */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black py-1 px-3 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>DİJİTAL PARTİ & TABU ARENASI</span>
            </div>

            <span className="text-[10px] font-black text-slate-400 font-mono">
              {teams.length} Takım Hazır
            </span>
          </div>

          {/* Welcome Text */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Yasakları Aş, Takımını <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 inline-flex items-center gap-1.5">
                Zirveye Taşı! <Trophy className="w-5 h-5 text-amber-400 inline-block" />
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
              Arkadaşlarınla tek cihazda toplanın veya online odalarda kapışın!
            </p>
          </div>

          {/* Player Name Strip */}
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-1.5 px-2 flex-1 min-w-0">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">Oyuncu:</span>
              <input
                type="text"
                suppressHydrationWarning
                value={isMounted ? guestName : ''}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Takma Adın..."
                className="bg-transparent text-xs font-black text-white flex-1 focus:outline-none placeholder-slate-600 truncate min-w-0"
                maxLength={18}
              />
              <button
                type="button"
                onClick={handleRandomizeName}
                className="p-1 text-slate-400 hover:text-amber-300 shrink-0"
                title="Zar At (Rastgele İsim)"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>

            {isMounted && isLoggedIn ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 py-1.5 px-2.5 rounded-lg border border-emerald-500/30 shrink-0 inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                title="Profili Yönet / Çıkış Yap"
              >
                <Check className="w-3 h-3" /> {userEmail ? userEmail.split('@')[0] : 'Profilim'}
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[10px] font-black text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 py-1.5 px-3 rounded-lg border border-amber-500/30 flex items-center gap-1 shrink-0 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Giriş Yap
              </button>
            )}
          </div>

          {/* GIANT 3D TACTILE CTA: OYUN BAŞLAT (Centered with Bar Fill Animation) */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleLaunchGameSetup}
              disabled={isCharging}
              className="w-full py-4 rounded-xl btn-3d-emerald text-white font-black text-lg sm:text-xl tracking-wider flex items-center justify-center gap-2.5 shadow-xl relative overflow-hidden select-none active:scale-[0.99] transition-transform"
            >
              {/* Charging / Filling Animation Bar */}
              {isCharging && (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-white/35 backdrop-blur-sm pointer-events-none z-0"
                />
              )}

              <Play className={`w-6 h-6 fill-white drop-shadow-md relative z-10 transition-transform ${isCharging ? 'scale-125' : ''}`} />
              <span className="relative z-10">{isCharging ? 'HAZIRLANIYOR...' : 'OYUNU BAŞLAT'}</span>
            </button>

            {/* Bottom Summary Indicators (Including Team Count) */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-extrabold text-slate-400">
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> {teams.length} Takım
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> {settings.turn_duration}s</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><RotateCcw className="w-3 h-3 text-amber-400" /> {settings.pass_limit >= 99 ? '∞' : settings.pass_limit} Pas</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><Trophy className="w-3 h-3 text-orange-400" /> {settings.total_rounds} Tur</span>
            </div>
          </div>
        </div>

        {/* 3. BENTO GRID: Multiplayer & AI Studio */}
        <div className="grid grid-cols-2 gap-3">
          {/* Online Multiplayer Card */}
          <button
            onClick={() => router.push('/rooms')}
            className="p-4 rounded-2xl card-arcade flex flex-col justify-between gap-3 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md animate-pulse">
                Canlı
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1">
                Çok Oyunculu <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Arkadaşlarınla online odalarda yarış</p>
            </div>
          </button>

          {/* Gemini AI Deck Studio Card */}
          <button
            onClick={() => setIsDeckModalOpen(true)}
            className="p-4 rounded-2xl card-arcade flex flex-col justify-between gap-3 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <Sparkles className="w-5 h-5" />
              </div>
              {customCards.length > 0 ? (
                <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                  +{customCards.length} Kart
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  AI Stüdyo
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1">
                Özel Deste Üret <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Yapay zeka ile kendi desteni yarat</p>
            </div>
          </button>
        </div>

        {/* 4. Gemini AI Daily Insights Bulletin */}
        <AiDailyBanner
          currentSettings={settings}
          onApplyMode={handleApplyAiMode}
          onAddBonusCard={(card) => setCustomCards((prev) => [...prev, card])}
        />
      </main>

      {/* 5. BOTTOM NAVIGATION BAR */}
      <footer className="flex items-center justify-between py-2 border-t border-slate-800 text-xs shrink-0">
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
          <HelpCircle className="w-4 h-4 text-amber-400" />
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
