import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface ActiveSession {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  isPro?: boolean;
  pagePath: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  os?: string;
  gameId?: string | null;
  roomCode?: string | null;
  activeTeam?: string | null;
  score?: number | null;
  lastActiveAt: number; // timestamp
  connectedAt: number; // timestamp
}

export interface LiveEventLog {
  id: string;
  sessionId: string;
  type: 'page_view' | 'game_action' | 'room_join' | 'paywall' | 'ad' | 'login';
  title: string;
  details?: string;
  pagePath: string;
  timestamp: number;
}

// In-Memory Presence Storage
let activeSessionsMap = new Map<string, ActiveSession>();
let recentEventsFeed: LiveEventLog[] = [];

// Seed initial demo sessions if empty so admin dashboard is vibrant
const seedMockSessions = () => {
  if (activeSessionsMap.size > 0) return;
  const now = Date.now();
  
  activeSessionsMap.set('sess_live_1', {
    sessionId: 'sess_live_1',
    userId: 'gst_98a72b',
    isPro: true,
    pagePath: '/play',
    deviceType: 'mobile',
    browser: 'Mobile Safari',
    os: 'iOS 18',
    gameId: 'game_live_412',
    activeTeam: 'Mavi Şimşekler',
    score: 14,
    lastActiveAt: now - 3000,
    connectedAt: now - 180000,
  });

  activeSessionsMap.set('sess_live_2', {
    sessionId: 'sess_live_2',
    userId: 'gst_33b81c',
    isPro: false,
    pagePath: '/room/TABU99',
    deviceType: 'mobile',
    browser: 'Chrome Mobile',
    os: 'Android 15',
    roomCode: 'TABU99',
    activeTeam: 'Kırmızı Ejderler',
    score: 9,
    lastActiveAt: now - 6000,
    connectedAt: now - 240000,
  });

  activeSessionsMap.set('sess_live_3', {
    sessionId: 'sess_live_3',
    userId: 'davut@example.com',
    userEmail: 'davut@example.com',
    isPro: true,
    pagePath: '/admin',
    deviceType: 'desktop',
    browser: 'Chrome 128',
    os: 'macOS',
    lastActiveAt: now - 1000,
    connectedAt: now - 600000,
  });

  activeSessionsMap.set('sess_live_4', {
    sessionId: 'sess_live_4',
    userId: 'gst_77d12f',
    isPro: false,
    pagePath: '/',
    deviceType: 'mobile',
    browser: 'Mobile Safari',
    os: 'iOS 18',
    lastActiveAt: now - 12000,
    connectedAt: now - 90000,
  });

  recentEventsFeed = [
    {
      id: 'ev_1',
      sessionId: 'sess_live_1',
      type: 'game_action',
      title: 'Doğru Bildi (+1 Puan)',
      details: 'Mavi Şimşekler • Kelime: METEOROLOJİ',
      pagePath: '/play',
      timestamp: now - 4000,
    },
    {
      id: 'ev_2',
      sessionId: 'sess_live_2',
      type: 'room_join',
      title: 'Odaya Katıldı',
      details: 'Oda: TABU99 • Kırmızı Ejderler',
      pagePath: '/room/TABU99',
      timestamp: now - 15000,
    },
    {
      id: 'ev_3',
      sessionId: 'sess_live_1',
      type: 'game_action',
      title: 'Pas Kullandı',
      details: 'Mavi Şimşekler • Kalan Pas: 2',
      pagePath: '/play',
      timestamp: now - 28000,
    },
    {
      id: 'ev_4',
      sessionId: 'sess_live_4',
      type: 'page_view',
      title: 'Ana Sayfa Ziyareti',
      details: 'Doğrudan Trafik / PWA',
      pagePath: '/',
      timestamp: now - 45000,
    },
  ];
};

seedMockSessions();

// Cleanup sessions inactive for > 45 seconds
const pruneInactiveSessions = () => {
  const now = Date.now();
  const cutoff = now - 45000;
  for (const [key, session] of activeSessionsMap.entries()) {
    if (session.lastActiveAt < cutoff) {
      activeSessionsMap.delete(key);
    }
  }
};

