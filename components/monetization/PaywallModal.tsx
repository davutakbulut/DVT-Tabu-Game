'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Star,
  Check,
  X
} from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  triggerSource = 'game_limit',
}) => {
  const { isProUser, setIsProUser, totalGamesPlayed } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<any>({
    monthly_price: 49.99,
    annual_price: 349.99,
    active_campaign_title: '%40 Lansman Fırsatı',
    campaign_badge: 'SINIRLI SÜRE',
  });

  useEffect(() => {
    if (isOpen) {
      analytics.paywallView(triggerSource, totalGamesPlayed);
      // Fetch live pricing from Supabase remote config
      fetch('/api/config')
        .then((res) => res.json())
        .then((res) => {
          if (res.config) setRemoteConfig(res.config);
        })
        .catch(() => {});
    }
  }, [isOpen, triggerSource, totalGamesPlayed]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    analytics.paywallCtaClick(selectedPlan, triggerSource);
    setIsProUser(true);
    setIsUpgraded(true);
    setTimeout(() => {
      setIsUpgraded(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-6 flex flex-col justify-between shadow-2xl shadow-amber-500/10 relative overflow-hidden text-slate-200"
      >
        {/* Top Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-amber-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {isUpgraded ? (
          <div className="py-12 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white inline-flex items-center gap-2">
              Tebrikler! <Sparkles className="w-6 h-6 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-300">
              DVT Tabu PRO üyeliğiniz aktif edildi. Tüm kilitler açıldı!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-2 pt-2">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                <Crown className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {remoteConfig.active_campaign_title || 'DVT TABU PRO'}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Sınırsız Eğlenceye Katıl
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                {triggerSource === 'after_2_games' 
                  ? 'Harika maçlar çıkardınız! Pro ile sınırsız AI deste üretimi ve turnuva odalarının tadını çıkarın.' 
                  : 'Yapay zeka ile sınırsız deste üretimi ve reklamsız Tabu arenası.'}
              </p>
            </div>

            {/* Feature List */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-slate-200"><strong>Sınırsız</strong> Gemini AI Deste Üretimi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200">Özel <strong>VIP Turnuva Odaları</strong> & PIN</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-200">Özel Kart Temaları & Altın Şampiyon Rozeti</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-200">%100 <strong>Reklamsız</strong> Kesintisiz Oyun</span>
              </div>
            </div>

            {/* Pricing Options */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Yıllık */}
              <button
                type="button"
                onClick={() => setSelectedPlan('yearly')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {remoteConfig.campaign_badge || '%33 İndirim'}
                </span>
                <span className="text-xs font-bold block text-slate-300">Yıllık Plan</span>
                <span className="text-base font-black text-amber-300 font-mono mt-1">{remoteConfig.annual_price || 349} ₺</span>
                <span className="text-[10px] text-slate-400">{(Number(remoteConfig.annual_price || 349) / 12).toFixed(1)} ₺ / ay</span>
              </button>

              {/* Aylık */}
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold block text-slate-300">Aylık Plan</span>
                <span className="text-base font-black text-amber-300 font-mono mt-1">{remoteConfig.monthly_price || 49} ₺</span>
                <span className="text-[10px] text-slate-400">Aylık yenilenir</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 border-0"
              >
                <Crown className="w-5 h-5 mr-1.5 fill-slate-950" />
                Hemen Pro'ya Yükselt
              </Button>
              <button
                onClick={onClose}
                className="text-[11px] text-slate-400 hover:text-slate-200 py-1 text-center font-bold"
              >
                Şimdilik Ücretsiz Devam Et
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
