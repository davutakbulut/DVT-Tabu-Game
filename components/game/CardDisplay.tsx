'use client';

import React, { useState } from 'react';
import { Card } from '@/types/game';
import { CATEGORY_COLORS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';

interface CardDisplayProps {
  card: Card | null;
  isSpectator?: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, isSpectator = false }) => {
  const [isCurtainActive, setIsCurtainActive] = useState(false);

  if (!card) {
    return (
      <div className="w-full max-w-sm mx-auto h-[420px] rounded-3xl bg-slate-900/90 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-3">
        <ShieldAlert className="w-12 h-12 stroke-[1.5]" />
        <span className="text-sm font-bold">Sıradaki kart hazırlanıyor...</span>
      </div>
    );
  }

  const categoryStyle = CATEGORY_COLORS[card.category] || {
    bg: 'from-indigo-600 to-purple-700',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-400'
  };

  // If in spectator/audience view: hide words to prevent peeking
  if (isSpectator) {
    return (
      <div className="w-full max-w-sm mx-auto h-[400px] rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
          <EyeOff className="w-10 h-10 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">Anlatıcı Sırası</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Kelimeler sadece anlatan oyuncunun cihazında görünür. Takım arkadaşlarınızı dikkatle dinleyin!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={card.id + card.main_word}
      initial={{ scale: 0.92, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      className="relative w-full max-w-sm mx-auto rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-[0_12px_28px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
    >
      {/* Category Header Bar with Eye Curtain Toggle */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${categoryStyle.badge}`}>
            {card.category}
          </span>
          <span className="text-[10px] font-bold text-slate-500 font-mono">
            {card.difficulty || 'Orta'}
          </span>
        </div>

        <button
          onClick={() => setIsCurtainActive(!isCurtainActive)}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-black bg-slate-900 border border-slate-800 px-2"
          title="Kartı Gizle / Aç"
        >
          {isCurtainActive ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isCurtainActive ? 'Aç' : 'Gizle'}</span>
        </button>
      </div>

      {/* Main Target Word Banner (Massive High Contrast Display) */}
      <div className="p-5 text-center bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-900 border-b-2 border-slate-800 relative">
        {isCurtainActive ? (
          <div className="py-4 text-slate-500 font-black text-base italic">
            Kart Gizlendi 🔒
          </div>
        ) : (
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {card.main_word}
          </h2>
        )}
      </div>

      {/* 5 Forbidden Words List (Tactile Blocks) */}
      <div className="p-4 flex-1 flex flex-col gap-2 bg-slate-950/60">
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 text-center mb-0.5 flex items-center justify-center gap-1">
          🚫 Yasaklı Kelimeler 🚫
        </span>

        {isCurtainActive ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-bold py-10">
            Perdeyi açmak için yukarıdaki butona dokunun.
          </div>
        ) : (
          card.forbidden_words.map((word, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="py-2.5 px-3 rounded-2xl bg-slate-900/90 border border-rose-500/30 text-rose-200 font-extrabold text-center text-base sm:text-lg tracking-wide uppercase shadow-sm flex items-center justify-center"
            >
              {word}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
