import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Card, Team, GameSettings, GameTurn, ActiveGameState } from '@/types/game';
import { INITIAL_CARDS, DEFAULT_GAME_SETTINGS } from '@/lib/constants';
import { filterCards, getNextCard, calculateNextTeamIndex, checkGameEnd } from '@/lib/game-logic';
import { soundManager } from '@/lib/audio';
import { triggerHaptic } from '@/lib/haptics';

interface GameStoreState {
  gameId: string | null;
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
  finishGameEarly: () => void;
  resetGame: () => void;
  clearActiveGame: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  setGameMode: (mode: 'single_device' | 'multiplayer') => void;
  syncRemoteState: (partialState: Partial<ActiveGameState>) => void;
}

const initialTeams: Team[] = [
  { id: 'team-1', name: 'Mavi Şimşekler', color: '#3b82f6', score: 0, order_index: 0 },
  { id: 'team-2', name: 'Kırmızı Ejderler', color: '#ef4444', score: 0, order_index: 1 },
];

const getGuestId = () => {
  if (typeof window === 'undefined') return 'server_guest';
  try {
    let gId = localStorage.getItem('dvt_tabu_guest_id');
    if (!gId) {
      gId = 'gst_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('dvt_tabu_guest_id', gId);
    }
    return gId;
  } catch {
    return 'unknown_guest';
  }
};

