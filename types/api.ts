import { Card, AiRecommendation, AiMatchSummary, CustomDeck } from './game';

export type AiRequestType = 'daily_recommendation' | 'post_game_analysis' | 'generate_deck' | 'difficulty_balancer';

export interface AiSuggestRequest {
  type: AiRequestType;
  context?: Record<string, any>;
}

export interface AiSuggestResponse {
  data?: AiRecommendation | AiMatchSummary | { theme: string; cards: Card[] } | Record<string, any>;
  error?: string;
}
