import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

let memoryAdEvents: any[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const adId = searchParams.get('adId');
    const eventType = searchParams.get('eventType');

    let events = memoryAdEvents;

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('ad_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (adId) query = query.eq('ad_id', adId);
        if (eventType) query = query.eq('event_type', eventType);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          events = data;
        }
      } catch {}
    }

    const pageStats: Record<string, { impressions: number; clicks: number; skips: number; ctr: number }> = {};
    const adStats: Record<string, { title: string; impressions: number; clicks: number; skips: number; ctr: number }> = {};
    const placementStats: Record<string, { impressions: number; clicks: number; skips: number; ctr: number }> = {};

    events.forEach((ev) => {
      const page = ev.page_url || 'Bilinmeyen Sayfa';
      const aId = ev.ad_id || 'Bilinmeyen Reklam';
      const title = ev.ad_title || aId;
      const plc = ev.placement || 'all';

      if (!pageStats[page]) pageStats[page] = { impressions: 0, clicks: 0, skips: 0, ctr: 0 };
      if (ev.event_type === 'impression') pageStats[page].impressions += 1;
      if (ev.event_type === 'click') pageStats[page].clicks += 1;
      if (ev.event_type === 'skip') pageStats[page].skips += 1;

      if (!adStats[aId]) adStats[aId] = { title, impressions: 0, clicks: 0, skips: 0, ctr: 0 };
      if (ev.event_type === 'impression') adStats[aId].impressions += 1;
      if (ev.event_type === 'click') adStats[aId].clicks += 1;
      if (ev.event_type === 'skip') adStats[aId].skips += 1;

      if (!placementStats[plc]) placementStats[plc] = { impressions: 0, clicks: 0, skips: 0, ctr: 0 };
      if (ev.event_type === 'impression') placementStats[plc].impressions += 1;
      if (ev.event_type === 'click') placementStats[plc].clicks += 1;
      if (ev.event_type === 'skip') placementStats[plc].skips += 1;
    });

    Object.values(pageStats).forEach((s) => {
      s.ctr = s.impressions > 0 ? Math.round((s.clicks / s.impressions) * 100) : 0;
    });
    Object.values(adStats).forEach((s) => {
      s.ctr = s.impressions > 0 ? Math.round((s.clicks / s.impressions) * 100) : 0;
    });
    Object.values(placementStats).forEach((s) => {
      s.ctr = s.impressions > 0 ? Math.round((s.clicks / s.impressions) * 100) : 0;
    });

    return NextResponse.json({
      events,
      total_count: events.length,
      page_stats: pageStats,
      ad_stats: adStats,
      placement_stats: placementStats,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, events: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ad_id,
      ad_title,
      event_type,
      placement,
      display_type,
      page_url,
      user_id,
      guest_id,
      duration_watched_seconds,
      target_url,
      cta_text,
    } = body;

    if (!ad_id || !event_type) {
      return NextResponse.json({ error: 'ad_id and event_type are required' }, { status: 400 });
    }

    const eventRecord = {
      id: 'adev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
      ad_id,
      ad_title: ad_title || 'Reklam',
      event_type,
      placement: placement || 'all',
      display_type: display_type || 'popup',
      page_url: page_url || '/',
      user_id: user_id || null,
      guest_id: guest_id || null,
      duration_watched_seconds: duration_watched_seconds || 0,
      target_url: target_url || null,
      cta_text: cta_text || null,
      user_agent: req.headers.get('user-agent') || 'unknown',
      created_at: new Date().toISOString(),
    };

    memoryAdEvents.unshift(eventRecord);
    if (memoryAdEvents.length > 500) memoryAdEvents.pop();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('ad_events').insert([eventRecord]);
      } catch {
        try {
          await supabase.from('system_logs').insert([{
            event_type: 'ad_event_fallback',
            message: `Ad event: ${event_type} - ${ad_title || ad_id}`,
            page_url,
            user_id: user_id || guest_id,
            stack_trace: JSON.stringify(eventRecord),
            created_at: new Date().toISOString(),
          }]);
        } catch {}
      }
    }

    return NextResponse.json({ success: true, event: eventRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
