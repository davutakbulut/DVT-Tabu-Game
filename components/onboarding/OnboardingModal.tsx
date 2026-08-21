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
  Check, 
  X, 
  Volume2, 
  Zap, 
  Crown,
  Gamepad2,
  Smile,
  ShieldCheck,
  RotateCcw
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

  useEffect(() => {
    if (isOpen) {
      analytics.onboardingStart();
      fetchSteps();
    }
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
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      analytics.onboardingStep(next + 1, steps[next].title);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    analytics.onboardingSkip(currentStep + 1);
    setOnboardingCompleted(true);
    onClose();
  };

  const handleComplete = () => {
    soundManager.play('start');
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
      case 'Flame': return <Flame className="w-8 h-8 text-amber-400 animate-pulse" />;
      case 'Volume2': return <Volume2 className="w-8 h-8 text-rose-400 animate-bounce" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'Trophy': return <Trophy className="w-8 h-8 text-emerald-400" />;
      case 'Smartphone': return <Smartphone className="w-8 h-8 text-indigo-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-8 h-8 text-cyan-400" />;
      case 'Crown': return <Crown className="w-8 h-8 text-amber-400" />;
      default: return <Sparkles className="w-8 h-8 text-indigo-400" />;
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep] || DEFAULT_ONBOARDING_STEPS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        key={step.id || currentStep}
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[500px]"
      >
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Step Badge & Skip Button */}
        <div className="flex items-center justify-between z-10">
          <span className={`text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full border shadow-sm ${step.badge_color || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
            {step.badge}
          </span>
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-300 font-bold px-2 py-1 transition-colors"
          >
            Rehberi Atla
          </button>
        </div>

        {/* Step Content Area */}
        <div className="my-auto py-3 flex flex-col items-center text-center gap-3 z-10">
          <div className="w-16 h-16 rounded-3xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-center shadow-inner">
            {renderIcon(step.icon)}
          </div>

          <div>
            <h3 className="text-xl font-black text-white leading-tight">
              {step.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
              {step.desc}
            </p>
          </div>

          {/* ================= INTERACTIVE WIDGETS ================= */}

          {/* 1. Interactive Buzzer Tester */}
          {step.interactive_type === 'buzzer_tester' && (
            <div className="w-full bg-slate-950/70 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center gap-3 my-1">
              <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
                 Canlı Buzzer Deneyimi (Bas ve Sesi Duy)
              </span>

              <button
                type="button"
                onClick={handleBuzzerTest}
                className={`w-20 h-20 rounded-full bg-gradient-to-b from-rose-500 to-red-700 text-white font-black text-sm uppercase shadow-2xl flex flex-col items-center justify-center gap-1 transition-all transform active:scale-90 ${
                  buzzerActive ? 'scale-95 ring-4 ring-rose-400/80 shadow-rose-500/50' : 'hover:scale-105 shadow-rose-600/40'
                }`}
                style={{
                  boxShadow: buzzerActive
                    ? '0 0 25px rgba(244,63,94,0.8), inset 0 2px 4px rgba(0,0,0,0.4)'
                    : '0 8px 20px rgba(225,29,72,0.4), inset 0 2px 3px rgba(255,255,255,0.4)',
                }}
              >
                <Volume2 className="w-6 h-6 animate-pulse" />
                <span className="text-[10px]">BAS!</span>
              </button>

              <div className="text-[10px] text-slate-400 font-mono">
                {buzzerPressedCount > 0 ? (
                  <span className="text-rose-400 font-bold animate-bounce block">
                     {buzzerPressedCount} kez basıldı! Rakip Tabu Yaptı (-1 Ceza)
                  </span>
                ) : (
                  'Butona basarak titreşim ve sesi test et'
                )}
              </div>
            </div>
          )}

          {/* 2. Interactive Animated Rules Card */}
          {step.interactive_type === 'rules_card' && (
            <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-left flex flex-col gap-2 my-1 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-xs font-black text-amber-400 tracking-wider">ÖRNEK KART: KAHVE</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded">5 YASAK</span>
              </div>

              <div className="flex flex-wrap gap-1 pt-0.5">
                {['Kafein', 'Fincan', 'Sıcak', 'Starbucks', 'İçecek'].map((w) => (
                  <span key={w} className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-lg font-bold inline-flex items-center gap-1">
                    <X className="w-2.5 h-2.5 text-rose-400" />
                    <span>{w}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3. Interactive AI Spark Box */}
          {step.interactive_type === 'ai_spark' && (
            <div className="w-full bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-pink-950/40 border border-purple-500/40 rounded-2xl p-3 text-left flex flex-col gap-2 my-1 shadow-lg shadow-purple-500/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-xs font-black text-purple-300">Gemini 3.5 Akıllı Deste Motoru</span>
              </div>
              <div className="text-[11px] text-slate-300 italic bg-slate-950/60 p-2 rounded-xl border border-purple-500/20">
                "2026 Viral Meme'leri ve popüler internet trendleri hakkında 10 kart üret..."
              </div>
            </div>
          )}

          {/* 4. Interactive User Profile Nickname Form */}
          {step.interactive_type === 'user_profile' && (
            <div className="w-full mt-1 flex flex-col gap-2">
              <label className="text-xs text-left font-bold text-slate-400 pl-1">Arenadaki Oyuncu Adın:</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Örn: Tabu Ustası"
                maxLength={18}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-center font-extrabold text-white text-base focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
            </div>
          )}

          {/* Bullets */}
          {step.bullets && step.bullets.length > 0 && (
            <div className="w-full bg-slate-950/50 border border-slate-800/60 rounded-2xl p-3 text-left flex flex-col gap-1.5">
              {step.bullets.map((bullet, idx) => (
                <div key={idx} className="text-[11px] text-slate-300 leading-snug flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Step Dots & Navigation */}
        <div className="flex flex-col gap-3.5 z-10 pt-3 border-t border-slate-800/60">
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-6 bg-indigo-500 shadow-sm shadow-indigo-500/50'
                    : idx < currentStep
                    ? 'w-1.5 bg-indigo-500/50'
                    : 'w-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNext}
            className="shadow-xl shadow-indigo-500/30 font-black py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-95"
          >
            {currentStep === steps.length - 1 ? (
              <span className="flex items-center justify-center gap-2">
                {step.cta_text || ' Arenaya Başla!'} <Check className="w-5 h-5" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {step.cta_text || 'İleri'} <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
