/**
 * 📊 DVT Tabu Game - İstemci & Sunucu Analitik Motoru
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

export interface AnalyticsPayload {
  eventName: string;
  pagePath?: string;
  metadata?: Record<string, any>;
}

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
    // Fire-and-forget beacon or fetch
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
  } catch (err) {
    // Silently ignore analytics errors
  }
};

export const analytics = {
  pageView: (path: string) => trackEvent('page_view', {}, path),
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
  paywallCtaClick: (planId: string) => 
    trackEvent('paywall_cta_click', { planId }),
  clientError: (errorMessage: string, componentStack?: string) => 
    trackEvent('client_error', { errorMessage, componentStack }),
};
