'use client';

import React, { useState } from 'react';
import { Card } from '@/types/game';
import { CATEGORY_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert, Lock, AlertOctagon, Flame, Shield } from 'lucide-react';

interface CardDisplayProps {
  card: Card | null;
  isSpectator?: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, isSpectator = false }) => {
  const [isCurtainActive, setIsCurtainActive] = useState(false);

  if (!card) {
    return (
      <div className="w-full max-w-sm mx-auto h-[420px] rounded-2xl bg-slate-900/90 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-3">
        <ShieldAlert className="w-12 h-12 stroke-[1.5]" />
        <span className="text-sm font-bold">Sıradaki kart hazırlanıyor...</span>
      </div>
    );
  }

  const categoryStyle = CATEGORY_COLORS[card.category] || {
    bg: 'from-amber-600 to-orange-700',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  };

  // If in spectator/audience view: hide words to prevent peeking
  if (isSpectator) {
    return (
      <div className="w-full max-w-sm mx-auto h-[400px] rounded-2xl tabletop-card p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
          <EyeOff className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-black text-white mb-2">Anlatıcı Sırası</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Kelimeler sadece anlatan oyuncunun ekranında görünür. Takım arkadaşınızı dikkatle dinleyin!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={card.id + card.main_word}
      initial={{ scale: 0.94, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.94, opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="relative w-full max-w-sm mx-auto rounded-2xl tabletop-card overflow-hidden flex flex-col select-none"
    >
      {/* Category Header Bar with Eye Curtain Toggle */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${categoryStyle.badge}`}>
            {card.category}
          </span>
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            {card.difficulty || 'Orta'}
          </span>
        </div>

        <button
          onClick={() => setIsCurtainActive(!isCurtainActive)}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-[10px] font-black bg-slate-900 border border-slate-800 px-2.5 py-1 hover:border-slate-700"
          title="Kartı Gizle / Aç"
        >
          {isCurtainActive ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
          <span>{isCurtainActive ? 'GÖSTER' : 'GİZLE'}</span>
        </button>
      </div>

      {/* Main Target Word Banner (Massive High Contrast Tabletop Header) */}
      <div className="p-6 text-center bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-slate-900 border-b-2 border-slate-800 relative">
        {isCurtainActive ? (
          <div className="py-3 text-slate-500 font-black text-base italic flex items-center justify-center gap-2">
            <span>Kart Gizlendi</span>
            <Lock className="w-4 h-4 text-slate-400" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/80">ANLATILACAK KELİME</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-white uppercase drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)]">
              {card.main_word}
            </h2>
          </div>
        )}
      </div>

      {/* 5 Forbidden Words List (Tactile Tabletop Chips) */}
      <div className="p-4 flex-1 flex flex-col gap-2 bg-slate-950/70">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <AlertOctagon className="w-3 h-3 text-rose-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
            5 YASAKLI KELİME
          </span>
          <AlertOctagon className="w-3 h-3 text-rose-500" />
        </div>

        {isCurtainActive ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-bold py-8">
            Perdeyi açmak için yukarıdaki butona dokunun.
          </div>
        ) : (
          card.forbidden_words.map((word, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.025 }}
              className="py-2.5 px-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-100 font-black text-center text-base sm:text-lg tracking-wide uppercase shadow-sm flex items-center justify-center hover:border-rose-500/50 transition-colors"
            >
              {word}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
