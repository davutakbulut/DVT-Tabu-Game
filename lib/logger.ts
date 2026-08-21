/**
 *  DVT Tabu Game - Universal Logger & Error Telemetry Service
 */

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info';
export type LogSource = 'client' | 'server' | 'api' | 'supabase' | 'gemini';

export interface LogPayload {
  level: LogLevel;
  source: LogSource;
  message: string;
  stack_trace?: string;
  page_url?: string;
  session_id?: string;
  user_id?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  try {
    let sId = sessionStorage.getItem('dvt_analytics_session_id');
    if (!sId) {
      sId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem('dvt_analytics_session_id', sId);
    }
    return sId;
  } catch {
    return 'unknown_session';
  }
};

const getUserId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem('dvt_user_cloud_id') || undefined;
  } catch {
    return undefined;
  }
};

// Rate limiter / anti-flood memory buffer
const recentLogs = new Set<string>();

export const sendLog = async (data: Partial<LogPayload>) => {
  const message = data.message || 'Unknown Error';
  const dedupKey = `${data.level || 'error'}_${message}_${data.page_url || ''}`;

  // Prevent sending duplicate logs in rapid succession (within 5 seconds)
  if (recentLogs.has(dedupKey)) return;
  recentLogs.add(dedupKey);
  setTimeout(() => recentLogs.delete(dedupKey), 5000);

  const payload: LogPayload = {
    level: data.level || 'error',
    source: data.source || (typeof window === 'undefined' ? 'server' : 'client'),
    message,
    stack_trace: data.stack_trace,
    page_url: data.page_url || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined),
    session_id: data.session_id || getSessionId(),
    user_id: data.user_id || getUserId(),
    user_agent: data.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
    metadata: data.metadata || {},
  };

  try {
    if (typeof window !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/logs', blob);
    } else {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
};

export const logger = {
  fatal: (message: string, error?: any, metadata?: Record<string, any>) => {
    console.error('[FATAL]', message, error);
    sendLog({
      level: 'fatal',
      message,
      stack_trace: error?.stack || (error instanceof Error ? error.message : String(error || '')),
      metadata,
    });
  },

  error: (message: string, error?: any, metadata?: Record<string, any>, source: LogSource = 'client') => {
    console.error('[ERROR]', message, error);
    sendLog({
      level: 'error',
      source,
      message,
      stack_trace: error?.stack || (error instanceof Error ? error.message : String(error || '')),
      metadata,
    });
  },

  warn: (message: string, metadata?: Record<string, any>) => {
    console.warn('[WARN]', message, metadata);
    sendLog({
      level: 'warn',
      message,
      metadata,
    });
  },

  info: (message: string, metadata?: Record<string, any>) => {
    console.info('[INFO]', message, metadata);
    // Optional: info can be sent or local-only
  },
};
