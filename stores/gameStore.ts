import { create } from 'zustand';
import { Card, Team, GameSettings, GameTurn, ActiveGameState } from '@/types/game';
import { INITIAL_CARDS, DEFAULT_GAME_SETTINGS } from '@/lib/constants';
import { filterCards, getNextCard, calculateNextTeamIndex, checkGameEnd } from '@/lib/game-logic';
import { soundManager } from '@/lib/audio';
import { triggerHaptic } from '@/lib/haptics';

interface GameStoreState {
  settings: GameSettings;
  teams: Team[];
  cardPool: Card[];
  gameState: ActiveGameState;
  isGoldenRound: boolean;
  gameMode: 'single_device' | 'multiplayer';
  
  // Actions
  initializeGame: (teams: Team[], customSettings?: Partial<GameSettings>, customCards?: Card[]) => Promise<void>;
  fetchLiveCards: () => Promise<Card[]>;
  startTurn: () => void;
  recordCorrect: () => void;
  recordPass: () => void;
  recordBuzzer: (rivalPlayerName?: string, rivalTeamId?: string) => void;
  recordTimeout: () => void;
  endTurnAndNext: () => void;
  resetGame: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  setGameMode: (mode: 'single_device' | 'multiplayer') => void;
  syncRemoteState: (partialState: Partial<ActiveGameState>) => void;
}

const initialTeams: Team[] = [
  { id: 'team-1', name: 'Mavi Şimşekler', color: '#3b82f6', score: 0, order_index: 0 },
  { id: 'team-2', name: 'Kırmızı Ejderler', color: '#ef4444', score: 0, order_index: 1 },
];

