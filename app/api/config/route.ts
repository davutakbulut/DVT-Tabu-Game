import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DEFAULT_MONETIZATION_CONFIG = {
  paywall_games_threshold: 2,
  ai_deck_paywall_enabled: true,
  vip_room_paywall_enabled: false,
  paywall_3plus_teams_enabled: true,
  paywall_custom_rules_enabled: false,
  paywall_vip_decks_enabled: false,
  monthly_price: 49.99,
  annual_price: 349.99,
  active_campaign_title: '%40 Lansman Fırsatı',
  campaign_badge: 'SINIRLI SÜRE',
  updated_at: new Date().toISOString(),
};

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .eq('id', 'monetization')
        .single();

      if (!error && data?.data) {
        return NextResponse.json({
          config: { ...DEFAULT_MONETIZATION_CONFIG, ...data.data },
          updated_at: data.updated_at,
        });
      }
    } catch {}
  }

  return NextResponse.json({
    config: DEFAULT_MONETIZATION_CONFIG,
    updated_at: DEFAULT_MONETIZATION_CONFIG.updated_at,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const configData = body.config || body;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('app_config')
        .upsert({
          id: 'monetization',
          category: 'monetization',
          data: configData,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, config: data[0].data });
    }

    return NextResponse.json({ error: 'Supabase bağlantısı aktif değil' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
