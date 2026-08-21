'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { PaywallModal } from '@/components/monetization/PaywallModal';
import { 
  Users, 
  Clock, 
  Layers, 
  Play, 
  X, 
  Plus, 
  Trash2, 
  Dices, 
  Sparkles, 
  Crown, 
  Flame, 
  Film, 
  Trophy, 
  Cpu, 
  Utensils, 
  History, 
  Globe, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  Sliders
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { analytics } from '@/lib/analytics';
import { Team, GameSettings } from '@/types/game';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FUNNY_TEAM_NAMES = [
  'Mavi Şimşekler', 'Kırmızı Ejderler', 'Yasaklı Beyinler', 'Gülme Krizleri',
  'Çılgın Paletler', 'Son Şansçılar', 'Beyin Yakanlar', 'Tabu Ustaları',
  'Laf Cambazları', 'Pusula Kırıkları', 'Skibidi Tayfa', 'Giga Chadler',
  'Doomscroll Ekibi', 'Akıl Küpleri', 'Gece Kuşları', 'Racon Kesenler'
];

const TEAM_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
];

export function GameSetupModal({ isOpen, onClose }: GameSetupModalProps) {
  const router = useRouter();
  const { teams: storeTeams, settings: storeSettings, updateSettings, initializeGame } = useGameStore();
  const { isProUser } = useUserStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState('3plus_teams');

  // Config State from Admin
  const [config, setConfig] = useState<any>({
    paywall_3plus_teams_enabled: true,
    paywall_custom_rules_enabled: false,
    paywall_vip_decks_enabled: false,
  });

  // Wizard State
  const [teams, setTeams] = useState<Team[]>(storeTeams);
  const [turnDuration, setTurnDuration] = useState<number>(storeSettings.turn_duration || 60);
  const [passLimit, setPassLimit] = useState<number>(storeSettings.pass_limit || 2);
  const [tabuPenalty, setTabuPenalty] = useState<number>(storeSettings.buzzer_penalty ?? -1);
  const [targetScore, setTargetScore] = useState<number | null>(storeSettings.target_score || 50);
  const [goldenRound, setGoldenRound] = useState<boolean>(storeSettings.golden_round_enabled ?? true);
  
  // Decks State
  const [availableDecks, setAvailableDecks] = useState<any[]>([]);
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      analytics.gameSetupStart();
      fetchConfig();
      fetchDecks();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const json = await res.json();
        if (json.config) setConfig(json.config);
      }
    } catch {}
  };

  const fetchDecks = async () => {
    setLoadingDecks(true);
    try {
      const res = await fetch('/api/decks');
      if (res.ok) {
        const json = await res.json();
        const active = (json.decks || []).filter((d: any) => d.is_active !== false);
        setAvailableDecks(active);
        // Default: select all active decks
        setSelectedDeckIds(active.map((d: any) => d.id));
      }
    } catch {} finally {
      setLoadingDecks(false);
    }
  };

  // --- Step 1: Team Management ---
  const handleAddTeam = () => {
    if (teams.length >= 6) return;

    // Check Paywall for 3+ teams
    if (teams.length >= 2 && config.paywall_3plus_teams_enabled && !isProUser) {
      analytics.paywallView('3plus_teams');
      setPaywallTrigger('3plus_teams');
      setPaywallOpen(true);
      return;
    }

    const nextIndex = teams.length;
    const nextColor = TEAM_COLORS[nextIndex % TEAM_COLORS.length];
    const randomName = FUNNY_TEAM_NAMES[Math.floor(Math.random() * FUNNY_TEAM_NAMES.length)];

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: randomName,
      color: nextColor,
      score: 0,
      order_index: nextIndex,
    };

    setTeams([...teams, newTeam]);
    analytics.gameSetupTeamCount(teams.length + 1);
    soundManager.play('correct');
  };

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((t) => t.id !== id));
    soundManager.play('tabu');
  };

  const handleUpdateTeamName = (id: string, name: string) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const handleRandomizeTeamName = (id: string) => {
    const randomName = FUNNY_TEAM_NAMES[Math.floor(Math.random() * FUNNY_TEAM_NAMES.length)];
    handleUpdateTeamName(id, randomName);
    soundManager.play('pass');
  };

  const handleUpdateTeamColor = (id: string, color: string) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, color } : t)));
  };

  // --- Step 3: Deck Toggle ---
  const handleToggleDeck = (deckId: string) => {
    const isVipDeck = deckId === 'deck-memes-2026';
    if (isVipDeck && config.paywall_vip_decks_enabled && !isProUser) {
      analytics.paywallView('vip_deck_select');
      setPaywallTrigger('vip_deck_select');
      setPaywallOpen(true);
      return;
    }

    if (selectedDeckIds.includes(deckId)) {
      if (selectedDeckIds.length === 1) {
        alert('En az 1 deste seçili olmalıdır!');
        return;
      }
      setSelectedDeckIds(selectedDeckIds.filter((id) => id !== deckId));
    } else {
      setSelectedDeckIds([...selectedDeckIds, deckId]);
    }
    soundManager.play('pass');
  };

  // --- Final Launch ---
  const handleStartGame = async () => {
    const finalSettings: Partial<GameSettings> = {
      team_count: teams.length,
      turn_duration: turnDuration,
      pass_limit: passLimit,
      buzzer_penalty: tabuPenalty,
      target_score: targetScore,
      golden_round_enabled: goldenRound,
    };

    updateSettings(finalSettings);
    analytics.gameSetupFinish(teams.length, turnDuration, selectedDeckIds);
    soundManager.play('start');

    // Fetch cards for selected decks
    let fetchedCards: any[] = [];
    try {
      const res = await fetch(`/api/cards?activeOnly=true&limit=300`);
      if (res.ok) {
        const json = await res.json();
        const allCards = json.cards || [];
        fetchedCards = allCards.filter((c: any) => selectedDeckIds.includes(c.deck_id));
      }
    } catch {}

    await initializeGame(teams, finalSettings, fetchedCards);
    onClose();
    router.push('/play');
  };

  const renderDeckIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film': return <Film className="w-4 h-4" />;
      case 'Trophy': return <Trophy className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'History': return <History className="w-4 h-4" />;
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Oyun Kurulumu</h3>
              <span className="text-[10px] text-slate-400">Arenaya girmeden önce ayarlarınızı özelleştirin</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-3 bg-slate-950/60 border-b border-slate-800 text-xs font-black">
          {[
            { step: 1, label: '1. Takımlar', icon: <Users className="w-3.5 h-3.5" /> },
            { step: 2, label: '2. Kurallar', icon: <Clock className="w-3.5 h-3.5" /> },
            { step: 3, label: '3. Desteler', icon: <Layers className="w-3.5 h-3.5" /> },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step as any)}
              className={`py-3 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
                currentStep === s.step
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* ================= STEP 1: TEAMS ================= */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Yarışacak Takımlar ({teams.length} Takım)
                  </h4>
                  <span className="text-[10px] text-slate-400">Takım adlarını düzenleyin veya zar ile eğlenceli adlar türetin</span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddTeam}
                  disabled={teams.length >= 6}
                  className="text-xs py-1.5 px-3 font-bold bg-indigo-600 hover:bg-indigo-500 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Takım Ekle
                </Button>
              </div>

              <div className="flex flex-col gap-2.5">
                {teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/90 flex flex-col gap-2 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Team Color & Index */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">
                          #{idx + 1}
                        </span>

                        <input
                          type="text"
                          value={team.name}
                          onChange={(e) => handleUpdateTeamName(team.id, e.target.value)}
                          placeholder="Takım Adı..."
                          className="bg-transparent text-xs font-extrabold text-white flex-1 focus:outline-none placeholder-slate-600 truncate"
                          maxLength={24}
                        />
                      </div>

                      {/* Team Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleRandomizeTeamName(team.id)}
                          className="p-1.5 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-colors"
                          title="Rastgele İsim Türet"
                        >
                          <Dices className="w-3.5 h-3.5" />
                        </button>

                        {teams.length > 2 && (
                          <button
                            onClick={() => handleRemoveTeam(team.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-xl transition-colors"
                            title="Takımı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-900">
                      <span className="text-[9px] text-slate-500">Renk:</span>
                      {TEAM_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleUpdateTeamColor(team.id, col)}
                          className={`w-4 h-4 rounded-full transition-all ${
                            team.color === col ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 2: RULES ================= */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              {/* 1. Turn Duration */}
              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Tur Süresi (Saniye)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[45, 60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setTurnDuration(dur)}
                      className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                        turnDuration === dur
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {dur} sn
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Pass Limit */}
              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Tur Başına Pas Hakkı
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 5].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPassLimit(p)}
                      className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                        passLimit === p
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {p} Pas
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Target Score */}
              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Kazanma Hedef Puanı
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setTargetScore(sc)}
                      className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                        targetScore === sc
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {sc} Puan
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Tabu Penalty & Golden Round */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400">Tabu Cezası:</span>
                  <div className="flex items-center gap-1">
                    {[-1, -2, 0].map((pen) => (
                      <button
                        key={pen}
                        type="button"
                        onClick={() => setTabuPenalty(pen)}
                        className={`flex-1 py-1 text-[10px] font-black rounded-lg border transition-all ${
                          tabuPenalty === pen
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {pen === 0 ? '0' : pen}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-black text-amber-300 block">Altın Tur (2x)</span>
                    <span className="text-[9px] text-slate-400">Son turda puanlar 2 katı</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={goldenRound}
                    onChange={(e) => setGoldenRound(e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DECKS ================= */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Kelime Desteleri ({selectedDeckIds.length} Seçili)
                  </h4>
                  <span className="text-[10px] text-slate-400">Oyunda hangi destelerin kelimeleri çıksın?</span>
                </div>

                <button
                  onClick={() => {
                    if (selectedDeckIds.length === availableDecks.length) {
                      setSelectedDeckIds(['deck-general']);
                    } else {
                      setSelectedDeckIds(availableDecks.map((d) => d.id));
                    }
                  }}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 py-1 px-2.5 rounded-xl border border-indigo-500/20"
                >
                  {selectedDeckIds.length === availableDecks.length ? 'Temele Dön' : 'Tümünü Seç'}
                </button>
              </div>

              {loadingDecks ? (
                <div className="p-8 text-center text-xs text-slate-400">Desteler yükleniyor...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableDecks.map((deck) => {
                    const isSelected = selectedDeckIds.includes(deck.id);
                    const isMeme = deck.id === 'deck-memes-2026';

                    return (
                      <button
                        key={deck.id}
                        type="button"
                        onClick={() => handleToggleDeck(deck.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-950/70 border-slate-800/80 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: deck.color || '#6366f1' }}
                          >
                            {renderDeckIcon(deck.icon)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white truncate block">{deck.name}</span>
                              {isMeme && (
                                <span className="bg-rose-500/20 text-rose-300 text-[8px] font-black px-1.5 py-0.2 rounded border border-rose-500/30">
                                  🔥 TREND
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              {deck.card_count || 25} Kart
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-400 text-white'
                              : 'border-slate-700 bg-slate-900 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="text-xs py-2.5 px-4 font-bold border-slate-800 hover:bg-slate-900 text-slate-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Geri
            </Button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-300 px-2"
            >
              İptal
            </button>
          )}

          {currentStep < 3 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep((currentStep + 1) as any)}
              className="text-xs py-2.5 px-6 font-black bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/25"
            >
              İleri <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleStartGame}
              className="text-xs py-2.5 px-6 font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-95 text-white shadow-xl shadow-indigo-500/30 animate-pulse"
            >
              <Play className="w-4 h-4 fill-current mr-1.5" /> ⚔️ Arenaya Başla!
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Paywall Modal if triggered */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        triggerSource={paywallTrigger}
      />
    </div>
  );
}
