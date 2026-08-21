'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoomStore } from '@/stores/roomStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  KeyRound, 
  Lock, 
  Search, 
  Users, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Globe, 
  Radio, 
  ShieldCheck,
  Zap,
  Gamepad2
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CreateRoomModal } from '@/components/rooms/CreateRoomModal';

export default function RoomsPage() {
  const router = useRouter();
  const { guestName } = useUserStore();

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const json = await res.json();
        if (json.rooms && Array.isArray(json.rooms)) {
          // Filter out closed rooms
          const active = json.rooms.filter((r: any) => r.status === 'waiting' || r.status === 'in_progress');
          setRooms(active);
        }
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 5) {
      setErrorMessage('Lütfen geçerli bir oda kodu girin.');
      return;
    }
    router.push(`/room/${cleanCode}`);
  };

  const handleDirectJoin = (room: any) => {
    if (room.is_private) {
      setSelectedRoom(room);
      setPinCode('');
      setErrorMessage('');
      setIsPinModalOpen(true);
    } else {
      router.push(`/room/${room.code}`);
    }
  };

  const handlePinSubmit = () => {
    if (!pinCode || pinCode.length < 4) {
      setErrorMessage('PIN kodu en az 4 haneli olmalıdır.');
      return;
    }
    if (selectedRoom?.pin && selectedRoom.pin !== pinCode) {
      setErrorMessage('Girdiğiniz PIN kodu hatalı.');
      return;
    }
    setIsPinModalOpen(false);
    router.push(`/room/${selectedRoom.code}?pin=${pinCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-lg mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-white leading-tight flex items-center gap-2">
              <span>Çok Oyunculu Odalar</span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Canlı
              </span>
            </h2>
            <span className="text-xs text-slate-400">Arkadaşlarınla oda kur veya katıl</span>
          </div>
        </div>

        <button
          onClick={fetchRooms}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Yenile"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-5 my-4">
        {/* Giant Primary Action: ODA KUR */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full p-4 rounded-3xl btn-3d-indigo text-white font-black text-base flex items-center justify-between shadow-xl active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-2xl bg-white/20 text-white shadow-md">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-black block leading-tight">YENİ OYUN ODASI KUR</span>
              <span className="text-xs text-indigo-200 font-normal">Kendi kuralların ve destenle oda aç</span>
            </div>
          </div>
          <Zap className="w-5 h-5 text-amber-300 fill-amber-300 mr-2" />
        </button>

        {/* Code Search Box */}
        <form onSubmit={handleJoinWithCode} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-2.5">
          <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Oda Kodu ile Hızlı Katıl
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Örn: TABU01"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMessage('');
              }}
              maxLength={8}
              className="bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-center font-mono font-black text-lg tracking-widest text-white uppercase flex-1 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <Button variant="primary" size="lg" type="submit" className="py-3 px-5 text-xs font-black">
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
              Aktif Odalar ({rooms.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Anlık Liste
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {rooms.length > 0 ? (
              rooms.map((r) => {
                const isFull = (r.players?.length || 0) >= (r.max_players || 8);

                return (
                  <div
                    key={r.code || r.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-lg"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white truncate">{r.title}</span>
                        {r.is_private && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {r.code}
                        </span>
                        <span>•</span>
                        <span className={isFull ? 'text-rose-400 font-bold' : ''}>
                          {r.players?.length || 0}/{r.max_players || 8} Oyuncu
                        </span>
                        <span>•</span>
                        <span>{r.settings?.turn_duration || 60}s</span>
                      </div>
                    </div>

                    <Button
                      variant={r.is_private ? 'outline' : 'primary'}
                      size="sm"
                      disabled={isFull}
                      onClick={() => handleDirectJoin(r)}
                      className="text-xs font-bold py-2 px-3.5 shrink-0"
                    >
                      {isFull ? 'Dolu' : r.is_private ? 'PIN ile Gir' : 'Katıl'}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center flex flex-col items-center gap-2">
                <Gamepad2 className="w-8 h-8 text-slate-600" />
                <span className="text-xs font-bold text-slate-400">Şu anda açık oda bulunmuyor.</span>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-xs font-black text-indigo-400 hover:underline mt-1"
                >
                  İlk odayı sen kur!
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Wizard Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchRooms();
        }}
      />

      {/* PIN Enter Modal */}
      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} title="Oda Şifresi (PIN)">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-300">
            <strong>{selectedRoom?.title}</strong> odası şifrelidir. Katılmak için lütfen 4 haneli PIN kodunu girin:
          </p>
          <input
            type="password"
            placeholder="****"
            maxLength={6}
            value={pinCode}
            onChange={(e) => {
              setPinCode(e.target.value);
              setErrorMessage('');
            }}
            className="bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-center font-mono font-black text-2xl tracking-widest text-amber-300 focus:outline-none focus:border-amber-500"
          />
          {errorMessage && (
            <span className="text-xs font-bold text-red-400 text-center">{errorMessage}</span>
          )}
          <Button variant="primary" fullWidth onClick={handlePinSubmit} className="font-black">
            Odaya Giriş Yap
          </Button>
        </div>
      </Modal>
    </div>
  );
}
