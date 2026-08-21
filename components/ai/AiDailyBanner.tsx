'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Trophy, 
  Check, 
  Clock, 
  RotateCcw, 
  X, 
  PlusCircle, 
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AiRecommendation, Card, GameSettings } from '@/types/game';

interface AiDailyBannerProps {
  currentSettings?: GameSettings;
  onApplyMode?: (mode: any) => void;
  onAddBonusCard?: (card: Card) => void;
}

const LOCAL_STORAGE_KEY = 'dvt_daily_ai_insight';
const CLIENT_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 saat

export const AiDailyBanner: React.FC<AiDailyBannerProps> = ({
  currentSettings,
  onApplyMode,
  onAddBonusCard,
}) => {
  const [data, setData] = useState<AiRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<any | null>(null);
  const [cardAdded, setCardAdded] = useState(false);

  const fetchDailyInsights = async (force: boolean = false) => {
    if (!force && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CLIENT_CACHE_TTL && parsed.data) {
            setData(parsed.data);
            return;
          }
        }
      } catch {}
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'daily_recommendation', forceRefresh: force }),
      });
      if (res.ok) {
        const json = await res.json();
        if (!json.error) {
          setData(json);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ data: json, timestamp: Date.now() }));
          }
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyInsights(false);
  }, []);

  const handleSelectMode = (mode: any) => {
    if (onApplyMode) {
      onApplyMode(mode);
      const msg = `${mode.title} seçildi: ${mode.recommended_duration_seconds}s Süre, ${mode.recommended_pass_limit || 2} Pas olarak ayarlandı!`;
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleAddFeaturedCard = () => {
    if (data?.featured_card_of_the_day && onAddBonusCard) {
      const card: Card = {
        id: `bonus-card-${Date.now()}`,
        main_word: data.featured_card_of_the_day.main_word,
        forbidden_words: data.featured_card_of_the_day.forbidden_words as [string, string, string, string, string],
        category: data.featured_card_of_the_day.category || 'Özel Günlük',
        difficulty: data.featured_card_of_the_day.difficulty || 'Orta',
      };
      onAddBonusCard(card);
      setCardAdded(true);
      setToastMessage(`"${card.main_word}" günün bonus kartı oyuna eklendi!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  if (!data && !loading) return null;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl relative overflow-hidden backdrop-blur-md transition-all duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Success Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-3 inset-x-3 z-30 bg-emerald-600 text-white text-xs font-black p-2.5 rounded-xl shadow-lg flex items-center justify-between gap-2 border border-emerald-400/50"
          >
            <div className="flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-0.5 text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Collapsible Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors hover:bg-white/[0.02] ${
          isExpanded ? 'border-b border-amber-500/20' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 block leading-tight">
                Günün AI Oyun Bülteni
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                {isExpanded ? 'Açık' : 'Taktikleri Gör'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isExpanded ? 'Günün Taktikleri ve Hızlı Mod Önerileri' : (data?.headline || 'Yapay Zeka Taktik ve Mod Önerileri')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => fetchDailyInsights(true)}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-500/20 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Collapsible Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-3 flex flex-col gap-3">
              {loading && !data ? (
                <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                  Gemini AI günlük oyun analizi ve önerileri hazırlıyor...
                </div>
              ) : data ? (
                <>
                  <div>
                    <h4 className="text-base font-extrabold text-white leading-snug">
                      {data.headline}
                    </h4>
                    <p className="text-xs text-amber-200/80 mt-1 font-medium">
                      {data.daily_vibe}
                    </p>
                  </div>

                  {/* Recommended Modes with Clear Selection Badges */}
                  {data.recommended_modes && data.recommended_modes.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Önerilen Hızlı Modlar (Tek Tıkla Uygula):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {data.recommended_modes.slice(0, 2).map((mode, idx) => {
                          const isCurrentlyActive =
                            currentSettings &&
                            currentSettings.turn_duration === mode.recommended_duration_seconds &&
                            currentSettings.pass_limit === (mode.recommended_pass_limit || 2);

                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                                isCurrentlyActive
                                  ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/15'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <Zap className={`w-3.5 h-3.5 ${isCurrentlyActive ? 'text-amber-400' : 'text-slate-400'}`} />
                                    <span className="text-xs font-black text-white">{mode.title}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1 leading-snug font-medium">
                                    {mode.reason}
                                  </p>
                                </div>

                                {isCurrentlyActive && (
                                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 shrink-0">
                                    Aktif
                                  </span>
                                )}
                              </div>

                              {/* Rule Parameters Badges */}
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 pt-1 border-t border-slate-800/60">
                                <span className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                                  <Clock className="w-3 h-3 text-cyan-400" />
                                  {mode.recommended_duration_seconds}sn Süre
                                </span>
                                <span className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                                  <RotateCcw className="w-3 h-3 text-amber-400" />
                                  {mode.recommended_pass_limit || 2} Pas
                                </span>
                              </div>

                              {/* Action Button */}
                              <button
                                onClick={() => handleSelectMode(mode)}
                                disabled={isCurrentlyActive}
                                className={`w-full text-xs font-black py-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                                  isCurrentlyActive
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600 shadow-md shadow-amber-500/20'
                                }`}
                              >
                                {isCurrentlyActive ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Bu Mod Seçili
                                  </>
                                ) : (
                                  'Bu Modu Seç & Uygula'
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Featured Card of the Day (Interactive) */}
                  {data.featured_card_of_the_day && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/25 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Günün Bonus Kartı</span>
                          <span className="font-black text-white text-sm">
                            {data.featured_card_of_the_day.main_word}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewCard(data.featured_card_of_the_day)}
                          className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-700/60"
                        >
                          Yasaklıları Gör
                        </button>
                        <button
                          onClick={handleAddFeaturedCard}
                          disabled={cardAdded}
                          className={`text-[11px] font-black py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1 ${
                            cardAdded
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600 shadow-sm'
                          }`}
                        >
                          {cardAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Eklendi
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" /> Oyuna Ekle
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Card Preview Modal */}
      <AnimatePresence>
        {previewCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewCard(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xs bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl z-10 text-center"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="text-[10px] uppercase font-bold text-amber-400">Günün Kartı Önizleme</span>
                <button onClick={() => setPreviewCard(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Face */}
              <div className="bg-gradient-to-b from-amber-950/40 to-slate-950 border border-amber-500/30 rounded-xl p-4 mb-3">
                <span className="text-xs uppercase font-extrabold text-amber-300 block mb-1">
                  {previewCard.category || 'Teknoloji'}
                </span>
                <h3 className="text-2xl font-black text-white tracking-wider mb-3">
                  {previewCard.main_word}
                </h3>
                <div className="space-y-1.5 text-xs font-extrabold text-rose-300">
                  {previewCard.forbidden_words.map((w: string, i: number) => (
                    <div key={i} className="bg-rose-950/40 border border-rose-500/20 py-1 rounded-lg">
                      {w}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  handleAddFeaturedCard();
                  setPreviewCard(null);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25"
              >
                Bu Kartı Bugünkü Oyunuma Dahil Et
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
