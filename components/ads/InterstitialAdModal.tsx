'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { PaywallModal } from '@/components/monetization/PaywallModal';
import { 
  X, 
  ExternalLink, 
  Crown, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Flame
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { analytics } from '@/lib/analytics';
import { AdItem, AdConfig, DEFAULT_AD_CONFIG, DEFAULT_ADS } from '@/types/ads';

interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: 'turn_break' | 'round_end' | 'match_end' | 'all';
  onAdFinished?: () => void;
}

export function InterstitialAdModal({
  isOpen,
  onClose,
  placement = 'turn_break',
  onAdFinished,
}: InterstitialAdModalProps) {
  const [adConfig, setAdConfig] = useState<AdConfig>(DEFAULT_AD_CONFIG);
  const [currentAd, setCurrentAd] = useState<AdItem>(DEFAULT_ADS[0]);
  const [countdown, setCountdown] = useState<number>(3);
  const [canSkip, setCanSkip] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAdData();
    }
  }, [isOpen]);

  const fetchAdData = async () => {
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const json = await res.json();
        const config: AdConfig = json.config || DEFAULT_AD_CONFIG;
        const ads: AdItem[] = (json.ads || DEFAULT_ADS).filter((a: AdItem) => a.is_active !== false);

        setAdConfig(config);

        // Filter by placement
        const matchingAds = ads.filter(
          (a) => a.placement === 'all' || a.placement === placement
        );
        const selected = matchingAds.length > 0
          ? matchingAds[Math.floor(Math.random() * matchingAds.length)]
          : ads[0] || DEFAULT_ADS[0];

        setCurrentAd(selected);

        // Setup Countdown
        const initialDelay = config.skip_delay_seconds ?? 3;
        setCountdown(initialDelay);
        setCanSkip(initialDelay <= 0);

        // Record Impression
        recordAdImpression(selected.id);
      }
    } catch {
      setCountdown(3);
      setCanSkip(false);
    }
  };

  useEffect(() => {
    if (!isOpen || canSkip) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [isOpen, countdown, canSkip]);

  const recordAdImpression = (adId: string) => {
    try {
      fetch('/api/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: adId, action: 'impression' }),
      }).catch(() => {});
      analytics.adImpression(adId, placement);
    } catch {}
  };

  const handleAdClick = () => {
    try {
      fetch('/api/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: currentAd.id, action: 'click' }),
      }).catch(() => {});
      analytics.adClick(currentAd.id, placement);
    } catch {}

    if (currentAd.target_url === '/paywall') {
      setIsPaywallOpen(true);
    } else if (currentAd.target_url) {
      window.open(currentAd.target_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSkipAd = () => {
    if (!canSkip) return;
    soundManager.play('pass');
    onClose();
    if (onAdFinished) onAdFinished();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between relative min-h-[480px]"
      >
        {/* Top Floating Control Bar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between z-10 backdrop-blur-sm">
          <span className="text-[10px] font-extrabold font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            {currentAd.badge || 'SPONSORLU İÇERİK'}
          </span>

          {canSkip ? (
            <button
              onClick={handleSkipAd}
              className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 py-1 px-3 rounded-full flex items-center gap-1 transition-all shadow-md shadow-indigo-500/30 animate-pulse"
            >
              <span>Reklamı Geç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-[11px] font-bold text-slate-400 font-mono bg-slate-900 py-1 px-2.5 rounded-full border border-slate-800">
              {countdown}s sonra geçebilirsiniz
            </div>
          )}
        </div>

        {/* Ad Body Content */}
        <div className="p-5 flex-1 flex flex-col items-center text-center justify-center gap-3.5">
          {/* Ad Image / Banner */}
          {currentAd.image_url ? (
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-800 shadow-lg relative group">
              <img
                src={currentAd.image_url}
                alt={currentAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className={`w-full h-36 rounded-2xl bg-gradient-to-br ${currentAd.color_theme || 'from-indigo-600 to-purple-800'} flex items-center justify-center text-white shadow-xl`}>
              <Sparkles className="w-12 h-12 animate-pulse" />
            </div>
          )}

          <div>
            <h3 className="text-lg font-black text-white leading-tight">
              {currentAd.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-xs">
              {currentAd.description}
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAdClick}
            className="font-black text-xs py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:opacity-95 text-white shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
          >
            <span>{currentAd.cta_text || 'Hemen İncele'}</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom Pro Ad-Free Banner */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsPaywallOpen(true)}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors mx-auto"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Reklamları kaldırmak için <strong>Pro'ya Geç</strong></span>
          </button>
        </div>
      </motion.div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        triggerSource="ad_modal_footer"
      />
    </div>
  );
}
