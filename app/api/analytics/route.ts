import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory fallback logs if Supabase is offline
const memoryLogs: any[] = [
  { event_name: 'onboarding_start', page_path: '/', metadata: { step: 1 }, created_at: new Date().toISOString() },
  { event_name: 'onboarding_complete', page_path: '/', metadata: {}, created_at: new Date().toISOString() },
  { event_name: 'game_start', page_path: '/play', metadata: { mode: 'single_device' }, created_at: new Date().toISOString() },
  { event_name: 'game_finished', page_path: '/summary', metadata: { score: 12 }, created_at: new Date().toISOString() },
  { event_name: 'paywall_view', page_path: '/summary', metadata: { triggerSource: 'after_2_games' }, created_at: new Date().toISOString() },
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
      user_agent: userAgent || null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      await supabase.from('analytics_events').insert([eventRecord]);
    } else {
      memoryLogs.push(eventRecord);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    let events: any[] = [];

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!error && data) {
        events = data;
      }
    }

    if (events.length === 0) {
      events = memoryLogs;
    }

    // 1. Calculate Metrics
    const totalEvents = events.length;
    const uniqueSessions = new Set(events.map((e) => e.session_id)).size;

    // 2. Onboarding Funnel
    const onboardingStarts = events.filter((e) => e.event_name === 'onboarding_start').length;
    const onboardingCompletes = events.filter((e) => e.event_name === 'onboarding_complete').length;
    const onboardingSkips = events.filter((e) => e.event_name === 'onboarding_skip').length;
    const onboardingRate = onboardingStarts > 0 ? Math.round((onboardingCompletes / onboardingStarts) * 100) : 100;

    // 3. Gameplay Drop-off Funnel
    const gamesStarted = events.filter((e) => e.event_name === 'game_start').length;
    const gamesAbandoned = events.filter((e) => e.event_name === 'game_abandoned').length;
    const gamesFinished = events.filter((e) => e.event_name === 'game_finished').length;
    const dropOffRate = gamesStarted > 0 ? Math.round((gamesAbandoned / gamesStarted) * 100) : 0;

    // 4. Paywall Performance
    const paywallViews = events.filter((e) => e.event_name === 'paywall_view').length;
    const paywallClicks = events.filter((e) => e.event_name === 'paywall_cta_click').length;
    const paywallConversion = paywallViews > 0 ? Math.round((paywallClicks / paywallViews) * 100) : 0;

    // 5. Page Health & Issues (Drop-off by Page)
    const pageIssues: Record<string, { views: number; errors: number; abandons: number }> = {
      '/': { views: 0, errors: 0, abandons: 0 },
      '/rooms': { views: 0, errors: 0, abandons: 0 },
      '/room/[code]': { views: 0, errors: 0, abandons: 0 },
      '/play': { views: 0, errors: 0, abandons: 0 },
      '/summary': { views: 0, errors: 0, abandons: 0 },
    };

    events.forEach((ev) => {
      const p = ev.page_path || '/';
      const key = p.startsWith('/room/') ? '/room/[code]' : p;
      if (!pageIssues[key]) {
        pageIssues[key] = { views: 0, errors: 0, abandons: 0 };
      }
      if (ev.event_name === 'page_view' || ev.event_name === 'game_start') pageIssues[key].views += 1;
      if (ev.event_name === 'client_error') pageIssues[key].errors += 1;
      if (ev.event_name === 'game_abandoned') pageIssues[key].abandons += 1;
    });

    // 6. Recent Client Errors
    const errors = events
      .filter((e) => e.event_name === 'client_error')
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalEvents,
        uniqueSessions: Math.max(1, uniqueSessions),
        onboardingStarts,
        onboardingCompletes,
        onboardingSkips,
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
      recentErrors: errors,
      recentEvents: events.slice(0, 30),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
