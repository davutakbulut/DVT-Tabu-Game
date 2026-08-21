'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import { Play, RotateCcw, Trophy, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ActiveGameBanner() {
  const router = useRouter();
  const { gameState, teams, settings, resetGame, clearActiveGame } = useGameStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const hasActiveGame =
    gameState.status === 'in_progress' ||
    gameState.status === 'turn_break' ||
    gameState.status === 'starting';

  if (!hasActiveGame) return null;

  const activeTeam = teams[gameState.active_team_index] || teams[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-md mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl backdrop-blur-md flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider font-mono">
            Devam Eden Aktif Oyun
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 font-mono">
          Tur {gameState.current_round} / {settings.total_rounds}
        </span>
      </div>

      {/* Teams Score Bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: activeTeam?.color || '#3b82f6' }}
          />
          <span className="text-xs font-black text-white truncate">
            Sıra: {activeTeam?.name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-black shrink-0">
          {teams.map((t, idx) => (
            <span key={t.id} style={{ color: t.color }}>
              {t.score} {idx < teams.length - 1 ? '•' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="success"
          size="sm"
          onClick={() => router.push('/play')}
          className="flex-1 text-xs py-2.5 font-black flex items-center justify-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Kaldığın Yerden Devam Et</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm('Mevcut oyunu sıfırlamak istiyor musunuz?')) {
              resetGame();
              clearActiveGame();
            }
          }}
          className="text-[11px] text-slate-400 hover:text-rose-300 px-3"
          title="Oyunu Sıfırla"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Sıfırla
        </Button>
      </div>
    </motion.div>
  );
}
