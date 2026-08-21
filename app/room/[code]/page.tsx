'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { TeamManager } from '@/components/game/TeamManager';
import { RuleSettingsModal } from '@/components/game/RuleSettingsModal';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Copy, Sliders, Play, Check, ShieldCheck, Lock } from 'lucide-react';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';

export default function RoomLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = ((params?.code as string) || 'TABU88').toUpperCase();
  const pinParam = searchParams.get('pin');

  const { currentRoom, players, teams, isHost, myPlayerId, setTeam, toggleReady, updateRoomSettings, createRoom, joinRoom } = useRoomStore();
  const { initializeGame, setGameMode } = useGameStore();
  const { guestName } = useUserStore();

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const initializedRef = useRef(false);

  // Auto-initialize room once if navigating directly to /room/[code]
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!currentRoom || currentRoom.code !== roomCode) {
      // Mock room titles based on code
      const titles: Record<string, string> = {
        TABU01: 'Akşam Partisi Odası',
        TABU99: 'Pro Tabu Kapışması',
        NOSTAL: '90lar & 2000ler Gecesi',
      };
      const title = titles[roomCode] || `${guestName || 'Misafir'}'in Tabu Odası`;
      const isPrivate = roomCode === 'TABU99' || Boolean(pinParam);
      
      createRoom(
        title, 
        isPrivate, 
        pinParam || (roomCode === 'TABU99' ? '1234' : undefined),
        undefined,
        roomCode
      );
    }
  }, [roomCode, pinParam, guestName, createRoom]);

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = () => {
    setGameMode('multiplayer');
    const settings = currentRoom?.settings || DEFAULT_GAME_SETTINGS;
    initializeGame(teams, settings);
    router.push('/play');
  };

  const activePlayers = players.length > 0 ? players : [
    { id: 'p-1', guest_name: guestName || 'Oyuncu 1', is_host: true, is_ready: true, is_presenter: true, team_id: 'team-blue' },
    { id: 'p-2', guest_name: 'Misafir 2', is_host: false, is_ready: true, is_presenter: false, team_id: 'team-red' }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-lg mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => router.push('/rooms')}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Oda Kodu</span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 font-mono font-black text-xl text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20"
          >
            {roomCode}
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        <button
          onClick={() => setIsRuleModalOpen(true)}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Kuralları Değiştir"
        >
          <Sliders className="w-5 h-5 text-indigo-400" />
        </button>
      </div>

      {/* Lobby Content */}
      <div className="flex-1 flex flex-col gap-5 my-4">
        {/* Room Info Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {currentRoom?.title || `${guestName}'in Tabu Odası`}
              </span>
              {currentRoom?.is_private && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <span className="text-slate-400 mt-0.5 block">
              {currentRoom?.settings?.turn_duration || 60}sn • {currentRoom?.settings?.pass_limit || 3} Pas • {currentRoom?.settings?.total_rounds || 6} Tur
            </span>
          </div>
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 py-1 px-2.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Lobi Açık
          </span>
        </div>

        {/* Team Manager */}
        <TeamManager
          teams={teams}
          players={activePlayers}
          myPlayerId={myPlayerId}
          onSelectTeam={(tId) => setTeam(myPlayerId, tId)}
          onToggleReady={() => toggleReady(myPlayerId)}
        />
      </div>

      {/* Footer / Start Game */}
      <div className="pt-2 border-t border-slate-900">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={handleStartGame}
          className="shadow-indigo-500/30"
        >
          <Play className="w-6 h-6 fill-white mr-2" />
          Oyunu Başlat!
        </Button>
      </div>

      {/* Rule Settings Drawer */}
      <RuleSettingsModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        initialSettings={currentRoom?.settings || DEFAULT_GAME_SETTINGS}
        onSave={(newSet) => updateRoomSettings(newSet)}
      />
    </div>
  );
}
