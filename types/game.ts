export type Category = 
  | 'Genel Kültür'
  | 'Sinema & Dizi'
  | 'Spor'
  | 'Teknoloji'
  | 'Yemek & Mutfak'
  | 'Seyahat & Coğrafya'
  | 'Tarih'
  | 'Müzik & Sanat'
  | 'Bilim & Doğa'
  | '90lar & 2000ler';

export type Difficulty = 'Kolay' | 'Orta' | 'Zor';

export interface Card {
  id: string;
  main_word: string;
  forbidden_words: [string, string, string, string, string];
  category: Category | string;
  difficulty: Difficulty;
  language?: 'tr' | 'en';
}

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  order_index: number;
}

export interface Player {
  id: string;
  room_id?: string;
  user_id?: string;
  guest_name: string;
  avatar_url?: string;
  team_id?: string;
  is_ready: boolean;
  is_host: boolean;
  is_presenter: boolean;
}

export interface GameSettings {
  team_count: number;
  turn_duration: number; // 30 - 120s
  total_rounds: number; // e.g. 6 rounds
  pass_limit: number; // 0 - 10, or 999 for unlimited
  tabu_limit: number; // 0 for unlimited, or 1, 2, 3, 5 max tabus per turn
  buzzer_penalty: number; // -1, -2, 0
  correct_points: number; // 1, 2
  target_score?: number | null;
  categories: (Category | string)[];
  difficulty: Difficulty | 'Tümü';
  deck_id?: string | null;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  host_id?: string;
  is_private: boolean;
  password_hash?: string | null;
  settings: GameSettings;
  status: 'waiting' | 'playing' | 'paused' | 'finished' | 'closed';
  current_game_id?: string | null;
  created_at: string;
}

export interface GameTurn {
  id?: string;
  round_number: number;
  team_id: string;
  player_id?: string;
  card_id?: string;
  action: 'correct' | 'pass' | 'buzzer' | 'timeout';
  points: number;
  timestamp?: string;
}

export interface ActiveGameState {
  status: 'idle' | 'starting' | 'in_progress' | 'turn_break' | 'paused' | 'finished';
  current_round: number;
  total_rounds: number;
  active_team_index: number;
  active_team_id: string;
  active_presenter_id?: string;
  active_presenter_name?: string;
  current_card: Card | null;
  time_remaining: number;
  remaining_passes: number;
  remaining_tabus: number;
  turn_correct_count: number;
  turn_pass_count: number;
  turn_tabu_count: number;
  buzzer_locked_by?: {
    player_id: string;
    player_name: string;
    team_id: string;
  } | null;
  cards_used_ids: string[];
  turn_history: GameTurn[];
}

export interface CustomDeck {
  id: string;
  name: string;
  description?: string;
  share_code: string;
  created_by?: string;
  is_public: boolean;
  cards: Card[];
  card_count: number;
  play_count: number;
  created_at?: string;
}

export interface AiRecommendation {
  date: string;
  headline: string;
  daily_vibe: string;
  recommended_modes: Array<{
    title: string;
    recommended_duration_seconds: number;
    recommended_pass_limit: number;
    reason: string;
  }>;
  featured_card_of_the_day: Card;
}

export interface AiMatchSummary {
  match_headline: string;
  commentary: string;
  mvp_spotlight: string;
  key_takeaways: string[];
}
