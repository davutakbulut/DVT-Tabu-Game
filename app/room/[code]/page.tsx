'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { TeamManager } from '@/components/game/TeamManager';
import { RuleSettingsModal } from '@/components/game/RuleSettingsModal';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  ArrowLeft, 
  Copy, 
  Sliders, 
  Play, 
  Check, 
  ShieldCheck, 
  Lock, 
  Trash2, 
  AlertTriangle, 
  Crown,
  Home,
  LogOut,
  Users
} from 'lucide-react';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';
import { soundManager } from '@/lib/audio';

export default function RoomLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = ((params?.code as string) || 'TABU88').toUpperCase();
  const pinParam = searchParams.get('pin');

  const { currentRoom, players, teams, isHost, myPlayerId, setTeam, toggleReady, updateRoomSettings, createRoom } = useRoomStore();
  const { initializeGame, setGameMode } = useGameStore();
  const { guestName, guestId, userEmail } = useUserStore();

  const [roomData, setRoomData] = useState<any>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [closingRoom, setClosingRoom] = useState(false);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);
  const [closureMessage, setClosureMessage] = useState<string>('');

  const myIdentifier = userEmail || guestId || 'guest_local';

  // 1. Initial Room Sync & Polling Loop
  useEffect(() => {
    fetchRoomStatus();
    const interval = setInterval(fetchRoomStatus, 2500);
    return () => clearInterval(interval);
  }, [roomCode]);

  const fetchRoomStatus = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.room) {
          setRoomData(json.room);

          // Check if room was closed by admin or host
          if (json.room.status === 'closed_by_admin') {
            setClosureMessage(json.room.closure_reason || 'Bu oyun odası yönetici (Admin) tarafından sonlandırıldı.');
            setIsClosedModalOpen(true);
          } else if (json.room.status === 'closed_by_host' && json.room.host_id !== myIdentifier) {
            setClosureMessage(json.room.closure_reason || 'Bu oyun odası oda kurucusu tarafından kapatıldı ve dağıtıldı.');
            setIsClosedModalOpen(true);
          }
        }
      }
    } catch {}
  };

  const isUserHost = Boolean(
    roomData?.host_id === myIdentifier || 
    roomData?.host_name === guestName || 
    isHost
  );

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = () => {
    setGameMode('multiplayer');
    const settings = roomData?.settings || currentRoom?.settings || DEFAULT_GAME_SETTINGS;
    initializeGame(roomData?.teams || teams, settings);
    router.push('/play');
  };

  // Host closes room
  const handleHostCloseRoom = async () => {
    if (!confirm('Oyun odasını kapatmak ve tüm oyuncuları çıkarmak istediğinize emin misiniz?')) {
      return;
    }

    setClosingRoom(true);
    try {
      await fetch(`/api/rooms/${roomCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'closed_by_host',
          closure_reason: `${guestName || 'Oda Kurucusu'} odayı kapattı.`,
        }),
      });
      soundManager.play('tabu');
      router.push('/rooms');
    } catch {
      alert('Oda kapatılamadı.');
    } finally {
      setClosingRoom(false);
    }
  };

  const activePlayers = roomData?.players?.length > 0 ? roomData.players : (players.length > 0 ? players : [
    { id: myIdentifier, guest_name: guestName || 'Oyuncu 1', is_host: isUserHost, is_ready: true, team_id: 'team-1' }
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-lg mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => router.push('/rooms')}
          className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
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

        <div className="flex items-center gap-1.5">
          {isUserHost && (
            <button
              onClick={handleHostCloseRoom}
              disabled={closingRoom}
              className="p-2 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 transition-colors"
              title="Odayı Kapat & Dağıt"
            >
              <Trash2 className="w-5 h-5 text-rose-400" />
            </button>
          )}

          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Kuralları Değiştir"
          >
            <Sliders className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Lobby Content */}
      <div className="flex-1 flex flex-col gap-4 my-4">
        {/* Room Info Card */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs shadow-xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-black text-white text-sm truncate">
                {roomData?.title || currentRoom?.title || `${guestName}'in Tabu Odası`}
              </span>
              {roomData?.is_private && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            </div>
            <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <span>Kurucu: <strong className="text-slate-300">{roomData?.host_name || 'Host'}</strong></span>
              <span>•</span>
              <span>{roomData?.settings?.turn_duration || 60}s</span>
              <span>•</span>
              <span>{roomData?.settings?.pass_limit ?? 3} Pas</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isUserHost ? (
              <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 py-1 px-2.5 rounded-full text-[10px]">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Oda Yöneticisi
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 py-1 px-2.5 rounded-full text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Lobi Açık
              </span>
            )}
          </div>
        </div>

        {/* Team Manager */}
        <TeamManager
          teams={roomData?.teams || teams}
          players={activePlayers}
          myPlayerId={myIdentifier}
          onSelectTeam={(tId) => setTeam(myIdentifier, tId)}
          onToggleReady={() => toggleReady(myIdentifier)}
        />
      </div>

      {/* Footer Controls: Start Game or Exit */}
      <div className="pt-2 border-t border-slate-900 flex flex-col gap-2">
        {isUserHost ? (
          <button
            onClick={handleStartGame}
            className="w-full py-4 rounded-2xl btn-3d-emerald text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] transition-transform"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Oyunu Başlat!</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-xs font-bold text-slate-300">
            Oda kurucusunun oyunu başlatması bekleniyor...
          </div>
        )}
      </div>

      {/* Rule Settings Drawer */}
      <RuleSettingsModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        initialSettings={roomData?.settings || currentRoom?.settings || DEFAULT_GAME_SETTINGS}
        onSave={(newSet) => updateRoomSettings(newSet)}
      />

      {/* ROOM CLOSED BY ADMIN / HOST NOTIFICATION POPUP */}
      <Modal
        isOpen={isClosedModalOpen}
        onClose={() => {
          setIsClosedModalOpen(false);
          router.push('/');
        }}
        title="Oyun Odası Kapatıldı"
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="p-3.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-base font-black text-white">
              Bu Oda Sonlandırıldı
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {closureMessage || 'Bu oyun odası yönetici tarafından kapatıldı.'}
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              setIsClosedModalOpen(false);
              router.push('/');
            }}
            className="bg-indigo-600 hover:bg-indigo-500 font-black text-xs py-3"
          >
            <Home className="w-4 h-4 mr-1.5" />
            <span>Anladım, Ana Sayfaya Dön</span>
          </Button>
        </div>
      </Modal>
    </div>
  );
}
