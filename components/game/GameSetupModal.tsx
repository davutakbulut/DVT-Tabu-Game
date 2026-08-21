'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Sliders,
  RotateCcw,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Gauge,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { analytics } from '@/lib/analytics';
import { Team, GameSettings, Difficulty } from '@/types/game';

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

  // Preset Mode Selection
  const [activePreset, setActivePreset] = useState<'classic' | 'blitz' | 'hardcore' | 'chill' | 'custom'>('classic');

  // Teams with Squad/Players
  const [teams, setTeams] = useState<Team[]>(
    storeTeams.map((t, idx) => ({
      ...t,
      player_count: t.player_count || t.players?.length || 2,
      players: t.players && t.players.length > 0 ? t.players : [`Oyuncu 1`, `Oyuncu 2`],
    }))
  );

  // Turn Calculation Mode
  const [turnSelectionMode, setTurnSelectionMode] = useState<'total_rounds' | 'per_player'>('total_rounds');
  const [roundsPerPlayer, setRoundsPerPlayer] = useState<number>(2);

  // Wizard Rules State
  const [turnDuration, setTurnDuration] = useState<number>(storeSettings.turn_duration || 60);
  const [passLimit, setPassLimit] = useState<number>(storeSettings.pass_limit ?? 3);
  const [passPenalty, setPassPenalty] = useState<number>(storeSettings.pass_penalty ?? 0);
  const [tabuLimit, setTabuLimit] = useState<number>(storeSettings.tabu_limit ?? 0);
  const [tabuPenalty, setTabuPenalty] = useState<number>(storeSettings.buzzer_penalty ?? -1);
  const [correctPoints, setCorrectPoints] = useState<number>(storeSettings.correct_points || 1);
  const [targetScore, setTargetScore] = useState<number | null>(storeSettings.target_score ?? 50);
  const [totalRounds, setTotalRounds] = useState<number>(storeSettings.total_rounds || 6);
  const [goldenRound, setGoldenRound] = useState<boolean>(storeSettings.golden_round_enabled ?? true);
  const [difficulty, setDifficulty] = useState<Difficulty | 'Tümü'>(storeSettings.difficulty || 'Tümü');
  const [breakDuration, setBreakDuration] = useState<number>(storeSettings.break_duration ?? 3);
  
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
        setSelectedDeckIds(active.map((d: any) => d.id));
      }
    } catch {} finally {
      setLoadingDecks(false);
    }
  };

  // Dynamic Calculated Rounds when in 'per_player' mode
  const calculatedRounds = useMemo(() => {
    const maxPlayersInAnyTeam = Math.max(...teams.map((t) => t.players?.length || 2), 2);
    return maxPlayersInAnyTeam * roundsPerPlayer;
  }, [teams, roundsPerPlayer]);

  // --- Presets Handler ---
  const handleApplyPreset = (preset: 'classic' | 'blitz' | 'hardcore' | 'chill') => {
    setActivePreset(preset);
    soundManager.play('pass');

    if (preset === 'classic') {
      setTurnDuration(60);
      setPassLimit(3);
      setPassPenalty(0);
      setTabuLimit(0);
      setTabuPenalty(-1);
      setCorrectPoints(1);
      setTotalRounds(6);
      setTargetScore(50);
      setGoldenRound(true);
      setDifficulty('Tümü');
      setBreakDuration(3);
      setTurnSelectionMode('total_rounds');
    } else if (preset === 'blitz') {
      setTurnDuration(30);
      setPassLimit(1);
      setPassPenalty(0);
      setTabuLimit(2);
      setTabuPenalty(-1);
      setCorrectPoints(2);
      setTotalRounds(8);
      setTargetScore(40);
      setGoldenRound(true);
      setDifficulty('Tümü');
      setBreakDuration(3);
      setTurnSelectionMode('total_rounds');
    } else if (preset === 'hardcore') {
      setTurnDuration(45);
      setPassLimit(0);
      setPassPenalty(-1);
      setTabuLimit(1);
      setTabuPenalty(-2);
      setCorrectPoints(1);
      setTotalRounds(10);
      setTargetScore(50);
      setGoldenRound(true);
      setDifficulty('Zor');
      setBreakDuration(5);
      setTurnSelectionMode('total_rounds');
    } else if (preset === 'chill') {
      setTurnDuration(90);
      setPassLimit(999);
      setPassPenalty(0);
      setTabuLimit(0);
      setTabuPenalty(0);
      setCorrectPoints(1);
      setTotalRounds(4);
      setTargetScore(null);
      setGoldenRound(false);
      setDifficulty('Kolay');
      setBreakDuration(0);
      setTurnSelectionMode('total_rounds');
    }
  };

  // --- Step 1: Team & Player Management ---
  const handleAddTeam = () => {
    if (teams.length >= 6) return;

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
      player_count: 2,
      players: ['Oyuncu 1', 'Oyuncu 2'],
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

  // Team Squad (Players) Handlers
  const handleSetTeamPlayerCount = (teamId: string, count: number) => {
    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;
        const currentPlayers = t.players || [];
        let newPlayers = [...currentPlayers];
        if (count > currentPlayers.length) {
          for (let i = currentPlayers.length; i < count; i++) {
            newPlayers.push(`Oyuncu ${i + 1}`);
          }
        } else {
          newPlayers = newPlayers.slice(0, count);
        }
        return {
          ...t,
          player_count: count,
          players: newPlayers,
        };
      })
    );
    soundManager.play('pass');
  };

  const handleUpdatePlayerName = (teamId: string, playerIndex: number, newName: string) => {
    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;
        const players = [...(t.players || [])];
        players[playerIndex] = newName;
        return { ...t, players };
      })
    );
  };

  const handleAddPlayer = (teamId: string) => {
    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;
        const players = [...(t.players || [])];
        if (players.length >= 8) return t;
        players.push(`Oyuncu ${players.length + 1}`);
        return { ...t, player_count: players.length, players };
      })
    );
    soundManager.play('correct');
  };

  const handleRemovePlayer = (teamId: string, playerIndex: number) => {
    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;
        const players = [...(t.players || [])];
        if (players.length <= 2) return t;
        players.splice(playerIndex, 1);
        return { ...t, player_count: players.length, players };
      })
    );
    soundManager.play('tabu');
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
    const finalRounds = turnSelectionMode === 'per_player' ? calculatedRounds : totalRounds;

    const finalSettings: Partial<GameSettings> = {
      team_count: teams.length,
      turn_duration: turnDuration,
      pass_limit: passLimit,
      pass_penalty: passPenalty,
      tabu_limit: tabuLimit,
      buzzer_penalty: tabuPenalty,
      correct_points: correctPoints,
      target_score: targetScore === 0 ? null : targetScore,
      total_rounds: finalRounds,
      turn_selection_mode: turnSelectionMode,
      rounds_per_player: roundsPerPlayer,
      golden_round_enabled: goldenRound,
      difficulty,
      break_duration: breakDuration,
    };

    updateSettings(finalSettings);
    analytics.gameSetupFinish(teams.length, turnDuration, selectedDeckIds);
    soundManager.play('start');

    // Fetch cards for selected decks & difficulty
    let fetchedCards: any[] = [];
    try {
      const res = await fetch(`/api/cards?activeOnly=true&limit=300`);
      if (res.ok) {
        const json = await res.json();
        const allCards = json.cards || [];
        fetchedCards = allCards.filter((c: any) => selectedDeckIds.includes(c.deck_id));
        if (difficulty !== 'Tümü') {
          fetchedCards = fetchedCards.filter((c: any) => c.difficulty === difficulty);
        }
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
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Oyun Kurulumu</h3>
              <span className="text-[10px] text-slate-400">Arenaya girmeden önce ayarlarınızı özelleştirin</span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/50 text-xs font-bold">
          <button
            onClick={() => setCurrentStep(1)}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              currentStep === 1
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Takımlar</span>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              currentStep === 2
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. Kurallar</span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              currentStep === 3
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Desteler</span>
          </button>
        </div>

        {/* Scrollable Wizard Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* ================= STEP 1: TEAMS & PLAYERS ================= */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider block">
                    Yarışacak Takımlar & Kadrolar ({teams.length}/6)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Her takımın kişi sayısını ve oyuncu isimlerini belirleyin
                  </span>
                </div>

                {teams.length < 6 && (
                  <button
                    onClick={handleAddTeam}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 py-1.5 px-3 rounded-xl border border-indigo-500/20 transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Takım Ekle
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3 shadow-md"
                  >
                    {/* Top Row: Color + Name Input + Randomize + Delete */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-md ring-2 ring-white/20"
                        style={{ backgroundColor: team.color }}
                      />
                      
                      {/* Explicit Styled Name Input */}
                      <div className="flex-1 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 focus-within:border-indigo-500 rounded-xl px-2.5 py-1.5 transition-all">
                        <input
                          type="text"
                          value={team.name}
                          onChange={(e) => handleUpdateTeamName(team.id, e.target.value)}
                          className="bg-transparent text-xs font-black text-white flex-1 focus:outline-none placeholder-slate-500"
                          placeholder="Takım Adı Yazın..."
                          maxLength={22}
                        />
                        <button
                          type="button"
                          onClick={() => handleRandomizeTeamName(team.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Rastgele Eğlenceli Takım Adı Seç"
                        >
                          <Dices className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {teams.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(team.id)}
                          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Takımı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pl-6">
                      {TEAM_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleUpdateTeamColor(team.id, c)}
                          style={{ backgroundColor: c }}
                          className={`w-3.5 h-3.5 rounded-full transition-transform ${
                            team.color === c ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Team Squad & Player Count */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-400" /> Kadro ({team.players?.length || 2} Kişi):
                        </span>
                        {/* Quick Count Selectors */}
                        <div className="flex items-center gap-1">
                          {[2, 3, 4, 5].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => handleSetTeamPlayerCount(team.id, cnt)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                                (team.players?.length || 2) === cnt
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {cnt} Kişi
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Player Names Tag Grid */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(team.players || ['Oyuncu 1', 'Oyuncu 2']).map((player, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1 text-[11px] font-bold text-slate-200"
                          >
                            <span className="text-[9px] text-indigo-400 font-mono">#{pIdx + 1}</span>
                            <input
                              type="text"
                              value={player}
                              onChange={(e) => handleUpdatePlayerName(team.id, pIdx, e.target.value)}
                              className="bg-transparent text-[11px] font-bold text-white focus:outline-none w-20 truncate"
                              placeholder={`Oyuncu ${pIdx + 1}`}
                              maxLength={16}
                            />
                            {(team.players?.length || 2) > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(team.id, pIdx)}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                                title="Oyuncuyu Sil"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}

                        {(team.players?.length || 2) < 8 && (
                          <button
                            type="button"
                            onClick={() => handleAddPlayer(team.id)}
                            className="flex items-center gap-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-xl border border-indigo-500/20 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Ekle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 2: RICH RULES ================= */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              {/* 0. Hızlı Oyun Modu Presetleri (Presets) */}
              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Hızlı Oyun Modu Şablonları
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'classic', label: 'Klasik', desc: '60s • 3 Pas • 6 Tur', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
                    { id: 'blitz', label: 'Yıldırım', desc: '30s • 1 Pas • +2 Puan', icon: <Flame className="w-3.5 h-3.5 text-rose-400" /> },
                    { id: 'hardcore', label: 'Cezalı', desc: '45s • 0 Pas • -2 Ceza', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> },
                    { id: 'chill', label: 'Parti', desc: '90s • ∞ Pas • Rahat', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p.id as any)}
                      className={`p-2 rounded-2xl border text-left flex flex-col gap-0.5 transition-all ${
                        activePreset === p.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black flex items-center gap-1">
                        {p.icon}
                        {p.label}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Kelime Zorluk Derecesi (Difficulty) */}
              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  Kelime Zorluk Derecesi
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Tümü', 'Kolay', 'Orta', 'Zor'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => { setDifficulty(lvl); setActivePreset('custom'); }}
                      className={`py-2 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1 ${
                        difficulty === lvl
                          ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lvl === 'Tümü' && <Sparkles className="w-3 h-3 text-amber-400" />}
                      {lvl === 'Kolay' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {lvl === 'Orta' && <Zap className="w-3 h-3 text-indigo-400" />}
                      {lvl === 'Zor' && <Flame className="w-3 h-3 text-rose-400" />}
                      <span>{lvl}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Tur Süresi Slider + Hızlı Butonlar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Tur Süresi
                  </label>
                  <span className="text-xs font-black text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {turnDuration} saniye
                  </span>
                </div>
                
                {/* Interactive Slider */}
                <input
                  type="range"
                  min={30}
                  max={180}
                  step={5}
                  value={turnDuration}
                  onChange={(e) => { setTurnDuration(parseInt(e.target.value, 10)); setActivePreset('custom'); }}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer my-1.5"
                />

                {/* Quick Preset Buttons */}
                <div className="grid grid-cols-5 gap-1.5 mt-1">
                  {[
                    { val: 30, label: '30s' },
                    { val: 45, label: '45s' },
                    { val: 60, label: '60s' },
                    { val: 90, label: '90s' },
                    { val: 120, label: '120s' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => { setTurnDuration(item.val); setActivePreset('custom'); }}
                      className={`py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                        turnDuration === item.val
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Tur Başına Pas Hakkı & Pas Cezası */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    Tur Başına Pas Hakkı
                  </label>
                  <span className="text-xs font-black text-amber-400 font-mono">
                    {passLimit >= 99 ? '∞ Sınırsız' : `${passLimit} Pas`}
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {[0, 1, 2, 3, 4, 5, 999].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPassLimit(p); setActivePreset('custom'); }}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        passLimit === p
                          ? 'bg-amber-500/25 text-amber-300 border-amber-500 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {p === 999 ? '∞' : p}
                    </button>
                  ))}
                </div>

                {/* Pas Cezası */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">Pas Geçme Cezası:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setPassPenalty(0); setActivePreset('custom'); }}
                      className={`px-2.5 py-1 rounded-lg font-black text-[11px] border transition-all ${
                        passPenalty === 0
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Ücretsiz (0P)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPassPenalty(-1); setActivePreset('custom'); }}
                      className={`px-2.5 py-1 rounded-lg font-black text-[11px] border transition-all ${
                        passPenalty === -1
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Cezalı (-1P)
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Tur Başına Tabu Limiti */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                    Tur Başı Tabu / Ceza Hakkı
                  </label>
                  <span className="text-xs font-black text-red-400 font-mono">
                    {tabuLimit === 0 ? '∞ Sınırsız' : `${tabuLimit} Hak`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { val: 0, label: '∞ Sınırsız' },
                    { val: 1, label: '1 Tabu' },
                    { val: 2, label: '2 Tabu' },
                    { val: 3, label: '3 Tabu' },
                    { val: 5, label: '5 Tabu' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => { setTabuLimit(opt.val); setActivePreset('custom'); }}
                      className={`py-2 rounded-xl text-[11px] font-black border transition-all ${
                        tabuLimit === opt.val
                          ? 'bg-red-500/25 text-red-300 border-red-500 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Tabu Cezası & Doğru Puanı */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Tabu Cezası */}
                <div>
                  <label className="text-xs font-black text-white uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                    Tabu Cezası
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[-1, -2, 0].map((pen) => (
                      <button
                        key={pen}
                        type="button"
                        onClick={() => { setTabuPenalty(pen); setActivePreset('custom'); }}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${
                          tabuPenalty === pen
                            ? 'bg-orange-500/25 text-orange-300 border-orange-500 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {pen === 0 ? '0' : `${pen} P`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doğru Başı Puan */}
                <div>
                  <label className="text-xs font-black text-white uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Doğru Puanı
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => { setCorrectPoints(pts); setActivePreset('custom'); }}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${
                          correctPoints === pts
                            ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        +{pts} P
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. Tur Hesaplama Modu: Sabit Tur vs Kişi Başı Anlatım */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-purple-400" /> Tur Hesaplama Modu
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[10px] font-black">
                    <button
                      type="button"
                      onClick={() => setTurnSelectionMode('total_rounds')}
                      className={`px-2 py-1 rounded-lg transition-all ${
                        turnSelectionMode === 'total_rounds'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sabit Tur
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurnSelectionMode('per_player')}
                      className={`px-2 py-1 rounded-lg transition-all ${
                        turnSelectionMode === 'per_player'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Kişi Başı Tur
                    </button>
                  </div>
                </div>

                {turnSelectionMode === 'total_rounds' ? (
                  <div className="grid grid-cols-6 gap-1">
                    {[4, 6, 8, 10, 12, 16].map((rounds) => (
                      <button
                        key={rounds}
                        type="button"
                        onClick={() => { setTotalRounds(rounds); setActivePreset('custom'); }}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${
                          totalRounds === rounds
                            ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {rounds} Tur
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: 1, label: '1x Herkes 1 Kez' },
                        { val: 2, label: '2x Herkes 2 Kez' },
                        { val: 3, label: '3x Herkes 3 Kez' },
                      ].map((rpp) => (
                        <button
                          key={rpp.val}
                          type="button"
                          onClick={() => { setRoundsPerPlayer(rpp.val); setActivePreset('custom'); }}
                          className={`py-2 rounded-xl text-xs font-black border transition-all ${
                            roundsPerPlayer === rpp.val
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {rpp.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                        Kadrolara Göre Toplam Tur:
                      </span>
                      <span className="font-mono font-black text-white bg-purple-600/40 px-2.5 py-0.5 rounded-md border border-purple-400/40">
                        {calculatedRounds} Tur Oynanacak
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Hedef Kazanma Puanı, Tur Arası Geçiş & Altın Tur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Target Score */}
                <div>
                  <label className="text-[11px] font-black text-slate-300 block mb-1">
                    Kazanma Hedef Puanı:
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { val: 25, label: '25 P' },
                      { val: 50, label: '50 P' },
                      { val: 100, label: '100 P' },
                      { val: 0, label: 'Yok' },
                    ].map((sc) => (
                      <button
                        key={sc.val}
                        type="button"
                        onClick={() => { setTargetScore(sc.val === 0 ? null : sc.val); setActivePreset('custom'); }}
                        className={`py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                          (targetScore === sc.val || (sc.val === 0 && targetScore === null))
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tur Arası Mola Sayacı */}
                <div>
                  <label className="text-[11px] font-black text-slate-300 block mb-1">
                    Tur Arası Hazırlık Süresi:
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { val: 0, label: 'Manuel' },
                      { val: 3, label: '3 Saniye' },
                      { val: 5, label: '5 Saniye' },
                    ].map((bd) => (
                      <button
                        key={bd.val}
                        type="button"
                        onClick={() => { setBreakDuration(bd.val); setActivePreset('custom'); }}
                        className={`py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                          breakDuration === bd.val
                            ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {bd.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Altın Tur Switch */}
              <label className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-black text-amber-300 block">Altın Tur (2x) & Beraberlik Uzatması</span>
                  <span className="text-[10px] text-slate-400">Son turda veya beraberlikte tüm puanlar 2 katı sayılır</span>
                </div>
                <input
                  type="checkbox"
                  checked={goldenRound}
                  onChange={(e) => { setGoldenRound(e.target.checked); setActivePreset('custom'); }}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>
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
                      <div
                        key={deck.id}
                        onClick={() => handleToggleDeck(deck.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/15'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-xl text-white ${
                            isSelected ? 'bg-indigo-600' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {renderDeckIcon(deck.icon)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white truncate">
                                {deck.name}
                              </span>
                              {isMeme && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0 inline-flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> VIP
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {deck.card_count || '50+'} Kart
                            </span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Wizard Control Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="text-xs font-bold py-2.5 px-4 text-slate-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Geri
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="text-xs font-bold text-slate-400"
            >
              İptal
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep((currentStep + 1) as any)}
              className="text-xs font-black py-2.5 px-5 ml-auto rounded-xl"
            >
              İleri: {currentStep === 1 ? 'Kurallar' : 'Desteler'} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="success"
              size="md"
              onClick={handleStartGame}
              className="text-xs font-black py-2.5 px-6 ml-auto flex items-center gap-1.5 rounded-xl"
            >
              <Play className="w-4 h-4 fill-white" /> Oyunu Başlat
            </Button>
          )}
        </div>
      </div>

      {/* Paywall Modal for 3+ Teams & VIP Decks */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        triggerSource={paywallTrigger}
      />
    </div>
  );
}
