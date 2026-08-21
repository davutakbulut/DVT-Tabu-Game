'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { PaywallModal } from '@/components/monetization/PaywallModal';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RotateCcw, Home, Share2, Award, Check, Crown } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { AiMatchSummary } from '@/types/game';

export default function SummaryPage() {
  const router = useRouter();
  const { teams, resetGame, gameState } = useGameStore();
  const { totalGamesPlayed, incrementGamesPlayed, isProUser } = useUserStore();

  const [aiSummary, setAiSummary] = useState<AiMatchSummary | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];

  // Increment game count & track analytics
  useEffect(() => {
    analytics.pageView('/summary');
    const newCount = incrementGamesPlayed();
    analytics.gameFinish(winner?.score || 0, gameState.total_rounds, newCount);

    // If 2 or more games played and not pro user, trigger paywall with 1.8s delay
    if (newCount >= 2 && !isProUser) {
      const timer = setTimeout(() => {
        setIsPaywallOpen(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fireworks confetti celebration
  useEffect(() => {
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Fetch Gemini AI Match Commentary
  useEffect(() => {
    const fetchAiCommentary = async () => {
      setLoadingAi(true);
      try {
        const res = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'post_game_analysis',
            context: {
              game_data: {
                teams: sortedTeams,
                total_turns: gameState.turn_history.length,
                winner: winner?.name,
              },
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.error) {
            setAiSummary(data);
          }
        }
      } catch {
        // Fallback AI summary
        setAiSummary({
          match_headline: 'NEFES KESEN DERBİ: KELİME CANAVARLARI SAHNEDE!',
          commentary: `${winner?.name} kusursuz takım iletişimi ve hızlı pas stratejisiyle hak edilmiş bir şampiyonluk kazandı!`,
          mvp_spotlight: `${winner?.name} takımının anlatıcıları gecenin tartışmasız yıldızı oldu.`,
          key_takeaways: [
            'Rakip takım: Tabu yasaklarına dikkat ederek daha az ceza puanı alabilir.',
            'Kazanan takım: Pas haklarını dengeli kullanarak tempoyu kontrol altında tuttu.'
          ]
        });
      } finally {
        setLoadingAi(false);
      }
    };

    fetchAiCommentary();
  }, []);

  const handleShare = () => {
    const text = `DVT Tabu Game Şampiyonu: ${winner?.name} (${winner?.score} Puan)! Sen de arkadaşlarınla hemen Tabu oyna!`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'DVT Tabu Game', text, url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    router.push('/play');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-lg mx-auto w-full">
      {/* Top Banner */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
          <Trophy className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 block">
          Oyun Tamamlandı
        </span>
        <h1 className="text-3xl font-black text-white mt-1 inline-flex items-center justify-center gap-2">
          <span>{winner?.name} Kazandı!</span>
          <Crown className="w-7 h-7 text-amber-400 fill-amber-400 inline" />
        </h1>
      </div>

      <div className="flex-1 flex flex-col gap-4 my-2">
        {/* Podium Scores */}
        <div className="flex flex-col gap-2">
          {sortedTeams.map((team, idx) => (
            <div
              key={team.id}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                idx === 0
                  ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                  idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{idx + 1}
                </span>
                <div>
                  <span className="font-bold text-white text-sm block">{team.name}</span>
                  <span className="text-[11px] text-slate-400">Takım Skoru</span>
                </div>
              </div>
              <span className="text-2xl font-black text-white">{team.score} P</span>
            </div>
          ))}
        </div>

        {/* Gemini AI Match Commentary Box */}
        <div className="p-4 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Gemini AI Maç Spikeri Raporu
            </span>
          </div>

          {loadingAi ? (
            <div className="py-4 text-center text-xs text-indigo-300 animate-pulse">
              Yapay zeka maç istatistiklerini ve MVP'yi analiz ediyor...
            </div>
          ) : aiSummary ? (
            <div className="flex flex-col gap-2 text-xs">
              <span className="font-black text-white text-sm">
                {aiSummary.match_headline}
              </span>
              <p className="text-indigo-200/90 leading-relaxed">
                {aiSummary.commentary}
              </p>
              {aiSummary.mvp_spotlight && (
                <div className="flex items-center gap-1.5 mt-1 text-amber-300 font-semibold">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{aiSummary.mvp_spotlight}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-900">
        <Button variant="primary" size="xl" fullWidth onClick={handlePlayAgain}>
          <RotateCcw className="w-5 h-5 mr-2" />
          Yeniden Oyna
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="md" onClick={handleShare}>
            {copied ? <Check className="w-4 h-4 text-emerald-400 mr-1.5" /> : <Share2 className="w-4 h-4 mr-1.5" />}
            {copied ? 'Kopyalandı!' : 'Skoru Paylaş'}
          </Button>
          <Button variant="ghost" size="md" onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-1.5" /> Ana Sayfa
          </Button>
        </div>
      </div>

      {/* 2 Games Played Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        triggerSource="after_2_games"
      />
    </div>
  );
}
