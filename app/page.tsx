'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useRoomStore } from '@/stores/roomStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { AiDailyBanner } from '@/components/ai/AiDailyBanner';
import { DeckGeneratorModal } from '@/components/ai/DeckGeneratorModal';
import { RuleSettingsModal } from '@/components/game/RuleSettingsModal';
import { 
  Play, 
  Users, 
  Sparkles, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Flame, 
  HelpCircle,
  Trophy,
  ShieldAlert
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { Card } from '@/types/game';

export default function HomePage() {
  const router = useRouter();
  const { initializeGame, setGameMode, settings, updateSettings, teams } = useGameStore();
  const { createRoom } = useRoomStore();
  const { soundEnabled, toggleSound, guestName, setGuestName } = useUserStore();

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [customCards, setCustomCards] = useState<Card[]>([]);

  const handleSoundToggle = () => {
    toggleSound();
    soundManager.setSoundEnabled(!soundEnabled);
  };

  // Start single device game
  const handleStartSingleDevice = () => {
    setGameMode('single_device');
    initializeGame(teams, settings, customCards);
    router.push('/play');
  };

  // Create multiplayer room
  const handleCreateRoom = () => {
    const room = createRoom(`${guestName}'in Odası`, false, undefined, settings);
    router.push(`/room/${room.code}`);
  };

  const handleApplyAiMode = (mode: any) => {
    if (mode.recommended_duration_seconds) {
      updateSettings({
        turn_duration: mode.recommended_duration_seconds,
        pass_limit: mode.recommended_pass_limit || 3,
      });
    }
  };

  const handleAddAiCards = (cards: Card[]) => {
    setCustomCards((prev) => [...prev, ...cards]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-lg mx-auto w-full">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl">
            T
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-tight">
              DVT TABU
            </h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">
              Kelime Arenası
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSoundToggle}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Kural ve Ayarlar"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </header>

      {/* Hero / Main Section */}
      <div className="flex-1 flex flex-col justify-center gap-5 my-4">
        {/* Gemini AI Daily Insights Banner */}
        <AiDailyBanner onApplyMode={handleApplyAiMode} />

        {/* Player Name Input */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Oyuncu:</span>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Takma Adın..."
            className="bg-transparent text-sm font-extrabold text-white flex-1 focus:outline-none placeholder-slate-600"
            maxLength={18}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Tek Cihazda Oyna */}
          <Button
            variant="primary"
            size="xl"
            onClick={handleStartSingleDevice}
            className="flex items-center justify-between px-6 group overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-black leading-tight">Tek Cihazda Oyna</div>
                <div className="text-xs text-indigo-200 font-normal">Cihazı elden ele gezdirerek oyna</div>
              </div>
            </div>
            <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
          </Button>

          {/* Çok Cihazlı Oda Kur & Katıl */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCreateRoom}
              className="flex flex-col items-start justify-center p-4 h-auto text-left gap-1"
            >
              <Users className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-sm font-bold leading-tight">Oda Oluştur</span>
              <span className="text-[11px] text-slate-400">Şifreli / Açık Oda</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/rooms')}
              className="flex flex-col items-start justify-center p-4 h-auto text-left gap-1"
            >
              <Trophy className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-sm font-bold leading-tight">Odaya Katıl</span>
              <span className="text-[11px] text-slate-400">6 Haneli Kod ile</span>
            </Button>
          </div>

          {/* AI Destesi Üret */}
          <Button
            variant="ghost"
            size="md"
            onClick={() => setIsDeckModalOpen(true)}
            className="border border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-950/60 text-indigo-300 py-3.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300 mr-2" />
            <span className="text-xs font-extrabold">Gemini ile Özel Deste Üret</span>
            {customCards.length > 0 && (
              <span className="ml-2 text-[10px] bg-indigo-500/30 text-indigo-200 py-0.5 px-2 rounded-full font-bold">
                +{customCards.length} Kart
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="flex items-center justify-between text-[11px] text-slate-500 py-2 border-t border-slate-900">
        <span>Sürüm 1.0 (PWA Live)</span>
        <button
          onClick={() => setIsHowToPlayOpen(true)}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Nasıl Oynanır?
        </button>
      </footer>

      {/* Modals */}
      <RuleSettingsModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        initialSettings={settings}
        onSave={(newSet) => updateSettings(newSet)}
      />

      <DeckGeneratorModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        onAddCards={handleAddAiCards}
      />

      {/* How to play modal */}
      {isHowToPlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-slate-200 flex flex-col gap-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" /> Tabu Kuralları
            </h3>
            <ul className="text-xs flex flex-col gap-2.5 text-slate-300 list-disc pl-4">
              <li>Anlatıcı ana kelimeyi altındaki <strong>5 yasaklı kelimeyi</strong> kullanmadan anlatır.</li>
              <li>Doğru bilinirse <strong>+1 Puan</strong> kazanılır.</li>
              <li>Tur başına <strong>3 Pas</strong> hakkınız vardır (puan değişmez).</li>
              <li>Yasaklı kelime söylenirse rakip takım <strong>Buzzer'a</strong> basar (<strong>-1 Puan</strong> ceza ve tur sonu).</li>
            </ul>
            <Button variant="primary" fullWidth onClick={() => setIsHowToPlayOpen(false)}>
              Anladım
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
