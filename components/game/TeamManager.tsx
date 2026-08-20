'use client';

import React from 'react';
import { Player, Team } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Users, CheckCircle2, Circle } from 'lucide-react';

interface TeamManagerProps {
  teams: Team[];
  players: Player[];
  myPlayerId: string;
  onSelectTeam: (teamId: string) => void;
  onToggleReady: () => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({
  teams,
  players,
  myPlayerId,
  onSelectTeam,
  onToggleReady,
}) => {
  const myPlayer = players.find((p) => p.id === myPlayerId);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          Takımlar ve Oyuncular
        </h3>
        <span className="text-xs text-slate-500">{players.length} Oyuncu Lobi'de</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {teams.map((team) => {
          const teamPlayers = players.filter((p) => p.team_id === team.id);
          const isMyTeam = myPlayer?.team_id === team.id;

          return (
            <div
              key={team.id}
              className={`p-4 rounded-2xl border transition-all ${
                isMyTeam
                  ? 'bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                  <span className="text-sm font-bold text-slate-100">{team.name}</span>
                </div>
                {!isMyTeam && (
                  <button
                    onClick={() => onSelectTeam(team.id)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 py-1 px-2 rounded-lg bg-indigo-500/10"
                  >
                    Katıl
                  </button>
                )}
              </div>

              {/* Player list */}
              <div className="flex flex-col gap-1.5 min-h-[50px]">
                {teamPlayers.length === 0 ? (
                  <span className="text-xs text-slate-500 italic py-2">Henüz oyuncu yok</span>
                ) : (
                  teamPlayers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-300 font-medium">
                        {p.guest_name} {p.id === myPlayerId && '(Sen)'}
                      </span>
                      {p.is_ready ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hazır
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Circle className="w-3.5 h-3.5" /> Bekliyor
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {myPlayer && (
        <div className="pt-2">
          <Button
            variant={myPlayer.is_ready ? 'outline' : 'success'}
            fullWidth
            onClick={onToggleReady}
          >
            {myPlayer.is_ready ? 'Hazır Durumunu İptal Et' : 'Hazırım! Oyunu Başlatmaya Hazır'}
          </Button>
        </div>
      )}
    </div>
  );
};
