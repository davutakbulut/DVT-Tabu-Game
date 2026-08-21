import { Card, GameSettings, Team } from '@/types/game';
import { INITIAL_CARDS } from './constants';

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const filterCards = (cards: Card[], settings: GameSettings): Card[] => {
  let filtered = [...cards];
  if (settings.categories && settings.categories.length > 0) {
    filtered = filtered.filter(c => settings.categories.includes(c.category));
  }
  if (settings.difficulty && settings.difficulty !== 'Tümü') {
    filtered = filtered.filter(c => c.difficulty === settings.difficulty);
  }
  return filtered.length > 0 ? filtered : cards;
};

export const getNextCard = (availableCards: Card[], usedIds: string[]): Card => {
  const unused = availableCards.filter(c => !usedIds.includes(c.id));
  const pool = unused.length > 0 ? unused : availableCards;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || INITIAL_CARDS[0];
};

export const calculateNextTeamIndex = (currentIndex: number, teamCount: number): number => {
  return (currentIndex + 1) % teamCount;
};

export const checkGameEnd = (
  currentRound: number,
  totalRounds: number,
  teams: Team[],
  targetScore?: number | null,
  isRoundComplete: boolean = true
): { isEnded: boolean; isTie: boolean; winnerTeam?: Team } => {
  // Target score mode
  if (targetScore && targetScore > 0) {
    const reached = teams.find((t) => t.score >= targetScore);
    if (reached) {
      return { isEnded: true, isTie: false, winnerTeam: reached };
    }
  }

  // Round completed mode: All teams must have completed their turns in the final round
  if (isRoundComplete && currentRound > totalRounds) {
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    if (sorted.length > 1 && sorted[0].score === sorted[1].score) {
      return { isEnded: true, isTie: true }; // Trigger Golden Round
    }
    return { isEnded: true, isTie: false, winnerTeam: sorted[0] };
  }

  return { isEnded: false, isTie: false };
};
