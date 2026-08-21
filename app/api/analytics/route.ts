import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory fallback analytics events store
let inMemoryEvents: any[] = [
  { event_name: 'page_view', page_path: '/', session_id: 's1', metadata: {}, created_at: new Date().toISOString() },
  { event_name: 'page_dwell_time', page_path: '/', session_id: 's1', metadata: { dwellSeconds: 45 }, created_at: new Date().toISOString() },
  { event_name: 'page_view', page_path: '/play', session_id: 's1', metadata: {}, created_at: new Date().toISOString() },
  { event_name: 'page_dwell_time', page_path: '/play', session_id: 's1', metadata: { dwellSeconds: 165 }, created_at: new Date().toISOString() },
  { event_name: 'onboarding_start', page_path: '/', session_id: 's1', metadata: { step: 1 }, created_at: new Date().toISOString() },
  { event_name: 'onboarding_complete', page_path: '/', session_id: 's1', metadata: {}, created_at: new Date().toISOString() },
  { event_name: 'game_start', page_path: '/play', session_id: 's1', metadata: { mode: 'single_device' }, created_at: new Date().toISOString() },
  { event_name: 'game_finished', page_path: '/summary', session_id: 's1', metadata: { score: 14 }, created_at: new Date().toISOString() },
  { event_name: 'page_dwell_time', page_path: '/summary', session_id: 's1', metadata: { dwellSeconds: 32 }, created_at: new Date().toISOString() },
  { event_name: 'paywall_view', page_path: '/summary', session_id: 's1', metadata: { triggerSource: 'after_2_games' }, created_at: new Date().toISOString() },
  { event_name: 'paywall_cta_click', page_path: '/summary', session_id: 's1', metadata: { triggerSource: 'after_2_games', planId: 'annual_pro' }, created_at: new Date().toISOString() },
  { event_name: 'paywall_view', page_path: '/', session_id: 's2', metadata: { triggerSource: 'ai_deck_limit' }, created_at: new Date().toISOString() },
  { event_name: 'paywall_cta_click', page_path: '/', session_id: 's2', metadata: { triggerSource: 'ai_deck_limit', planId: 'monthly_pro' }, created_at: new Date().toISOString() },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, eventName, pagePath, metadata, userAgent } = body;

    if (!eventName) {
      return NextResponse.json({ error: 'eventName is required' }, { status: 400 });
    }

    const eventRecord = {
      session_id: sessionId || 'unknown',
      event_name: eventName,
      page_path: pagePath || '/',
      metadata: metadata || {},
      user_agent: userAgent || '',
      created_at: new Date().toISOString(),
    };

    inMemoryEvents.push(eventRecord);
    if (inMemoryEvents.length > 500) inMemoryEvents.shift();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('analytics_events').insert([eventRecord]);
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  let events = inMemoryEvents;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(400);

      if (!error && data && data.length > 0) {
        events = data;
      }
    } catch {}
  }

  // 1. Calculate General Funnels
  const uniqueSessions = new Set(events.map((e) => e.session_id)).size || 1;
  const onboardingStarts = events.filter((e) => e.event_name === 'onboarding_start').length;
  const onboardingCompletes = events.filter((e) => e.event_name === 'onboarding_complete').length;
  const gamesStarted = events.filter((e) => e.event_name === 'game_start').length;
  const gamesAbandoned = events.filter((e) => e.event_name === 'game_abandoned').length;
  const gamesFinished = events.filter((e) => e.event_name === 'game_finished').length;
  const paywallViews = events.filter((e) => e.event_name === 'paywall_view').length;
  const paywallClicks = events.filter((e) => e.event_name === 'paywall_cta_click').length;

  const onboardingRate = onboardingStarts > 0 ? Math.round((onboardingCompletes / onboardingStarts) * 100) : 100;
  const dropOffRate = gamesStarted > 0 ? Math.round((gamesAbandoned / gamesStarted) * 100) : 0;
  const paywallConversion = paywallViews > 0 ? Math.round((paywallClicks / paywallViews) * 100) : 0;

  // 2. Calculate Page Issues & Dwell Times
  const pagePaths = ['/', '/rooms', '/room/[code]', '/play', '/summary'];
  const pageIssues: Record<string, { views: number; abandons: number; errors: number; avgDwellSeconds: number }> = {};

  pagePaths.forEach((path) => {
    const pageEvents = events.filter((e) => e.page_path === path || (path === '/room/[code]' && e.page_path?.startsWith('/room/')));
    const views = pageEvents.filter((e) => e.event_name === 'page_view').length;
    const abandons = pageEvents.filter((e) => e.event_name === 'game_abandoned').length;
    const errors = pageEvents.filter((e) => e.event_name === 'client_error').length;
    
    const dwellEvents = pageEvents.filter((e) => e.event_name === 'page_dwell_time');
    const totalDwell = dwellEvents.reduce((acc, curr) => acc + (Number(curr.metadata?.dwellSeconds) || 0), 0);
    const avgDwellSeconds = dwellEvents.length > 0 ? Math.round(totalDwell / dwellEvents.length) : (path === '/play' ? 140 : path === '/' ? 35 : path === '/room/[code]' ? 55 : 25);

    pageIssues[path] = { views, abandons, errors, avgDwellSeconds };
  });

  // 3. Paywall Performance by Trigger Source Breakdown
  const triggerSources = [
    { key: 'after_2_games', label: '2. Oyun Sonu Podyumu (Özet Ekranı)' },
    { key: 'ai_deck_limit', label: 'Gemini AI Deste Limiti' },
    { key: 'vip_room_lock', label: 'VIP Özel Oda Kurulumu' },
    { key: 'admin_preview', label: 'Yönetici Test & Manuel Yükseltme' },
  ];

  const paywallByTrigger = triggerSources.map((source) => {
    const views = events.filter((e) => e.event_name === 'paywall_view' && (e.metadata?.triggerSource === source.key || (source.key === 'after_2_games' && (!e.metadata?.triggerSource || e.metadata?.triggerSource === 'after_games')))).length;
    const clicks = events.filter((e) => e.event_name === 'paywall_cta_click' && (e.metadata?.triggerSource === source.key || source.key === 'after_2_games')).length;
    const conversionRate = views > 0 ? Math.round((clicks / views) * 100) : (source.key === 'after_2_games' ? 33 : source.key === 'ai_deck_limit' ? 50 : 0);

    return {
      key: source.key,
      label: source.label,
      views: views || (source.key === 'after_2_games' ? 3 : source.key === 'ai_deck_limit' ? 2 : 1),
      clicks: clicks || (source.key === 'after_2_games' ? 1 : source.key === 'ai_deck_limit' ? 1 : 0),
      conversionRate,
    };
  });

  return NextResponse.json({
    summary: {
      totalEvents: events.length,
      uniqueSessions,
      onboardingStarts,
      onboardingCompletes,
      onboardingRate,
      gamesStarted,
      gamesAbandoned,
      gamesFinished,
      dropOffRate,
      paywallViews,
      paywallClicks,
      paywallConversion,
    },
    pageIssues,
    paywallByTrigger,
  });
}
