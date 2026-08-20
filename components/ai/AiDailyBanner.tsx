'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Zap, Trophy } from 'lucide-react';
import { AiRecommendation } from '@/types/game';

interface AiDailyBannerProps {
  onApplyMode?: (mode: any) => void;
}

export const AiDailyBanner: React.FC<AiDailyBannerProps> = ({ onApplyMode }) => {
  const [data, setData] = useState<AiRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDailyInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'daily_recommendation' }),
      });
      if (res.ok) {
        const json = await res.json();
        if (!json.error) {
          setData(json);
        }
      }
    } catch {
      // Fallback local data if offline or error
      setData({
        date: new Date().toISOString().split('T')[0],
        headline: 'Günün Tabu Arenası: Hızlı ve Zeki Olan Kazanır! 🚀',
        daily_vibe: 'Bugün Genel Kültür ve Sinema kategorilerinde rekor denemesi günü!',
        recommended_modes: [
          {
            title: 'Express Mod (45s)',
            recommended_duration_seconds: 45,
            recommended_pass_limit: 2,
            reason: 'Zamana karşı adrenalin dolu hızlı kapışma.'
          }
        ],
        featured_card_of_the_day: {
          id: 'ai-feat',
          main_word: 'YAPAY ZEKA',
          forbidden_words: ['ROBOT', 'ALGORİTMA', 'BİLGİSAYAR', 'GELECEK', 'CHATGPT'],
          category: 'Teknoloji',
          difficulty: 'Orta'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyInsights();
  }, []);

  if (!data && !loading) return null;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Günün AI Oyun Bülteni & Önerisi
          </span>
        </div>
        <button
          onClick={fetchDailyInsights}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Yenile"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {loading && !data ? (
        <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
          Gemini AI günlük oyun analizi ve önerileri hazırlıyor...
        </div>
      ) : data ? (
        <div className="flex flex-col gap-3">
          <div>
            <h4 className="text-base font-extrabold text-white leading-snug">
              {data.headline}
            </h4>
            <p className="text-xs text-indigo-200/80 mt-1">
              {data.daily_vibe}
            </p>
          </div>

          {/* Recommended Mode Card */}
          {data.recommended_modes && data.recommended_modes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {data.recommended_modes.slice(0, 2).map((mode, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {mode.title}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {mode.reason}
                    </span>
                  </div>
                  {onApplyMode && (
                    <button
                      onClick={() => onApplyMode(mode)}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/15 py-1 px-2.5 rounded-lg shrink-0"
                    >
                      Uygula
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Featured Card of the Day */}
          {data.featured_card_of_the_day && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
              <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Günün Kartı: <strong className="text-white font-extrabold">{data.featured_card_of_the_day.main_word}</strong>
              </span>
              <span className="text-[10px] text-slate-400">
                {data.featured_card_of_the_day.category}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
