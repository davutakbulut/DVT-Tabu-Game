'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  History, 
  Trophy, 
  X, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertOctagon, 
  RotateCcw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestId?: string;
  userId?: string;
}

export function GameHistoryModal({ isOpen, onClose, guestId, userId }: GameHistoryModalProps) {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, guestId, userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const gId = guestId || (typeof window !== 'undefined' ? localStorage.getItem('dvt_tabu_guest_id') : null);
      const params = new URLSearchParams();
      if (userId) params.set('userId', userId);
      else if (gId) params.set('guestId', gId);
      params.set('limit', '30');

      const res = await fetch(`/api/games?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setGames(json.games || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Oyun Geçmişi & Maçlarım</h3>
              <span className="text-[10px] text-slate-400">Oynadığınız tüm maçlar ve sonuçları</span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Maç geçmişi yükleniyor...</div>
          ) : games.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-2">
              <Trophy className="w-8 h-8 text-slate-600" />
              <p className="text-xs text-slate-400 font-bold">Henüz tamamlanmış bir maçınız yok.</p>
              <span className="text-[10px] text-slate-500">İlk oyununuzu başlatın ve arenaya girin!</span>
            </div>
          ) : (
            games.map((g) => {
              const dateStr = new Date(g.created_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={g.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      g.status === 'finished'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : g.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {g.status === 'finished' && <Trophy className="w-2.5 h-2.5" />}
                      {g.status === 'in_progress' && <Clock className="w-2.5 h-2.5" />}
                      <span>{g.status === 'finished' ? 'Tamamlandı' : g.status === 'in_progress' ? 'Devam Ediyor' : 'Yarıda Bırakıldı'}</span>
                    </span>
                  </div>

                  {/* Teams & Scores */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                      {g.winner_team_name ? (
                        <div className="flex items-center gap-1 text-amber-400 font-extrabold text-xs">
                          <Trophy className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Kazanan: {g.winner_team_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-300">
                          {g.teams?.length || 2} Takımlı Kapışma
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs font-black">
                      {(g.teams || []).map((t: any, idx: number) => (
                        <span key={t.id || idx} style={{ color: t.color || '#fff' }}>
                          {t.name?.split(' ')[0]}: {t.score} {idx < g.teams.length - 1 ? '•' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats Mini Grid */}
                  <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono text-slate-400">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{g.total_correct || 0} Doğru</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 border-x border-slate-800">
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>{g.total_pass || 0} Pas</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-red-400" />
                      <span>{g.total_tabu || 0} Tabu</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}
