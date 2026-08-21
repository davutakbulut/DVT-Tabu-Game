'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Lock, 
  Unlock, 
  Clock, 
  RotateCcw, 
  Trophy, 
  Check, 
  Globe,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { soundManager } from '@/lib/audio';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const { guestName, guestId, userEmail } = useUserStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Room Info & Privacy
  const [roomTitle, setRoomTitle] = useState(guestName ? `${guestName}'in Tabu Odası` : 'Akşam Partisi Odası');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pin, setPin] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);

  // Step 2: Game Rules
  const [turnDuration, setTurnDuration] = useState(60);
  const [passLimit, setPassLimit] = useState(3);
  const [totalRounds, setTotalRounds] = useState(6);
  const [difficulty, setDifficulty] = useState('Tümü');

  // Step 3: Decks
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>(['deck-general']);

  // Step 4: Teams
  const [teamCount, setTeamCount] = useState(2);
  const [team1Name, setTeam1Name] = useState('Mavi Şimşekler');
  const [team2Name, setTeam2Name] = useState('Kırmızı Ejderler');
  const [team3Name, setTeam3Name] = useState('Yeşil Kasırga');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMessage(null);
      fetchDecks();
    }
  }, [isOpen]);

  const fetchDecks = async () => {
    try {
      const res = await fetch('/api/decks');
      if (res.ok) {
        const json = await res.json();
        if (json.decks && json.decks.length > 0) {
          setDecks(json.decks);
        }
      }
    } catch {}
  };

  const handleNext = () => {
    if (step === 1) {
      if (!roomTitle.trim()) {
        setErrorMessage('Lütfen bir oda başlığı belirleyin.');
        return;
      }
      if (isPrivate && (!pin || pin.length < 4)) {
        setErrorMessage('Özel oda için en az 4 haneli bir PIN kodu girin.');
        return;
      }
    }
    if (step === 3) {
      if (selectedDeckIds.length === 0) {
        setErrorMessage('Lütfen en az bir kelime destesi seçin.');
        return;
      }
    }

    setErrorMessage(null);
    soundManager.play('pass');
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMessage(null);

    const generatedCode = 'TABU' + Math.floor(10 + Math.random() * 90);
    const hostIdentifier = userEmail || guestId || 'guest_' + Date.now().toString(36);
    const hostDisplayName = guestName || 'Oda Kurucusu';

    const teams = [
      { id: 'team-1', name: team1Name, color: '#3b82f6', score: 0, players: [] },
      { id: 'team-2', name: team2Name, color: '#ef4444', score: 0, players: [] },
    ];
    if (teamCount === 3) {
      teams.push({ id: 'team-3', name: team3Name, color: '#10b981', score: 0, players: [] });
    }

    const payload = {
      code: generatedCode,
      title: roomTitle.trim(),
      host_id: hostIdentifier,
      host_name: hostDisplayName,
      is_private: isPrivate,
      pin: isPrivate ? pin : null,
      max_players: maxPlayers,
      settings: {
        ...DEFAULT_GAME_SETTINGS,
        turn_duration: turnDuration,
        pass_limit: passLimit,
        total_rounds: totalRounds,
        difficulty,
      },
      teams,
      players: [
        {
          id: hostIdentifier,
          name: hostDisplayName,
          is_host: true,
          team_id: 'team-1',
          avatar_color: '#6366f1',
        }
      ],
      selected_deck_ids: selectedDeckIds,
    };

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        soundManager.play('start');
        onClose();
        router.push(`/room/${generatedCode}`);
      } else {
        const json = await res.json();
        setErrorMessage(json.error || 'Oda oluşturulamadı.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[90vh]"
      >
        {/* Modal Header & Steps Progress */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Canlı Oyun Odası Kur</h3>
                <span className="text-[10px] text-slate-400">
                  Adım {step} / 4: {
                    step === 1 ? 'Oda & Güvenlik' :
                    step === 2 ? 'Oyun Kuralları' :
                    step === 3 ? 'Deste Seçimi' : 'Takımlar & Lobi'
                  }
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: ODA BİLGİLERİ & GİZLİLİK */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">Oda Başlığı:</label>
                <input
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="Örn: Cuma Gecesi Tabu Kapışması"
                  maxLength={30}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-black text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              {/* Private / PIN Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPrivate ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                    <div>
                      <span className="font-black text-white block">Özel / Şifreli Oda</span>
                      <span className="text-[10px] text-slate-400">Sadece PIN kodunu bilen arkadaşların katılabilir</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded accent-indigo-500 w-5 h-5 cursor-pointer"
                  />
                </div>

                {isPrivate && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">4 Haneli PIN:</span>
                    <input
                      type="password"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-center font-mono font-black text-amber-300 tracking-widest focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Max Players Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> Maksimum Oyuncu Kapasitesi
                  </label>
                  <span className="font-mono font-black text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md">
                    {maxPlayers} Kişi
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[4, 6, 8, 10, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxPlayers(num)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        maxPlayers === num
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OYUN KURALLARI & DİNAMİKLER */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {/* Tur Süresi */}
              <div>
                <label className="font-bold text-slate-300 flex items-center gap-1 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Anlatıcı Tur Süresi
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[30, 45, 60, 90].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setTurnDuration(sec)}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                        turnDuration === sec
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {sec} sn
                    </button>
                  ))}
                </div>
              </div>

              {/* Pas Hakkı */}
              <div>
                <label className="font-bold text-slate-300 flex items-center gap-1 mb-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Tur Başına Pas Hakkı
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 1, 2, 3, 99].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPassLimit(p)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        passLimit === p
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {p === 99 ? 'Sınırsız' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toplam Tur */}
              <div>
                <label className="font-bold text-slate-300 flex items-center gap-1 mb-1.5">
                  <Trophy className="w-3.5 h-3.5 text-purple-400" /> Toplam Tur Sayısı
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[4, 6, 8, 10].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTotalRounds(r)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        totalRounds === r
                          ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {r} Tur
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DESTE SEÇİMİ */}
          {step === 3 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-slate-400 text-[11px] mb-1">
                Oyun odasında hangi kelime destelerinin kullanılacağını seçin:
              </span>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {(decks.length > 0 ? decks : [
                  { id: 'deck-general', name: 'Genel Kültür & Gündelik Yaşam', card_count: 50, color: '#6366f1' },
                  { id: 'deck-cinema', name: 'Sinema, Dizi & Popüler Kültür', card_count: 35, color: '#ec4899' },
                  { id: 'deck-sports', name: 'Spor Arenası & Futbol', card_count: 30, color: '#10b981' },
                  { id: 'deck-tech', name: 'Teknoloji & Yapay Zeka', card_count: 25, color: '#06b6d4' },
                ]).map((d) => {
                  const isSelected = selectedDeckIds.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSelectedDeckIds((prev) =>
                          isSelected ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                        );
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: d.color || '#6366f1' }}
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-xs truncate block text-white">{d.name}</span>
                          <span className="text-[10px] text-slate-400">{d.card_count || '50+'} Kart</span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: TAKIMLAR & BAŞLATMA */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">Takım Sayısı:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[2, 3].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setTeamCount(cnt)}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                        teamCount === cnt
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {cnt} Takımlı Kapışma
                    </button>
                  ))}
                </div>
              </div>

              {/* Takım İsimleri */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-300 block">Takım İsimleri:</label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
                  <input
                    type="text"
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="bg-transparent font-black text-white text-xs flex-1 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0" />
                  <input
                    type="text"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="bg-transparent font-black text-white text-xs flex-1 focus:outline-none"
                  />
                </div>

                {teamCount === 3 && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                    <input
                      type="text"
                      value={team3Name}
                      onChange={(e) => setTeam3Name(e.target.value)}
                      className="bg-transparent font-black text-white text-xs flex-1 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {step > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={loading}
              className="text-xs font-bold py-2.5 px-4 bg-slate-900 border-slate-800 text-slate-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Geri
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              className="text-xs font-black py-2.5 px-5 rounded-xl"
            >
              <span>İlerle</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="success"
              size="md"
              onClick={handleCreateRoom}
              disabled={loading}
              className="text-xs font-black py-2.5 px-6 rounded-xl"
            >
              <Gamepad2 className="w-4 h-4 mr-1.5" />
              <span>{loading ? 'Oda Kuruluyor...' : 'Odayı Aç & Lobiye Geç'}</span>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
