'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { useTimer } from '@/hooks/useTimer';
import { useWakeLock } from '@/hooks/useWakeLock';
import { CardDisplay } from '@/components/game/CardDisplay';
import { GameControls } from '@/components/game/GameControls';
import { ScoreBoard } from '@/components/game/ScoreBoard';
import { Timer } from '@/components/game/Timer';
import { Button } from '@/components/ui/Button';
import { InterstitialAdModal } from '@/components/ads/InterstitialAdModal';
import { Play, Pause, RotateCcw, AlertTriangle, ArrowRight, Trophy, CheckCircle2, FastForward, AlertOctagon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdConfig, DEFAULT_AD_CONFIG } from '@/types/ads';

export default function PlayPage() {
  const router = useRouter();
  const { isProUser } = useUserStore();
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
  const [adConfig, setAdConfig] = useState<AdConfig>(DEFAULT_AD_CONFIG);
  const [turnsPlayed, setTurnsPlayed] = useState(0);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  // Fetch live ad config
  useEffect(() => {
    fetch('/api/ads')
      .then((res) => res.json())
      .then((json) => {
        if (json.config) setAdConfig(json.config);
      })
      .catch(() => {});
  }, []);

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

  const activePresenterName = useMemo(() => {
    if (!activeTeam?.players || activeTeam.players.length === 0) return null;
    const playerIdx = (Math.floor(gameState.current_round - 1)) % activeTeam.players.length;
    return activeTeam.players[playerIdx];
  }, [activeTeam, gameState.current_round]);

  const handleNextTeam = () => {
    const nextTurn = turnsPlayed + 1;
    setTurnsPlayed(nextTurn);

    const isAdFree = isProUser && adConfig.pro_users_ad_free;
    const shouldTriggerAd =
      adConfig.ads_enabled &&
      !isAdFree &&
      adConfig.interval_turns > 0 &&
      nextTurn % adConfig.interval_turns === 0;

    if (shouldTriggerAd) {
      setIsAdModalOpen(true);
    } else {
      endTurnAndNext();
    }
  };

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
              {activePresenterName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎤 Sıradaki Anlatıcı: <strong className="text-white">{activePresenterName}</strong></span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 max-w-xs">
              Cihazı anlatıcı oyuncuya verin. Hazır olduğunuzda başlat butonuna dokunun!
            </p>

            <button
              type="button"
              onClick={() => {
                resetTimer(settings.turn_duration);
                startTurn();
              }}
              className="w-full py-4.5 rounded-2xl btn-3d-emerald text-white font-black text-lg shadow-xl flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6 fill-white drop-shadow" />
              Süreyi Başlat ({settings.turn_duration}s)
            </button>
          </motion.div>
        )}

        {/* State B: In Progress Screen */}
        {gameState.status === 'in_progress' && (
          <div className="w-full flex flex-col items-center gap-3">
            <CardDisplay card={gameState.current_card} />
          </div>
        )}

        {/* State C: Turn Break / Timeout Screen */}
        {gameState.status === 'turn_break' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center flex flex-col items-center gap-4 shadow-2xl"
          >
            <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                Süre Doldu! ⏱️
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeTeam?.name} bu turdaki süresini tamamladı.
              </p>
            </div>

            {/* Tur Özeti Sayaçları */}
            <div className="w-full grid grid-cols-3 gap-2 py-3 px-2 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="flex flex-col items-center">
                <span className="text-emerald-400 font-black text-lg">{gameState.turn_correct_count}</span>
                <span className="text-slate-400 text-[10px]">Doğru (+{gameState.turn_correct_count * settings.correct_points})</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-800">
                <span className="text-amber-400 font-black text-lg">{gameState.turn_pass_count}</span>
                <span className="text-slate-400 text-[10px]">Pas</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-red-400 font-black text-lg">{gameState.turn_tabu_count}</span>
                <span className="text-slate-400 text-[10px]">Tabu ({gameState.turn_tabu_count * settings.buzzer_penalty})</span>
              </div>
            </div>

            <div className="w-full py-2 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex justify-between text-xs font-bold">
              <span className="text-slate-400">Takımın Toplam Skoru:</span>
              <span className="text-white font-extrabold">{activeTeam?.score} Puan</span>
            </div>

            <button
              type="button"
              onClick={handleNextTeam}
              className="w-full py-4 rounded-2xl btn-3d-indigo text-white font-black text-base shadow-xl flex items-center justify-center gap-2"
            >
              <span>Sonraki Takıma Geç</span>
              <ArrowRight className="w-5 h-5" />
            </button>
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
            remainingTabus={gameState.remaining_tabus}
            tabuLimit={settings.tabu_limit}
            correctCount={gameState.turn_correct_count}
            passCount={gameState.turn_pass_count}
            tabuCount={gameState.turn_tabu_count}
            penaltyPoints={settings.buzzer_penalty}
            correctPoints={settings.correct_points}
          />
        ) : (
          <div className="h-14 flex items-center justify-center text-xs text-slate-500">
            DVT Tabu Game • Canlı Maç Arenası
          </div>
        )}
      </footer>

      {/* Interstitial Ad Modal */}
      <InterstitialAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdFinished={() => endTurnAndNext()}
        placement="turn_break"
      />

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
