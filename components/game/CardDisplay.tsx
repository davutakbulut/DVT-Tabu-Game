'use client';

import React, { useState } from 'react';
import { Card } from '@/types/game';
import { CATEGORY_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface CardDisplayProps {
  card: Card | null;
  isSpectator?: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, isSpectator = false }) => {
  const [isCurtainActive, setIsCurtainActive] = useState(false);

  if (!card) {
    return (
      <div className="w-full max-w-sm mx-auto h-[420px] rounded-3xl bg-slate-900/80 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-3">
        <ShieldAlert className="w-12 h-12 stroke-[1.5]" />
        <span className="text-sm font-medium">Sıradaki kart hazırlanıyor...</span>
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
      initial={{ scale: 0.94, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.94, opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative w-full max-w-sm mx-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Category Header */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${categoryStyle.badge}`}>
          {card.category}
        </span>
        <button
          onClick={() => setIsCurtainActive(!isCurtainActive)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
          title="Gözetleme Perdesi"
        >
          {isCurtainActive ? <Eye className="w-4 h-4 text-indigo-400" /> : <EyeOff className="w-4 h-4" />}
          <span>{isCurtainActive ? 'Aç' : 'Gizle'}</span>
        </button>
      </div>

      {/* Main Target Word Banner */}
      <div className="p-6 text-center bg-gradient-to-b from-indigo-950/40 to-transparent border-b border-slate-800/60 relative">
        {isCurtainActive ? (
          <div className="py-4 text-slate-500 font-bold text-lg italic">
            Kart Gizlendi 🔒
          </div>
        ) : (
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">
            {card.main_word}
          </h2>
        )}
      </div>

      {/* 5 Forbidden Words List */}
      <div className="p-5 flex-1 flex flex-col gap-2.5 bg-slate-950/40">
        <span className="text-[11px] font-bold uppercase tracking-widest text-red-400/80 text-center mb-1">
          🚫 Yasaklı Kelimeler 🚫
        </span>

        {isCurtainActive ? (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
            Perdeyi açmak için yukarıdaki butona dokunun.
          </div>
        ) : (
          card.forbidden_words.map((word, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="py-2.5 px-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-200 font-bold text-center text-base sm:text-lg tracking-wide uppercase shadow-sm"
            >
              {word}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
