import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEFAULT_AD_CONFIG, DEFAULT_ADS, AdConfig, AdItem } from '@/types/ads';

export const dynamic = 'force-dynamic';

// In-memory fallback if Supabase is temporarily offline
let memoryConfig: AdConfig = { ...DEFAULT_AD_CONFIG };
let memoryAds: AdItem[] = [...DEFAULT_ADS];

export async function GET(req: NextRequest) {
  try {
    let config = memoryConfig;
    let ads = memoryAds;

    if (isSupabaseConfigured()) {
      // 1. Fetch Ad Config
      const { data: configData } = await supabase
        .from('app_config')
        .select('*')
        .eq('id', 'ad_config')
        .single();

      if (configData?.data) {
        config = { ...DEFAULT_AD_CONFIG, ...configData.data };
      }

      // 2. Fetch Ad Inventory
      const { data: inventoryData } = await supabase
        .from('app_config')
        .select('*')
        .eq('id', 'ad_inventory')
        .single();

      if (inventoryData?.data?.ads) {
        ads = inventoryData.data.ads;
      }
    }

    return NextResponse.json({ config, ads });
  } catch (err: any) {
    return NextResponse.json({ config: memoryConfig, ads: memoryAds, error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { config, ads } = body;

    if (config) {
      memoryConfig = { ...memoryConfig, ...config, updated_at: new Date().toISOString() };
      if (isSupabaseConfigured()) {
        await supabase.from('app_config').upsert({
          id: 'ad_config',
          category: 'monetization',
          data: memoryConfig,
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (ads && Array.isArray(ads)) {
      memoryAds = ads;
      if (isSupabaseConfigured()) {
        await supabase.from('app_config').upsert({
          id: 'ad_inventory',
          category: 'monetization',
          data: { ads: memoryAds },
          updated_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, config: memoryConfig, ads: memoryAds });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ad_id, action } = body; // action: 'impression' | 'click'

    if (!ad_id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    // Update in memory
    memoryAds = memoryAds.map((ad) => {
      if (ad.id === ad_id) {
        return {
          ...ad,
          impressions: action === 'impression' ? (ad.impressions || 0) + 1 : ad.impressions,
          clicks: action === 'click' ? (ad.clicks || 0) + 1 : ad.clicks,
        };
      }
      return ad;
    });

    // Update in Supabase
    if (isSupabaseConfigured()) {
      await supabase.from('app_config').upsert({
        id: 'ad_inventory',
        category: 'monetization',
        data: { ads: memoryAds },
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
