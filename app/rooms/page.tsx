'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoomStore } from '@/stores/roomStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, KeyRound, Lock, Search, Users, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function RoomsPage() {
  const router = useRouter();
  const { currentRoom, joinRoom } = useRoomStore();
  const { guestName } = useUserStore();

  const [code, setCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedRoomCode, setSelectedRoomCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setErrorMessage('Oda kodu 6 haneli olmalıdır.');
      return;
    }
    router.push(`/room/${cleanCode}`);
  };

  const handleDirectJoin = (roomCode: string, isPrivate: boolean) => {
    if (isPrivate) {
      setSelectedRoomCode(roomCode);
      setIsPinModalOpen(true);
    } else {
      router.push(`/room/${roomCode}`);
    }
  };

  const handlePinSubmit = () => {
    if (pinCode.length !== 4) {
      setErrorMessage('PIN 4 haneli olmalıdır.');
      return;
    }
    router.push(`/room/${selectedRoomCode}?pin=${pinCode}`);
  };

  // Mock available rooms for instant discovery
  const mockRooms = [
    { code: 'TABU01', title: 'Akşam Partisi Odası', players: 4, maxPlayers: 8, isPrivate: false, duration: 60 },
    { code: 'TABU99', title: 'Pro Tabu Kapışması', players: 2, maxPlayers: 6, isPrivate: true, duration: 45 },
    { code: 'NOSTAL', title: '90lar & 2000ler Gecesi', players: 3, maxPlayers: 8, isPrivate: false, duration: 90 },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 py-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => router.push('/')}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-black text-white leading-tight">Oyun Odaları</h2>
          <span className="text-xs text-indigo-400">Canlı Odalara Katıl</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5 my-5">
        {/* Code Search Box */}
        <form onSubmit={handleJoinWithCode} className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-400">6 Haneli Oda Kodu ile Katıl</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Örn: TABU88"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMessage('');
              }}
              maxLength={6}
              className="bg-slate-900 border border-slate-800 rounded-2xl py-3.5 px-4 text-center font-mono font-black text-lg tracking-widest text-white uppercase flex-1 focus:outline-none focus:border-indigo-500"
            />
            <Button variant="primary" size="lg" type="submit">
              Katıl
            </Button>
          </div>
          {errorMessage && (
            <span className="text-xs font-bold text-red-400">{errorMessage}</span>
          )}
        </form>

        {/* Available Rooms List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Açık Oyun Odaları
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold py-0.5 px-2 rounded-full">
              Canlı
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {mockRooms.map((r) => (
              <div
                key={r.code}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{r.title}</span>
                    {r.isPrivate && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-mono font-bold text-indigo-400">{r.code}</span>
                    <span>•</span>
                    <span>{r.players}/{r.maxPlayers} Oyuncu</span>
                    <span>•</span>
                    <span>{r.duration}sn</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDirectJoin(r.code, r.isPrivate)}
                >
                  {r.isPrivate ? 'PIN ile Gir' : 'Katıl'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} title="Oda Şifresi (PIN)">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-300">
            Bu oda şifrelidir. Katılmak için lütfen 4 haneli PIN kodunu girin:
          </p>
          <input
            type="password"
            placeholder="****"
            maxLength={4}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-center font-mono font-black text-2xl tracking-widest text-white focus:outline-none focus:border-indigo-500"
          />
          <Button variant="primary" fullWidth onClick={handlePinSubmit}>
            Giriş Yap
          </Button>
        </div>
      </Modal>
    </div>
  );
}
