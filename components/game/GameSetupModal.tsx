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
  Sliders,
  RotateCcw,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2
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
  const [passLimit, setPassLimit] = useState<number>(storeSettings.pass_limit ?? 2);
  const [tabuLimit, setTabuLimit] = useState<number>(storeSettings.tabu_limit ?? 0);
  const [tabuPenalty, setTabuPenalty] = useState<number>(storeSettings.buzzer_penalty ?? -1);
  const [correctPoints, setCorrectPoints] = useState<number>(storeSettings.correct_points || 1);
  const [targetScore, setTargetScore] = useState<number | null>(storeSettings.target_score ?? 50);
  const [totalRounds, setTotalRounds] = useState<number>(storeSettings.total_rounds || 6);
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
      tabu_limit: tabuLimit,
      buzzer_penalty: tabuPenalty,
      correct_points: correctPoints,
      target_score: targetScore === 0 ? null : targetScore,
      total_rounds: totalRounds,
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
              {/* 1. Tur Süresi Slider + Hızlı Butonlar */}
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
                  onChange={(e) => setTurnDuration(parseInt(e.target.value, 10))}
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
                      onClick={() => setTurnDuration(item.val)}
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

              {/* 2. Tur Başına Pas Hakkı */}
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
                <div className="grid grid-cols-7 gap-1">
                  {[0, 1, 2, 3, 4, 5, 999].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPassLimit(p)}
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
              </div>

              {/* 3. Tur Başına Tabu Limiti */}
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
                      onClick={() => setTabuLimit(opt.val)}
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

              {/* 4. Tabu Cezası & Doğru Puanı */}
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
                        onClick={() => setTabuPenalty(pen)}
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
                        onClick={() => setCorrectPoints(pts)}
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

              {/* 5. Toplam Tur Sayısı & Hedef Skor */}
              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-purple-400" /> Toplam Tur Sayısı
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {[4, 6, 8, 10, 12, 16].map((rounds) => (
                    <button
                      key={rounds}
                      type="button"
                      onClick={() => setTotalRounds(rounds)}
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
              </div>

              {/* 6. Hedef Kazanma Puanı & Altın Tur */}
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
                        onClick={() => setTargetScore(sc.val === 0 ? null : sc.val)}
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

                {/* Golden Round Switch */}
                <label className="p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-black text-amber-300 block">Altın Tur (2x)</span>
                    <span className="text-[9px] text-slate-400">Son turda puanlar 2 katı & beraberlik uzatması</span>
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
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                                  VIP 🔥
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
              className="text-xs text-slate-400 hover:text-white"
            >
              Vazgeç
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                analytics.gameSetupStep(currentStep + 1, currentStep === 1 ? 'rules' : 'decks');
                setCurrentStep((currentStep + 1) as any);
                soundManager.play('correct');
              }}
              className="text-xs font-black py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/25"
            >
              <span>İleri: {currentStep === 1 ? 'Kurallar' : 'Desteler'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleStartGame}
              className="text-xs font-black py-3 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white shadow-xl shadow-emerald-500/25 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Oyunu Başlat ({teams.length} Takım)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Paywall Trigger Modal */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        triggerSource={`setup_${paywallTrigger}`}
      />
    </div>
  );
}
