'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useTimer } from '@/hooks/useTimer';
import { useWakeLock } from '@/hooks/useWakeLock';
import { CardDisplay } from '@/components/game/CardDisplay';
import { GameControls } from '@/components/game/GameControls';
import { ScoreBoard } from '@/components/game/ScoreBoard';
import { Timer } from '@/components/game/Timer';
import { Button } from '@/components/ui/Button';
import { Play, Pause, RotateCcw, AlertTriangle, ArrowRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayPage() {
  const router = useRouter();
  const {
    gameState,
    teams,
    settings,
    isGoldenRound,
    startTurn,
    recordCorrect,
    recordPass,
    recordBuzzer,
    recordTimeout,
    endTurnAndNext,
    resetGame,
  } = useGameStore();

  const [isPaused, setIsPaused] = useState(false);

  // Active turn timer
  const { timeRemaining, resetTimer } = useTimer({
    duration: settings.turn_duration,
    isRunning: gameState.status === 'in_progress' && !isPaused,
    onTimeout: () => {
      recordTimeout();
    },
  });

  // Keep screen on during active gameplay
  useWakeLock(gameState.status === 'in_progress');

  // Handle game finish
  useEffect(() => {
    if (gameState.status === 'finished') {
      router.push('/summary');
    }
  }, [gameState.status, router]);

  const activeTeam = teams[gameState.active_team_index] || teams[0];

  return (
    <div className="min-h-screen flex flex-col justify-between p-3 sm:p-4 max-w-lg mx-auto w-full select-none">
      {/* Top HUD: Round info + Timer + Pause button */}
      <header className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 rounded-full animate-pulse"
            style={{ backgroundColor: activeTeam?.color || '#6366f1' }}
          />
          <span className="text-sm font-extrabold text-white truncate max-w-[130px]">
            {activeTeam?.name}
          </span>
        </div>

        {gameState.status === 'in_progress' && (
          <Timer timeRemaining={timeRemaining} totalDuration={settings.turn_duration} />
        )}

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          title="Duraklat"
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
        </button>
      </header>

      {/* Score Overview */}
      <ScoreBoard
        teams={teams}
        activeTeamId={gameState.active_team_id}
        currentRound={gameState.current_round}
        totalRounds={gameState.total_rounds}
      />

      {/* Main Game Arena / Center View */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 relative">
        {/* Golden Round Notice */}
        {isGoldenRound && (
          <div className="mb-2 py-1 px-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5 animate-bounce">
            <Trophy className="w-3.5 h-3.5" /> ALTIN TUR (Beraberlik Eşitliği)
          </div>
        )}

        {/* State A: Starting / Ready Screen */}
        {gameState.status === 'starting' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center flex flex-col items-center gap-4 shadow-2xl"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg"
              style={{ backgroundColor: activeTeam?.color || '#6366f1' }}
            >
              {gameState.active_team_index + 1}
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Sıradaki Takım
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {activeTeam?.name}
              </h2>
            </div>

            <p className="text-xs text-slate-400 max-w-xs">
              Cihazı anlatıcı oyuncuya verin. Hazır olduğunuzda başlat butonuna dokunun!
            </p>

            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={() => {
                resetTimer(settings.turn_duration);
                startTurn();
              }}
              className="shadow-indigo-500/30"
            >
              <Play className="w-6 h-6 fill-white mr-2" />
              Süreyi Başlat ({settings.turn_duration}s)
            </Button>
          </motion.div>
        )}

        {/* State B: In Progress Screen */}
        {gameState.status === 'in_progress' && (
          <div className="w-full flex flex-col items-center gap-3">
            <CardDisplay card={gameState.current_card} />
          </div>
        )}

        {/* State C: Turn Break / Buzzer / Timeout Screen */}
        {gameState.status === 'turn_break' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center flex flex-col items-center gap-4 shadow-2xl"
          >
            {gameState.buzzer_locked_by ? (
              <div className="p-3 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                <AlertTriangle className="w-10 h-10" />
              </div>
            ) : (
              <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Trophy className="w-10 h-10" />
              </div>
            )}

            <div>
              <h3 className="text-xl font-black text-white">
                {gameState.buzzer_locked_by ? 'TABU / YASAKLI KELİME!' : 'Süre Doldu! ⏱️'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {gameState.buzzer_locked_by
                  ? `${activeTeam?.name} takımı yasaklı kelime cezası aldı (${settings.buzzer_penalty} Puan).`
                  : `${activeTeam?.name} turunu tamamladı.`}
              </p>
            </div>

            <div className="w-full py-3 px-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex justify-between text-sm font-bold">
              <span className="text-slate-400">Mevcut Skor:</span>
              <span className="text-white font-extrabold">{activeTeam?.score} Puan</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={endTurnAndNext}
            >
              Sonraki Takıma Geç <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <footer className="pt-2">
        {gameState.status === 'in_progress' ? (
          <GameControls
            onCorrect={recordCorrect}
            onPass={recordPass}
            onBuzzer={() => recordBuzzer()}
            remainingPasses={gameState.remaining_passes}
          />
        ) : (
          <div className="h-14 flex items-center justify-center text-xs text-slate-500">
            DVT Tabu Game • Canlı Maç Arenası
          </div>
        )}
      </footer>

      {/* Pause Modal */}
      <AnimatePresence>
        {isPaused && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xs w-full text-center flex flex-col gap-4">
              <h3 className="text-lg font-black text-white">Oyun Duraklatıldı</h3>
              <p className="text-xs text-slate-400">Nefeslenin ve hazır olunca devam edin.</p>

              <div className="flex flex-col gap-2 pt-2">
                <Button variant="primary" fullWidth onClick={() => setIsPaused(false)}>
                  Devam Et
                </Button>
                <Button variant="ghost" fullWidth onClick={() => router.push('/')}>
                  Ana Ekrana Dön
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
