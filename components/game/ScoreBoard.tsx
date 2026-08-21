'use client';

import React from 'react';
import { Team } from '@/types/game';
import { Trophy } from 'lucide-react';
import { clsx } from 'clsx';

interface ScoreBoardProps {
  teams: Team[];
  activeTeamId: string;
  currentRound: number;
  totalRounds: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  teams,
  activeTeamId,
  currentRound,
  totalRounds,
}) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800/60 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Tur {Math.min(currentRound, totalRounds)} / {totalRounds}
        </span>
        <span className="text-slate-500 font-medium">Tabu Arenası</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {teams.map((team) => {
          const isActive = team.id === activeTeamId;
          return (
            <div
              key={team.id}
              className={clsx(
                'py-2 px-3 rounded-xl border flex flex-col items-center transition-all',
                isActive
                  ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-70'
              )}
              style={isActive ? { borderColor: team.color, boxShadow: `0 4px 14px ${team.color}33` } : undefined}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-[11px] font-black text-slate-200 truncate max-w-[70px]">
                  {team.name}
                </span>
              </div>
              <span className="text-xl font-black text-white">{team.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
