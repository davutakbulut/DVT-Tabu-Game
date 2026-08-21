/**
 * 📊 DVT Tabu Game - İstemci & Sunucu Analitik ve Ekran Kalış Süresi Motoru
 */

const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  let sId = sessionStorage.getItem('dvt_analytics_session_id');
  if (!sId) {
    sId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    sessionStorage.setItem('dvt_analytics_session_id', sId);
  }
  return sId;
};

let activePagePath: string = '/';
let activePageStartTime: number = Date.now();

export const trackEvent = async (eventName: string, metadata: Record<string, any> = {}, pagePath?: string) => {
  if (typeof window === 'undefined') return;

  const payload = {
    sessionId: getSessionId(),
    eventName,
    pagePath: pagePath || window.location.pathname,
    metadata,
    userAgent: navigator.userAgent,
  };

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
};

export const analytics = {
  pageView: (path: string) => {
    // Record dwell time of previous page if applicable
    if (typeof window !== 'undefined' && activePagePath && activePageStartTime) {
      const dwellSeconds = Math.round((Date.now() - activePageStartTime) / 1000);
      if (dwellSeconds > 1 && dwellSeconds < 1800) {
        trackEvent('page_dwell_time', { dwellSeconds }, activePagePath);
      }
    }
    activePagePath = path;
    activePageStartTime = Date.now();
    trackEvent('page_view', {}, path);
  },
  onboardingStart: () => trackEvent('onboarding_start', { step: 1 }),
  onboardingStep: (stepNumber: number, stepTitle: string) => 
    trackEvent('onboarding_step', { step: stepNumber, title: stepTitle }),
  onboardingComplete: (timeSpentSeconds?: number) => 
    trackEvent('onboarding_complete', { timeSpentSeconds }),
  onboardingSkip: (stepNumber: number) => 
    trackEvent('onboarding_skip', { skippedAtStep: stepNumber }),
  gameStart: (mode: string, teamsCount: number) => 
    trackEvent('game_start', { mode, teamsCount }),
  gameAbandon: (round: number, timeSpentSeconds: number) => 
    trackEvent('game_abandoned', { round, timeSpentSeconds }),
  gameFinish: (score: number, totalRounds: number, gameNumber: number) => 
    trackEvent('game_finished', { score, totalRounds, gameNumber }),
  paywallView: (triggerSource: string, gamesPlayed: number) => 
    trackEvent('paywall_view', { triggerSource, gamesPlayed }),
  paywallCtaClick: (planId: string, triggerSource?: string) => 
    trackEvent('paywall_cta_click', { planId, triggerSource }),
  clientError: (errorMessage: string, componentStack?: string) => 
    trackEvent('client_error', { errorMessage, componentStack }),
};
