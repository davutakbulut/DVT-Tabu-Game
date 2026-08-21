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
  ShieldAlert, 
  Users, 
  KeyRound, 
  Zap,
  Volume2
} from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());

  const steps = [
    {
      id: 'rules',
      icon: <Flame className="w-10 h-10 text-amber-400 animate-pulse" />,
      badge: 'Temel Kurallar',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      title: 'Yasaklı Kelimelere Dikkat!',
      desc: 'Takımına ana kelimeyi anlatırken altındaki 5 yasaklı kelimeyi kesinlikle kullanma!',
      bullets: [
        '🟢 Doğru bilindiğinde +1 Puan kazanırsınız.',
        '🟡 Takıldığınızda Pas butonunu kullanın.',
        '🔴 Yasaklı kelime söylerseniz rakip Buzzer basar (-1 Ceza).'
      ]
    },
    {
      id: 'modes',
      icon: <Smartphone className="w-10 h-10 text-indigo-400" />,
      badge: 'Oyun Modları',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      title: 'Tek Cihaz veya Online Odalar',
      desc: 'İster tek bir telefonu elden ele gezdirin, ister arkadaşlarınızla uzaktan canlı odada kapışın.',
      bullets: [
        '📱 Tek Cihaz Modu: Evde, kafede tek telefonla hızlı parti.',
        '🌐 Online Oda: Herkes kendi telefonundan bağlanır.',
        '🔒 4 Haneli PIN: Odanızı şifreleyerek sadece davetlilere açın.'
      ]
    },
    {
      id: 'ai',
      icon: <Sparkles className="w-10 h-10 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />,
      badge: 'Gemini 3.5 Yapay Zeka',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      title: 'Kişiselleştirilmiş AI Desteleri',
      desc: 'Google Gemini yapay zekası oyun deneyiminizi bir üst seviyeye taşır.',
      bullets: [
        '📰 Günlük AI Bülteni: Her gün yeni taktik ve günün kartı.',
        '✨ Özel Deste Üretici: İstediğin herhangi bir konuda (Tıp, Dizi, Şirket) anında 10 kart üret.',
        '🎙️ Maç Sonu Yorumcusu: Oyun sonunda performans analizi.'
      ]
    },
    {
      id: 'profile',
      icon: <Trophy className="w-10 h-10 text-emerald-400" />,
      badge: 'Son Adım',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      title: 'Hazırsan Başlayalım!',
      desc: 'Arenada gözükecek oyuncu adını belirle ve ilk kapışmaya başla!',
      isForm: true
    }
  ];

  useEffect(() => {
    if (isOpen) {
      analytics.onboardingStart();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
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
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    analytics.onboardingComplete(elapsed);
    setOnboardingCompleted(true);
    onClose();
    if (onStartGame) onStartGame();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[460px]"
      >
        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Step Badge & Skip Button */}
        <div className="flex items-center justify-between z-10">
          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${step.badgeColor}`}>
            {step.badge}
          </span>
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-300 font-bold px-2 py-1 transition-colors"
          >
            Rehberi Atla
          </button>
        </div>

        {/* Step Content */}
        <div className="my-auto py-4 flex flex-col items-center text-center gap-3 z-10">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
            {step.icon}
          </div>

          <h3 className="text-xl font-black text-white leading-tight mt-1">
            {step.title}
          </h3>

          <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
            {step.desc}
          </p>

          {/* Bullets if any */}
          {step.bullets && (
            <div className="w-full bg-slate-950/50 border border-slate-800/60 rounded-2xl p-3 text-left flex flex-col gap-2 mt-1">
              {step.bullets.map((bullet, idx) => (
                <div key={idx} className="text-[11px] text-slate-300 leading-snug">
                  {bullet}
                </div>
              ))}
            </div>
          )}

          {/* Form Step */}
          {step.isForm && (
            <div className="w-full mt-2 flex flex-col gap-2">
              <label className="text-xs text-left font-bold text-slate-400 pl-1">Oyuncu Adın:</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Örn: Tabu Ustası"
                maxLength={18}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-center font-extrabold text-white text-base focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Footer: Step Dots & Navigation */}
        <div className="flex flex-col gap-4 z-10 pt-2 border-t border-slate-800/60">
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-6 bg-indigo-500'
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
            className="shadow-indigo-500/30 font-black"
          >
            {currentStep === steps.length - 1 ? (
              <>Hemen Başla! <Check className="w-5 h-5 ml-1.5" /></>
            ) : (
              <>İleri <ArrowRight className="w-5 h-5 ml-1.5" /></>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
