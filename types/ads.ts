export interface AdItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  image_url?: string;
  cta_text: string;
  target_url: string;
  placement: 'all' | 'turn_break' | 'round_end' | 'match_end';
  color_theme?: string; // Gradient or hex
  is_active: boolean;
  impressions: number;
  clicks: number;
  created_at?: string;
}

export interface AdConfig {
  ads_enabled: boolean;
  pro_users_ad_free: boolean;
  interval_turns: number; // e.g. 2 means every 2 turns
  on_round_end: boolean;
  on_match_end: boolean;
  skip_delay_seconds: number; // e.g. 3 or 5 seconds before skip button becomes active
  updated_at?: string;
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  ads_enabled: true,
  pro_users_ad_free: true,
  interval_turns: 2,
  on_round_end: true,
  on_match_end: true,
  skip_delay_seconds: 3,
  updated_at: new Date().toISOString(),
};

export const DEFAULT_ADS: AdItem[] = [
  {
    id: 'ad-dvt-pro',
    title: 'DVT Tabu Pro VIP',
    description: 'Tüm reklamları kaldırın, sınırsız Gemini AI destesi üretin ve 6 kişilik takımlarla oynayın!',
    badge: 'ÖZEL FIRSAT',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    cta_text: 'Hemen Pro\'ya Geç',
    target_url: '/paywall',
    placement: 'all',
    color_theme: 'from-amber-500 via-orange-600 to-rose-600',
    is_active: true,
    impressions: 0,
    clicks: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ad-coffee-break',
    title: 'Parti Molasında Kahve Keyfi',
    description: 'Tabu kapışması kızışırken sıradaki tur için enerjini tazele!',
    badge: 'SPONSORLU',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    cta_text: 'Sipariş Ver',
    target_url: 'https://portegu.com',
    placement: 'turn_break',
    color_theme: 'from-amber-700 via-amber-800 to-stone-900',
    is_active: true,
    impressions: 0,
    clicks: 0,
    created_at: new Date().toISOString(),
  },
];
