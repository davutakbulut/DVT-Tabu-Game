'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { 
  Flame, 
  Smartphone, 
  Sparkles, 
  Trophy, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  X, 
  Volume2, 
  Zap, 
  Crown,
  Gamepad2,
  Smile,
  ShieldCheck,
  RotateCcw,
  Layers,
  Sparkle
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { triggerHaptic } from '@/lib/haptics';
import { analytics } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';
import { DEFAULT_ONBOARDING_STEPS, OnboardingStepItem } from '@/types/onboarding';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
}) => {
  const { setOnboardingCompleted, guestName, setGuestName } = useUserStore();
  const [steps, setSteps] = useState<OnboardingStepItem[]>(DEFAULT_ONBOARDING_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [buzzerPressedCount, setBuzzerPressedCount] = useState(0);
  const [buzzerActive, setBuzzerActive] = useState(false);

  // Lock body scroll while full-screen onboarding is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      analytics.onboardingStart();
      fetchSteps();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchSteps = async () => {
    try {
      const res = await fetch('/api/config/onboarding');
      if (res.ok) {
        const json = await res.json();
        if (json.steps && json.steps.length > 0) {
          setSteps(json.steps);
        }
      }
    } catch {}
  };

  const handleNext = () => {
    soundManager.play('pass');
    triggerHaptic('click');
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      analytics.onboardingStep(next + 1, steps[next].title);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    soundManager.play('tap');
    triggerHaptic('click');
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    analytics.onboardingSkip(currentStep + 1);
    soundManager.play('tap');
    setOnboardingCompleted(true);
    onClose();
  };

  const handleComplete = () => {
    soundManager.play('start');
    triggerHaptic('correct');
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    analytics.onboardingComplete(elapsed);
    setOnboardingCompleted(true);
    onClose();
    if (onStartGame) onStartGame();
  };

  const handleBuzzerTest = () => {
    setBuzzerActive(true);
    setBuzzerPressedCount((prev) => prev + 1);
    soundManager.play('buzzer');
    triggerHaptic('buzzer');
    setTimeout(() => setBuzzerActive(false), 400);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-10 h-10 text-amber-400 animate-pulse" />;
      case 'Volume2': return <Volume2 className="w-10 h-10 text-rose-400 animate-bounce" />;
      case 'Sparkles': return <Sparkles className="w-10 h-10 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'Trophy': return <Trophy className="w-10 h-10 text-emerald-400" />;
      case 'Smartphone': return <Smartphone className="w-10 h-10 text-indigo-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-10 h-10 text-cyan-400" />;
      case 'Crown': return <Crown className="w-10 h-10 text-amber-400" />;
      default: return <Sparkles className="w-10 h-10 text-indigo-400" />;
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep] || DEFAULT_ONBOARDING_STEPS[0];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto select-none">
      {/* Dynamic Background Glowing Spheres */}
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header: Step Progress & Navigation */}
      <header className="relative z-10 w-full max-w-2xl mx-auto pt-6 px-5 sm:px-8 flex flex-col gap-3">
        {/* Full-width Segmented Progress Bar */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-full h-2 p-0.5 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-indigo-500/50"
            initial={{ width: `${((currentStep) / steps.length) * 100}%` }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Top Controls: Back, Badge, Skip */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Önceki Adım"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8" />
            )}

            <span className={`text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-sm ${step.badge_color || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
              {step.badge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-400">
              {currentStep + 1} / {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
            >
              Rehberi Geç
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Onboarding Card Area */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-5 sm:px-8 py-6 flex flex-col items-center justify-center flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id || currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full flex flex-col items-center text-center gap-5"
          >
            {/* Step Icon Badge */}
            <div className="w-20 h-20 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
              {renderIcon(step.icon)}
            </div>

            {/* Step Title & Description */}
            <div className="flex flex-col items-center gap-2 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {step.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>

            {/* ================= INTERACTIVE WIDGETS ================= */}

            {/* 1. Interactive Buzzer Tester */}
            {step.interactive_type === 'buzzer_tester' && (
              <div className="w-full max-w-md bg-slate-900/80 border border-rose-500/30 rounded-3xl p-5 flex flex-col items-center gap-4 shadow-xl shadow-rose-950/20 backdrop-blur-md">
                <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs tracking-wider uppercase">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>Canlı Dokunmatik Buzzer Testi</span>
                </div>

                <button
                  type="button"
                  onClick={handleBuzzerTest}
                  className={`w-28 h-28 rounded-full bg-gradient-to-b from-rose-500 via-red-600 to-rose-800 text-white font-black text-base uppercase shadow-2xl flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-90 ${
                    buzzerActive
                      ? 'scale-95 ring-4 ring-rose-400 shadow-rose-500/80'
                      : 'hover:scale-105 shadow-rose-600/50 hover:ring-2 hover:ring-rose-400/40'
                  }`}
                  style={{
                    boxShadow: buzzerActive
                      ? '0 0 35px rgba(244,63,94,0.9), inset 0 3px 6px rgba(0,0,0,0.5)'
                      : '0 10px 30px rgba(225,29,72,0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
                  }}
                >
                  <Volume2 className="w-8 h-8 animate-pulse" />
                  <span className="text-xs tracking-widest font-black">BAS!</span>
                </button>

                <div className="text-xs text-slate-300 font-mono">
                  {buzzerPressedCount > 0 ? (
                    <span className="text-rose-400 font-bold animate-bounce flex items-center justify-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {buzzerPressedCount} kez basıldı! Rakip Tabu Yaptı (-1 Ceza Puanı)
                    </span>
                  ) : (
                    'Butona basarak ses ve titreşim tepkisini canlı test edin'
                  )}
                </div>
              </div>
            )}

            {/* 2. Interactive Animated Rules Card */}
            {step.interactive_type === 'rules_card' && (
              <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 text-left flex flex-col gap-3 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-black text-amber-400 tracking-wider">ÖRNEK TABU KARTI: KAHVE</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-2 py-0.5 rounded-full border border-rose-500/30">
                    5 YASAK KELİME
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {['Kafein', 'Fincan', 'Sıcak', 'Starbucks', 'İçecek'].map((w) => (
                    <div
                      key={w}
                      className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/25 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Interactive AI Spark Box */}
            {step.interactive_type === 'ai_spark' && (
              <div className="w-full max-w-md bg-gradient-to-r from-purple-950/50 via-indigo-950/50 to-pink-950/50 border border-purple-500/40 rounded-3xl p-4 sm:p-5 text-left flex flex-col gap-3 shadow-2xl shadow-purple-500/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="text-sm font-black text-purple-300">Google Gemini 3.5 Akıllı Deste Motoru</span>
                </div>
                <div className="text-xs text-slate-300 italic bg-slate-950/70 p-3 rounded-2xl border border-purple-500/20 leading-relaxed font-mono">
                  "2026 Viral Meme'leri, popüler dizi replikleri ve internet trendleri hakkında 20 yeni Tabu kartı üret..."
                </div>
              </div>
            )}

            {/* 4. Interactive User Profile Nickname Form */}
            {step.interactive_type === 'user_profile' && (
              <div className="w-full max-w-md bg-slate-900/80 border border-indigo-500/30 rounded-3xl p-5 flex flex-col gap-3 shadow-xl backdrop-blur-md">
                <label className="text-xs text-left font-bold text-slate-300 pl-1 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Arenadaki Oyuncu Takma Adınız:</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Örn: Tabu Şampiyonu"
                  maxLength={18}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-4 text-center font-extrabold text-white text-lg focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                />
              </div>
            )}

            {/* Bullet Points */}
            {step.bullets && step.bullets.length > 0 && (
              <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 text-left flex flex-col gap-2 shadow-inner">
                {step.bullets.map((bullet, idx) => (
                  <div key={idx} className="text-xs sm:text-sm text-slate-300 leading-snug flex items-center gap-2.5 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Footer: Navigation & Actions */}
      <footer className="relative z-10 w-full max-w-xl mx-auto pb-8 pt-4 px-5 sm:px-8 flex flex-col gap-4">
        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md shadow-indigo-500/50'
                  : idx < currentStep
                  ? 'w-2.5 bg-indigo-500/50'
                  : 'w-2 bg-slate-800'
              }`}
              title={`Adım ${idx + 1}`}
            />
          ))}
        </div>

        {/* Primary CTA Button */}
        <Button
          variant={currentStep === steps.length - 1 ? 'success' : 'primary'}
          size="lg"
          fullWidth
          onClick={handleNext}
          className="font-black text-base py-4 rounded-xl"
        >
          {currentStep === steps.length - 1 ? (
            <span className="flex items-center justify-center gap-2">
              {step.cta_text || 'Arenaya Başla!'} <Check className="w-5 h-5" />
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {step.cta_text || 'Devam Et'} <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </footer>
    </div>
  );
};
