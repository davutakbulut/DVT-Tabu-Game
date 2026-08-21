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
  initializeGame: (teams: Team[], customSettings?: Partial<GameSettings>, customCards?: Card[]) => void;
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

  initializeGame: (teams, customSettings, customCards) => {
    const settings = { ...DEFAULT_GAME_SETTINGS, ...(customSettings || {}) };
    const allCards = customCards && customCards.length > 0 ? customCards : INITIAL_CARDS;
    const pool = filterCards(allCards, settings);
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
      }
    }));
  },

  recordCorrect: () => {
    const { gameState, teams, cardPool, settings } = get();
    if (gameState.status !== 'in_progress') return;

    soundManager.playCorrect();
    triggerHaptic('correct');

    const activeTeamId = gameState.active_team_id;
    const updatedTeams = teams.map(t => 
      t.id === activeTeamId ? { ...t, score: t.score + settings.correct_points } : t
    );

    const turnItem: GameTurn = {
      round_number: gameState.current_round,
      team_id: activeTeamId,
      card_id: gameState.current_card?.id,
      action: 'correct',
      points: settings.correct_points,
    };

    const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

    set({
      teams: updatedTeams,
      gameState: {
        ...gameState,
        turn_correct_count: gameState.turn_correct_count + 1,
        current_card: nextCard,
        cards_used_ids: [...gameState.cards_used_ids, nextCard.id],
        turn_history: [...gameState.turn_history, turnItem],
      }
    });
  },

  recordPass: () => {
    const { gameState, cardPool } = get();
    if (gameState.status !== 'in_progress' || (gameState.remaining_passes <= 0 && gameState.remaining_passes < 99)) return;

    soundManager.playPass();
    triggerHaptic('pass');

    const turnItem: GameTurn = {
      round_number: gameState.current_round,
      team_id: gameState.active_team_id,
      card_id: gameState.current_card?.id,
      action: 'pass',
      points: 0,
    };

    const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

    set({
      gameState: {
        ...gameState,
        remaining_passes: gameState.remaining_passes >= 99 ? gameState.remaining_passes : gameState.remaining_passes - 1,
        turn_pass_count: gameState.turn_pass_count + 1,
        current_card: nextCard,
        cards_used_ids: [...gameState.cards_used_ids, nextCard.id],
        turn_history: [...gameState.turn_history, turnItem],
      }
    });
  },

  recordBuzzer: (rivalPlayerName, rivalTeamId) => {
    const { gameState, teams, cardPool, settings } = get();
    if (gameState.status !== 'in_progress') return;
    if (settings.tabu_limit > 0 && gameState.remaining_tabus <= 0) return;

    soundManager.playBuzzer();
    triggerHaptic('buzzer');

    const activeTeamId = gameState.active_team_id;
    const penalty = settings.buzzer_penalty; // e.g. -1

    const updatedTeams = teams.map(t => 
      t.id === activeTeamId ? { ...t, score: Math.max(0, t.score + penalty) } : t
    );

    const turnItem: GameTurn = {
      round_number: gameState.current_round,
      team_id: activeTeamId,
      card_id: gameState.current_card?.id,
      action: 'buzzer',
      points: penalty,
    };

    const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

    set({
      teams: updatedTeams,
      gameState: {
        ...gameState,
        remaining_tabus: settings.tabu_limit > 0 ? gameState.remaining_tabus - 1 : gameState.remaining_tabus,
        turn_tabu_count: gameState.turn_tabu_count + 1,
        current_card: nextCard,
        cards_used_ids: [...gameState.cards_used_ids, nextCard.id],
        turn_history: [...gameState.turn_history, turnItem],
      }
    });
  },

  recordTimeout: () => {
    const { gameState } = get();
    if (gameState.status !== 'in_progress') return;

    soundManager.playBuzzer();
    triggerHaptic('buzzer');

    const turnItem: GameTurn = {
      round_number: gameState.current_round,
      team_id: gameState.active_team_id,
      card_id: gameState.current_card?.id,
      action: 'timeout',
      points: 0,
    };

    set({
      gameState: {
        ...gameState,
        status: 'turn_break',
        buzzer_locked_by: null,
        turn_history: [...gameState.turn_history, turnItem],
      }
    });
  },

  endTurnAndNext: () => {
    const { gameState, teams, settings } = get();
    const nextIndex = calculateNextTeamIndex(gameState.active_team_index, teams.length);
    const isRoundAdvance = nextIndex === 0;
    const nextRound = isRoundAdvance ? gameState.current_round + 1 : gameState.current_round;

    const { isEnded, isTie } = checkGameEnd(nextRound, settings.total_rounds, teams, settings.target_score);

    if (isEnded && !isTie) {
      soundManager.playFanfare();
      set({
        gameState: {
          ...gameState,
          status: 'finished',
        }
      });
      return;
    }

    if (isTie) {
      set({
        isGoldenRound: true,
        gameState: {
          ...gameState,
          status: 'turn_break',
          total_rounds: gameState.total_rounds + 1,
          current_round: nextRound,
          active_team_index: nextIndex,
          active_team_id: teams[nextIndex].id,
          time_remaining: settings.turn_duration,
          remaining_passes: settings.pass_limit,
          remaining_tabus: settings.tabu_limit > 0 ? settings.tabu_limit : 999,
          turn_correct_count: 0,
          turn_pass_count: 0,
          turn_tabu_count: 0,
          buzzer_locked_by: null,
        }
      });
      return;
    }

    set({
      gameState: {
        ...gameState,
        status: 'starting',
        current_round: nextRound,
        active_team_index: nextIndex,
        active_team_id: teams[nextIndex].id,
        time_remaining: settings.turn_duration,
        remaining_passes: settings.pass_limit,
        remaining_tabus: settings.tabu_limit > 0 ? settings.tabu_limit : 999,
        turn_correct_count: 0,
        turn_pass_count: 0,
        turn_tabu_count: 0,
        buzzer_locked_by: null,
      }
    });
  },

  resetGame: () => {
    const { teams, settings } = get();
    get().initializeGame(teams, settings);
  },

  syncRemoteState: (partialState) => {
    set((state) => ({
      gameState: { ...state.gameState, ...partialState }
    }));
  }
}));