// 1. POST /api/presence (Client Heartbeat)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      userId,
      userEmail,
      isPro,
      pagePath,
      deviceType,
      browser,
      os,
      gameId,
      roomCode,
      activeTeam,
      score,
      eventLog,
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const now = Date.now();
    const existing = activeSessionsMap.get(sessionId);

    activeSessionsMap.set(sessionId, {
      sessionId,
      userId: userId || existing?.userId,
      userEmail: userEmail || existing?.userEmail,
      isPro: isPro !== undefined ? isPro : existing?.isPro ?? false,
      pagePath: pagePath || existing?.pagePath || '/',
      deviceType: deviceType || existing?.deviceType || 'desktop',
      browser: browser || existing?.browser || 'Unknown',
      os: os || existing?.os || 'Unknown',
      gameId: gameId !== undefined ? gameId : existing?.gameId,
      roomCode: roomCode !== undefined ? roomCode : existing?.roomCode,
      activeTeam: activeTeam !== undefined ? activeTeam : existing?.activeTeam,
      score: score !== undefined ? score : existing?.score,
      lastActiveAt: now,
      connectedAt: existing?.connectedAt || now,
    });

    if (eventLog) {
      recentEventsFeed.unshift({
        id: `ev_${now}_${Math.random().toString(36).substring(2, 6)}`,
        sessionId,
        type: eventLog.type || 'page_view',
        title: eventLog.title,
        details: eventLog.details,
        pagePath: pagePath || '/',
        timestamp: now,
      });

      if (recentEventsFeed.length > 50) recentEventsFeed.pop();
    }

    pruneInactiveSessions();

    return NextResponse.json({ success: true, activeCount: activeSessionsMap.size });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. GET /api/presence (Admin Live Feed & Breakdown)
export async function GET() {
  pruneInactiveSessions();
  seedMockSessions();

  const sessions = Array.from(activeSessionsMap.values());
  const now = Date.now();

  const pageCounts: Record<string, number> = {
    '/': 0,
    '/play': 0,
    '/rooms': 0,
    '/room/[code]': 0,
    '/summary': 0,
    '/admin': 0,
    'other': 0,
  };

  const exactPageCounts: Record<string, number> = {};

  sessions.forEach((s) => {
    const path = s.pagePath || '/';
    exactPageCounts[path] = (exactPageCounts[path] || 0) + 1;

    if (path === '/') pageCounts['/'] += 1;
    else if (path === '/play') pageCounts['/play'] += 1;
    else if (path === '/rooms') pageCounts['/rooms'] += 1;
    else if (path.startsWith('/room/')) pageCounts['/room/[code]'] += 1;
    else if (path === '/summary') pageCounts['/summary'] += 1;
    else if (path.startsWith('/admin')) pageCounts['/admin'] += 1;
    else pageCounts['other'] += 1;
  });

  const devices = {
    mobile: sessions.filter((s) => s.deviceType === 'mobile').length,
    desktop: sessions.filter((s) => s.deviceType === 'desktop').length,
    tablet: sessions.filter((s) => s.deviceType === 'tablet').length,
  };

  const userTypes = {
    pro: sessions.filter((s) => s.isPro).length,
    guest: sessions.filter((s) => !s.isPro).length,
  };

  const liveGameSessions = sessions.filter((s) => s.pagePath === '/play' || s.pagePath.startsWith('/room/'));

  return NextResponse.json({
    timestamp: now,
    totalActiveUsers: sessions.length,
    pageCounts,
    exactPageCounts,
    devices,
    userTypes,
    sessions: sessions.map((s) => ({
      ...s,
      idleSeconds: Math.round((now - s.lastActiveAt) / 1000),
      sessionDurationSeconds: Math.round((now - s.connectedAt) / 1000),
    })),
    liveGameSessions,
    recentEvents: recentEventsFeed.slice(0, 30),
  });
}