const syncGameSessionToBackend = (
  gameId: string | null,
  gameState: ActiveGameState,
  teams: Team[],
  settings: GameSettings,
  statusOverride?: string
) => {
  if (!gameId || typeof window === 'undefined') return;

  const winner = [...teams].sort((a, b) => b.score - a.score)[0];
  const payload = {
    id: gameId,
    guest_id: getGuestId(),
    status: statusOverride || gameState.status,
    current_round: gameState.current_round,
    total_rounds: gameState.total_rounds,
    active_team_index: gameState.active_team_index,
    teams,
    settings,
    winner_team_name: gameState.status === 'finished' ? winner?.name : null,
    winner_score: gameState.status === 'finished' ? winner?.score : null,
    total_correct: gameState.turn_history.filter((h) => h.action === 'correct').length,
    total_pass: gameState.turn_history.filter((h) => h.action === 'pass').length,
    total_tabu: gameState.turn_history.filter((h) => h.action === 'tabu' || h.action === 'buzzer').length,
    finished_at: gameState.status === 'finished' ? new Date().toISOString() : null,
  };

  try {
    fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
};

const recordCardEventToBackend = (
  gameId: string | null,
  card: Card | null,
  action: string,
  teamName: string,
  roundNumber: number,
  points: number
) => {
  if (!gameId || !card || typeof window === 'undefined') return;

  const payload = {
    game_id: gameId,
    card_id: card.id,
    deck_id: (card as any).deck_id || 'deck-general',
    main_word: card.main_word,
    action,
    team_name: teamName,
    round_number: roundNumber,
    points,
  };

  try {
    fetch('/api/games/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
};

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      gameId: null,
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

        if (!customCards || customCards.length === 0) {
          baseCards = await get().fetchLiveCards();
        }

        const pool = filterCards(baseCards, settings);
        const firstCard = getNextCard(pool, []);
        const newGameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const freshTeams = teams.map((t) => ({ ...t, score: 0 }));

        const freshGameState: ActiveGameState = {
          status: 'starting',
          current_round: 1,
          total_rounds: settings.total_rounds,
          active_team_index: 0,
          active_team_id: freshTeams[0]?.id || 'team-1',
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
        };

        set({
          gameId: newGameId,
          settings,
          teams: freshTeams,
          cardPool: pool,
          isGoldenRound: false,
          gameState: freshGameState,
        });

        // Sync initial match record to backend
        syncGameSessionToBackend(newGameId, freshGameState, freshTeams, settings, 'in_progress');
      },

      startTurn: () => {
        const { cardPool, gameState, settings, gameId, teams } = get();
        const nextCard = getNextCard(cardPool, gameState.cards_used_ids);
        
        const newGameState: ActiveGameState = {
          ...gameState,
          status: 'in_progress',
          current_card: nextCard,
          time_remaining: settings.turn_duration,
          remaining_passes: settings.pass_limit,
          remaining_tabus: settings.tabu_limit > 0 ? settings.tabu_limit : 999,
          turn_correct_count: 0,
          turn_pass_count: 0,
          turn_tabu_count: 0,
          buzzer_locked_by: null,
          cards_used_ids: [...gameState.cards_used_ids, nextCard.id],
          turn_history: [],
        };

        set({ gameState: newGameState });
        syncGameSessionToBackend(gameId, newGameState, teams, settings);
      },

      recordCorrect: () => {
        const { gameState, cardPool, teams, isGoldenRound, gameId, settings } = get();
        if (gameState.status !== 'in_progress' || !gameState.current_card) return;

        soundManager.playCorrect();
        triggerHaptic('correct');

        const pointMultiplier = isGoldenRound ? 2 : (settings.correct_points || 1);
        const activeTeam = teams[gameState.active_team_index] || teams[0];
        const activeTeamId = activeTeam.id;

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

        recordCardEventToBackend(
          gameId,
          gameState.current_card,
          'correct',
          activeTeam.name,
          gameState.current_round,
          pointMultiplier
        );

        const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

        const newGameState: ActiveGameState = {
          ...gameState,
          turn_correct_count: gameState.turn_correct_count + 1,
          current_card: nextCard,
          cards_used_ids: [...gameState.cards_used_ids, nextCard.id],
          turn_history: [...gameState.turn_history, newHistory],
        };

        set({
          teams: updatedTeams,
          gameState: newGameState,
        });

        syncGameSessionToBackend(gameId, newGameState, updatedTeams, settings);
      },

      recordPass: () => {
        const { gameState, cardPool, settings, gameId, teams } = get();
        if (gameState.status !== 'in_progress' || !gameState.current_card) return;

        if (settings.pass_limit > 0 && gameState.remaining_passes <= 0) {
          soundManager.playBuzzer();
          triggerHaptic('buzzer');
          return;
        }

        soundManager.playPass();
        triggerHaptic('pass');

        const activeTeam = teams[gameState.active_team_index] || teams[0];
        const activeTeamId = activeTeam.id;

        const newHistory: GameTurn = {
          card: gameState.current_card,
          action: 'pass',
          timestamp: Date.now(),
          score_change: 0,
          performed_by_team: activeTeamId,
        };

        recordCardEventToBackend(
          gameId,
          gameState.current_card,
          'pass',
          activeTeam.name,
          gameState.current_round,
          0
        );

        const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

        const newGameState: ActiveGameState = {
          ...gameState,
          remaining_passes: settings.pass_limit > 0 ? gameState.remaining_passes - 1 : gameState.remaining_passes,
          turn_pass_count: gameState.turn_pass_count + 1,
          current_card: nextCard,
          cards_used_ids: [...gameState.cards_used_ids, nextCard.id],
          turn_history: [...gameState.turn_history, newHistory],
        };

        set({ gameState: newGameState });
        syncGameSessionToBackend(gameId, newGameState, teams, settings);
      },

      recordBuzzer: (rivalPlayerName, rivalTeamId) => {
        const { gameState, cardPool, teams, settings, gameId } = get();
        if (gameState.status !== 'in_progress' || !gameState.current_card) return;

        soundManager.playBuzzer();
        triggerHaptic('buzzer');

        const activeTeam = teams[gameState.active_team_index] || teams[0];
        const penalty = settings.buzzer_penalty ?? -1;

        const updatedTeams = teams.map((team) =>
          team.id === activeTeam.id ? { ...team, score: Math.max(0, team.score + penalty) } : team
        );

        const newHistory: GameTurn = {
          card: gameState.current_card,
          action: 'buzzer',
          timestamp: Date.now(),
          score_change: penalty,
          performed_by_team: activeTeam.id,
          buzzer_pressed_by: rivalPlayerName || 'Rakip Takım',
        };

        recordCardEventToBackend(
          gameId,
          gameState.current_card,
          'tabu',
          activeTeam.name,
          gameState.current_round,
          penalty
        );

        const remainingTabusAfter = gameState.remaining_tabus - 1;
        const reachedTabuLimit = settings.tabu_limit > 0 && remainingTabusAfter <= 0;

        if (reachedTabuLimit) {
          const timeoutState: ActiveGameState = {
            ...gameState,
            status: 'turn_break',
            remaining_tabus: 0,
            turn_tabu_count: gameState.turn_tabu_count + 1,
            time_remaining: 0,
            turn_history: [...gameState.turn_history, newHistory],
          };
          set({
            teams: updatedTeams,
            gameState: timeoutState,
          });
          syncGameSessionToBackend(gameId, timeoutState, updatedTeams, settings);
          return;
        }

        const nextCard = getNextCard(cardPool, gameState.cards_used_ids);

        const newGameState: ActiveGameState = {
          ...gameState,
          remaining_tabus: remainingTabusAfter,
          turn_tabu_count: gameState.turn_tabu_count + 1,
          current_card: nextCard,
          cards_used_ids: [...gameState.cards_used_ids, nextCard.id],
          turn_history: [...gameState.turn_history, newHistory],
        };

        set({
          teams: updatedTeams,
          gameState: newGameState,
        });

        syncGameSessionToBackend(gameId, newGameState, updatedTeams, settings);
      },

      recordTimeout: () => {
        const { gameState, gameId, teams, settings } = get();
        if (gameState.status !== 'in_progress') return;

        soundManager.playBuzzer();
        triggerHaptic('buzzer');

        const newGameState: ActiveGameState = {
          ...gameState,
          status: 'turn_break',
          time_remaining: 0,
        };

        set({ gameState: newGameState });
        syncGameSessionToBackend(gameId, newGameState, teams, settings);
      },

      endTurnAndNext: () => {
        const { gameState, teams, settings, cardPool, isGoldenRound, gameId } = get();
        const nextTeamIndex = calculateNextTeamIndex(gameState.active_team_index, teams.length);
        const nextRound = nextTeamIndex === 0 ? gameState.current_round + 1 : gameState.current_round;
        const isRoundComplete = nextTeamIndex === 0;

        const gameEndResult = checkGameEnd(
          nextRound,
          settings.total_rounds,
          teams,
          settings.target_score,
          isRoundComplete
        );

        if (gameEndResult.isEnded) {
          if (gameEndResult.isTie && !isGoldenRound && settings.golden_round_enabled) {
            set({ isGoldenRound: true });
          } else {
            const finishedState: ActiveGameState = {
              ...gameState,
              status: 'finished',
            };
            set({ gameState: finishedState });
            soundManager.playFanfare();
            syncGameSessionToBackend(gameId, finishedState, teams, settings, 'finished');
            return;
          }
        }

        const nextCard = getNextCard(cardPool, gameState.cards_used_ids);
        const nextTeam = teams[nextTeamIndex] || teams[0];

        const nextGameState: ActiveGameState = {
          ...gameState,
          status: 'starting',
          current_round: nextRound,
          active_team_index: nextTeamIndex,
          active_team_id: nextTeam.id,
          current_card: nextCard,
          time_remaining: settings.turn_duration,
          remaining_passes: settings.pass_limit,
          remaining_tabus: settings.tabu_limit > 0 ? settings.tabu_limit : 999,
          turn_correct_count: 0,
          turn_pass_count: 0,
          turn_tabu_count: 0,
          buzzer_locked_by: null,
          cards_used_ids: [...gameState.cards_used_ids, nextCard.id],
          turn_history: [],
        };

        set({ gameState: nextGameState });
        syncGameSessionToBackend(gameId, nextGameState, teams, settings);
      },

      finishGameEarly: () => {
        const { gameState, teams, settings, gameId } = get();
        const finishedState: ActiveGameState = {
          ...gameState,
          status: 'finished',
        };
        set({ gameState: finishedState });
        soundManager.playFanfare();
        syncGameSessionToBackend(gameId, finishedState, teams, settings, 'finished');
      },

      resetGame: () => {
        const { teams, settings, cardPool, gameId } = get();
        const firstCard = getNextCard(cardPool, []);

        const resetState: ActiveGameState = {
          status: 'idle',
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
        };

        set({
          teams: teams.map((t) => ({ ...t, score: 0 })),
          isGoldenRound: false,
          gameState: resetState,
        });

        if (gameId) {
          syncGameSessionToBackend(gameId, resetState, teams, settings, 'abandoned');
        }
      },

      clearActiveGame: () => {
        set({
          gameId: null,
          gameState: {
            status: 'idle',
            current_round: 1,
            total_rounds: DEFAULT_GAME_SETTINGS.total_rounds,
            active_team_index: 0,
            active_team_id: 'team-1',
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
        });
      },

      syncRemoteState: (partialState) => {
        set((state) => ({
          gameState: { ...state.gameState, ...partialState }
        }));
      },
    }),
    {
      name: 'dvt_tabu_active_game',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gameId: state.gameId,
        settings: state.settings,
        teams: state.teams,
        isGoldenRound: state.isGoldenRound,
        gameMode: state.gameMode,
        gameState: state.gameState,
      }),
    }
  )
);
