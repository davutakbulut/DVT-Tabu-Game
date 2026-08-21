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
  Flame,
  Maximize2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { analytics } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';
import { AdItem, AdConfig, DEFAULT_AD_CONFIG, DEFAULT_ADS, AdDisplayType } from '@/types/ads';

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
  const { guestId, userEmail } = useUserStore();
  const [openedAt, setOpenedAt] = useState<number>(Date.now());

  useEffect(() => {
    if (isOpen) {
      setOpenedAt(Date.now());
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
        const selected: AdItem = matchingAds.length > 0
          ? matchingAds[Math.floor(Math.random() * matchingAds.length)]
          : ads[0] || DEFAULT_ADS[0];

        setCurrentAd(selected);

        // Setup Countdown based on per-ad or global settings
        const isSkippable = selected.is_skippable !== false;
        const delay = isSkippable 
          ? (selected.skip_delay_seconds ?? config.skip_delay_seconds ?? 3)
          : (selected.duration_seconds ?? 5);

        setCountdown(delay);
        setCanSkip(isSkippable && delay <= 0);

        // Record Impression with rich telemetry
        recordAdImpression(selected);
      }
    } catch {
      setCountdown(3);
      setCanSkip(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const isSkippable = currentAd.is_skippable !== false;
      if (isSkippable) {
        setCanSkip(true);
      } else {
        // Non-skippable ad finished naturally
        handleSkipAd();
      }
    }
  }, [isOpen, countdown, currentAd]);

  const recordAdImpression = (ad: AdItem) => {
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
    try {
      fetch('/api/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: ad.id, action: 'impression' }),
      }).catch(() => {});

      fetch('/api/ads/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: ad.id,
          ad_title: ad.title,
          event_type: 'impression',
          placement,
          display_type: ad.display_type || adConfig.default_display_type || 'popup',
          page_url: pageUrl,
          user_id: userEmail || null,
          guest_id: guestId || null,
          target_url: ad.target_url,
          cta_text: ad.cta_text,
        }),
      }).catch(() => {});

      analytics.adImpression(ad.id, placement);
    } catch {}
  };

  const handleAdClick = () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
    const dwellSeconds = Math.round((Date.now() - openedAt) / 1000);

    try {
      fetch('/api/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: currentAd.id, action: 'click' }),
      }).catch(() => {});

      fetch('/api/ads/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: currentAd.id,
          ad_title: currentAd.title,
          event_type: 'click',
          placement,
          display_type: currentAd.display_type || 'popup',
          page_url: pageUrl,
          user_id: userEmail || null,
          guest_id: guestId || null,
          duration_watched_seconds: dwellSeconds,
          target_url: currentAd.target_url,
          cta_text: currentAd.cta_text,
        }),
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
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
    const dwellSeconds = Math.round((Date.now() - openedAt) / 1000);

    try {
      fetch('/api/ads/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: currentAd.id,
          ad_title: currentAd.title,
          event_type: 'skip',
          placement,
          display_type: currentAd.display_type || 'popup',
          page_url: pageUrl,
          user_id: userEmail || null,
          guest_id: guestId || null,
          duration_watched_seconds: dwellSeconds,
        }),
      }).catch(() => {});
    } catch {}

    soundManager.play('pass');
    onClose();
    if (onAdFinished) onAdFinished();
  };

  if (!isOpen) return null;

  const displayType: AdDisplayType = currentAd.display_type || adConfig.default_display_type || 'popup';
  const isSkippable = currentAd.is_skippable !== false;

  // ==========================================
  // 1. TAM EKRAN (FULLSCREEN TAKEOVER) MODU
  // ==========================================
  if (displayType === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-white animate-in fade-in duration-300 overflow-y-auto">
        {/* Background Image Ambient Glow */}
        {currentAd.image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl pointer-events-none"
            style={{ backgroundImage: `url(${currentAd.image_url})` }}
          />
        )}

        {/* Top Header Controls */}
        <div className="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {currentAd.badge || 'SPONSORLU YAYIN'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Tam Ekran
            </span>
          </div>

          {/* Skip / Timer Action */}
          {isSkippable ? (
            canSkip ? (
              <button
                onClick={handleSkipAd}
                className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 py-1.5 px-4 rounded-full flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/30 animate-pulse active:scale-95"
              >
                <span>Reklamı Geç</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs font-bold text-slate-300 font-mono bg-slate-900/90 py-1.5 px-3.5 rounded-full border border-slate-800 flex items-center gap-1.5 shadow-md">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{countdown}s sonra geçebilirsiniz</span>
              </div>
            )
          ) : (
            <div className="text-xs font-bold text-slate-300 font-mono bg-slate-900/90 py-1.5 px-3.5 rounded-full border border-slate-800 flex items-center gap-1.5 shadow-md">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Sponsorlu Gösterim: {countdown}s</span>
            </div>
          )}
        </div>

        {/* Fullscreen Hero Showcase */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center text-center gap-5 py-4">
          {currentAd.image_url ? (
            <div className="w-full max-h-[360px] aspect-video rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl relative group bg-slate-900">
              <img
                src={currentAd.image_url}
                alt={currentAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className={`w-full h-56 rounded-3xl bg-gradient-to-br ${currentAd.color_theme || 'from-indigo-600 to-purple-800'} flex items-center justify-center text-white shadow-2xl`}>
              <Sparkles className="w-16 h-16 animate-pulse" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {currentAd.title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              {currentAd.description}
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAdClick}
            className="font-black text-base py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:opacity-95 text-white shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
          >
            <span>{currentAd.cta_text || 'Hemen İncele'}</span>
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>

        {/* Footer Pro Link */}
        <div className="relative z-10 w-full max-w-2xl mx-auto text-center py-2 border-t border-slate-800/80">
          <button
            onClick={() => setIsPaywallOpen(true)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors"
          >
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Reklamları tamamen kaldırmak için <strong>Pro'ya Yükselt</strong></span>
          </button>
        </div>

        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
          triggerSource="ad_modal_fullscreen"
        />
      </div>
    );
  }

  // ==========================================
  // 2. ALT SABİT BANNER (BANNER BOTTOM) MODU
  // ==========================================
  if (displayType === 'banner_bottom') {
    return (
      <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/80 backdrop-blur-md border-t border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {currentAd.image_url ? (
              <img
                src={currentAd.image_url}
                alt={currentAd.title}
                className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentAd.badge || 'SPONSOR'}
                </span>
                <span className="text-xs font-black text-white truncate">
                  {currentAd.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                {currentAd.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAdClick}
              className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1 shadow-md shadow-indigo-600/30"
            >
              <span>{currentAd.cta_text || 'İncele'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {isSkippable && (
              <button
                onClick={handleSkipAd}
                disabled={!canSkip}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  canSkip
                    ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
                title={canSkip ? 'Kapat' : `${countdown}s bekleyin`}
              >
                {canSkip ? <X className="w-4 h-4" /> : <span className="font-mono text-[10px]">{countdown}s</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. POPUP MODAL (DEFAULT CENTERED CARD) MODU
  // ==========================================
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

          {isSkippable ? (
            canSkip ? (
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
            )
          ) : (
            <div className="text-[11px] font-bold text-rose-400 font-mono bg-slate-900 py-1 px-2.5 rounded-full border border-slate-800">
              {countdown}s kaldı
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