export const useGameStore = create<GameStoreState>((set, get) => ({
  settings: DEFAULT_GAME_SETTINGS,
  teams: initialTeams,
  cardPool: INITIAL_CARDS,
  isGoldenRound: false,
  gameMode: 'single_device',
  gameState: {
    status: 'idle',
    current_round: 1,
    total_rounds: DEFAULT_GAME_SETTINGS.total_rounds,
    active_team_index: 0,
    active_team_id: initialTeams[0].id,
    current_card: null,
    time_remaining: DEFAULT_GAME_SETTINGS.turn_duration,
    remaining_passes: DEFAULT_GAME_SETTINGS.pass_limit,
    remaining_tabus: DEFAULT_GAME_SETTINGS.tabu_limit > 0 ? DEFAULT_GAME_SETTINGS.tabu_limit : 999,
    turn_correct_count: 0,
    turn_pass_count: 0,
    turn_tabu_count: 0,
    buzzer_locked_by: null,
    cards_used_ids: [],
    turn_history: [],
  },

  setGameMode: (mode) => set({ gameMode: mode }),

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },

  fetchLiveCards: async () => {
    try {
      const res = await fetch('/api/cards?activeOnly=true&limit=250');
      if (res.ok) {
        const json = await res.json();
        if (json.cards && json.cards.length > 0) {
          return json.cards;
        }
      }
    } catch {}
    return INITIAL_CARDS;
  },

  initializeGame: async (teams, customSettings, customCards) => {
    const settings = { ...DEFAULT_GAME_SETTINGS, ...(customSettings || {}) };
    let baseCards = customCards && customCards.length > 0 ? customCards : INITIAL_CARDS;

    // Fetch live active cards from Supabase if no custom cards provided
    if (!customCards || customCards.length === 0) {
      baseCards = await get().fetchLiveCards();
    }

    const pool = filterCards(baseCards, settings);
    const firstCard = getNextCard(pool, []);

    set({
      settings,
      teams: teams.map(t => ({ ...t, score: 0 })),
      cardPool: pool,
      isGoldenRound: false,
      gameState: {
        status: 'starting',
        current_round: 1,
        total_rounds: settings.total_rounds,
        active_team_index: 0,
        active_team_id: teams[0]?.id || 'team-1',
        current_card: firstCard,
        time_remaining: settings.turn_duration,
        remaining_passes: settings.pass_limit,
        remaining_tabus: settings.tabu_limit > 0 ? settings.tabu_limit : 999,
        turn_correct_count: 0,
        turn_pass_count: 0,
        turn_tabu_count: 0,
        buzzer_locked_by: null,
        cards_used_ids: [firstCard.id],
        turn_history: [],
      }
    });
  },

  startTurn: () => {
    const { cardPool, gameState, settings } = get();
    const nextCard = getNextCard(cardPool, gameState.cards_used_ids);
    
    set((state) => ({
      gameState: {
        ...state.gameState,
        status: 'in_progress',
        current_card: nextCard,
        time_remaining: settings.turn_duration,
        remaining_passes: settings.pass_limit,
        remaining_tabus: settings.tabu_limit > 0 ? settings.tabu_limit : 999,
        turn_correct_count: 0,
        turn_pass_count: 0,
        turn_tabu_count: 0,
        buzzer_locked_by: null,
        cards_used_ids: [...state.gameState.cards_used_ids, nextCard.id],
        turn_history: [],
      }
    }));
  },

  recordCorrect: () => {
    const { gameState, cardPool, teams, isGoldenRound } = get();
    if (gameState.status !== 'in_progress' || !gameState.current_card) return;

    soundManager.playCorrect();
    triggerHaptic('correct');

    const pointMultiplier = isGoldenRound ? 2 : 1;
    const activeTeamId = gameState.active_team_id;

    const updatedTeams = teams.map((team) =>
      team.id === activeTeamId ? { ...team, score: team.score + pointMultiplier } : team
    );

    const newHistory: GameTurn = {
      card: gameState.current_card,
      action: 'correct',
      timestamp: Date.now(),
      score_change: pointMultiplier,
      performed_by_team: activeTeamId,
    };

    const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

    set((state) => ({
      teams: updatedTeams,
      gameState: {
        ...state.gameState,
        turn_correct_count: state.gameState.turn_correct_count + 1,
        current_card: nextCard,
        cards_used_ids: [...state.gameState.cards_used_ids, nextCard.id],
        turn_history: [...state.gameState.turn_history, newHistory],
      }
    }));
  },

  recordPass: () => {
    const { gameState, cardPool, settings } = get();
    if (gameState.status !== 'in_progress' || !gameState.current_card) return;

    if (settings.pass_limit > 0 && gameState.remaining_passes <= 0) {
      soundManager.playBuzzer();
      triggerHaptic('buzzer');
      return;
    }

    soundManager.playPass();
    triggerHaptic('pass');

    const activeTeamId = gameState.active_team_id;
    const newHistory: GameTurn = {
      card: gameState.current_card,
      action: 'pass',
      timestamp: Date.now(),
      score_change: 0,
      performed_by_team: activeTeamId,
    };

    const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

    set((state) => ({
      gameState: {
        ...state.gameState,
        remaining_passes: state.gameState.remaining_passes - 1,
        turn_pass_count: state.gameState.turn_pass_count + 1,
        current_card: nextCard,
        cards_used_ids: [...state.gameState.cards_used_ids, nextCard.id],
        turn_history: [...state.gameState.turn_history, newHistory],
      }
    }));
  },

  recordBuzzer: (rivalPlayerName, rivalTeamId) => {
    const { gameState, cardPool, teams, settings } = get();
    if (gameState.status !== 'in_progress' || !gameState.current_card) return;

    // Check tabu limit if configured
    if (settings.tabu_limit > 0 && gameState.remaining_tabus <= 0) {
      return;
    }

    soundManager.playBuzzer();
    triggerHaptic('buzzer');

    const penalty = settings.tabu_penalty_points || Math.abs(settings.buzzer_penalty) || 1;
    const activeTeamId = gameState.active_team_id;

    const updatedTeams = teams.map((team) =>
      team.id === activeTeamId ? { ...team, score: team.score - penalty } : team
    );

    const newHistory: GameTurn = {
      card: gameState.current_card,
      action: 'tabu',
      timestamp: Date.now(),
      score_change: -penalty,
      performed_by_team: activeTeamId,
      buzzer_pressed_by: rivalPlayerName,
    };

    const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

    set((state) => ({
      teams: updatedTeams,
      gameState: {
        ...state.gameState,
        turn_tabu_count: state.gameState.turn_tabu_count + 1,
        remaining_tabus: Math.max(0, state.gameState.remaining_tabus - 1),
        buzzer_locked_by: rivalPlayerName || 'Rakip',
        current_card: nextCard,
        cards_used_ids: [...state.gameState.cards_used_ids, nextCard.id],
        turn_history: [...state.gameState.turn_history, newHistory],
      }
    }));

    setTimeout(() => {
      set((state) => ({
        gameState: { ...state.gameState, buzzer_locked_by: null }
      }));
    }, 1200);
  },

  recordTimeout: () => {
    const { gameState } = get();
    if (gameState.status !== 'in_progress') return;

    soundManager.playBuzzer();
    triggerHaptic('buzzer');

    set((state) => ({
      gameState: {
        ...state.gameState,
        status: 'turn_break',
        time_remaining: 0,
      }
    }));
  },

  endTurnAndNext: () => {
    const { gameState, teams, settings } = get();
    const nextTeamIndex = calculateNextTeamIndex(gameState.active_team_index, teams.length);
    const nextRound = nextTeamIndex === 0 ? gameState.current_round + 1 : gameState.current_round;

    const gameEndResult = checkGameEnd(
      nextRound,
      settings.total_rounds,
      teams,
      settings.target_score || settings.winning_score
    );

    if (gameEndResult.isEnded) {
      soundManager.playFanfare();
      set((state) => ({
        gameState: {
          ...state.gameState,
          status: 'finished',
        }
      }));
      return;
    }

    const isGolden = settings.golden_round_enabled && nextRound === settings.total_rounds;

    set((state) => ({
      isGoldenRound: isGolden,
      gameState: {
        ...state.gameState,
        status: 'starting',
        current_round: nextRound,
        active_team_index: nextTeamIndex,
        active_team_id: teams[nextTeamIndex]?.id || 'team-1',
        time_remaining: settings.turn_duration,
        remaining_passes: settings.pass_limit,
        remaining_tabus: settings.tabu_limit > 0 ? settings.tabu_limit : 999,
        turn_correct_count: 0,
        turn_pass_count: 0,
        turn_tabu_count: 0,
      }
    }));
  },

  resetGame: () => {
    set((state) => ({
      isGoldenRound: false,
      teams: state.teams.map((t) => ({ ...t, score: 0 })),
      gameState: {
        status: 'idle',
        current_round: 1,
        total_rounds: state.settings.total_rounds,
        active_team_index: 0,
        active_team_id: state.teams[0]?.id || 'team-1',
        current_card: null,
        time_remaining: state.settings.turn_duration,
        remaining_passes: state.settings.pass_limit,
        remaining_tabus: state.settings.tabu_limit > 0 ? state.settings.tabu_limit : 999,
        turn_correct_count: 0,
        turn_pass_count: 0,
        turn_tabu_count: 0,
        buzzer_locked_by: null,
        cards_used_ids: [],
        turn_history: [],
      }
    }));
  },

  syncRemoteState: (partialState) => {
    set((state) => ({
      gameState: { ...state.gameState, ...partialState }
    }));
  }
}));
