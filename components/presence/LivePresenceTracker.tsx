'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';

const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  try {
    let sId = sessionStorage.getItem('dvt_presence_session_id');
    if (!sId) {
      sId = 'sess_' + Math.random().toString(36).substring(2, 8) + '_' + Date.now().toString(36);
      sessionStorage.setItem('dvt_presence_session_id', sId);
    }
    return sId;
  } catch {
    return 'unknown_session';
  }
};

const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getBrowserName = (): string => {
  if (typeof window === 'undefined') return 'Browser';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Web App';
};

const getOSName = (): string => {
  if (typeof window === 'undefined') return 'OS';
  const ua = navigator.userAgent;
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown';
};

export const sendLivePresenceEvent = (
  type: 'page_view' | 'game_action' | 'room_join' | 'paywall' | 'ad' | 'login',
  title: string,
  details?: string
) => {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      sessionId: getSessionId(),
      pagePath: window.location.pathname,
      eventLog: { type, title, details },
    };
    fetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
};

export function LivePresenceTracker() {
  const pathname = usePathname();
  const { userEmail, isProUser, guestId, userId } = useUserStore();
  const { gameId, gameState, teams } = useGameStore();

  const isSendingRef = useRef(false);

  const sendHeartbeat = async (overrideEvent?: { type: any; title: string; details?: string }) => {
    if (typeof window === 'undefined' || isSendingRef.current) return;
    isSendingRef.current = true;

    try {
      const activeTeam = teams && gameState ? teams[gameState.active_team_index] : null;

      const payload = {
        sessionId: getSessionId(),
        userId: userId || guestId || undefined,
        userEmail: userEmail || undefined,
        isPro: Boolean(isProUser),
        pagePath: pathname || '/',
        deviceType: getDeviceType(),
        browser: getBrowserName(),
        os: getOSName(),
        gameId: pathname === '/play' ? gameId : null,
        roomCode: pathname?.startsWith('/room/') ? pathname.replace('/room/', '') : null,
        activeTeam: pathname === '/play' ? activeTeam?.name : null,
        score: pathname === '/play' ? activeTeam?.score : null,
        eventLog: overrideEvent,
      };

      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {} finally {
      isSendingRef.current = false;
    }
  };

  // Trigger on route change
  useEffect(() => {
    sendHeartbeat({
      type: 'page_view',
      title: `Sayfa: ${pathname || '/'}`,
      details: isProUser ? 'PRO Üye Ziyareti' : 'Misafir Ziyareti',
    });
  }, [pathname]);

  // Periodic heartbeat every 10 seconds & on tab visibility
  useEffect(() => {
    sendHeartbeat();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, isProUser, userEmail, gameId, gameState.status]);

  return null;
}
