'use client';

import { useEffect } from 'react';
import { sendLog } from '@/lib/logger';

export function GlobalErrorTracker() {
  useEffect(() => {
    // 1. Unhandled JavaScript Runtime Errors
    const handleError = (event: ErrorEvent) => {
      // Filter out benign browser extension script errors
      if (event.filename && event.filename.includes('extension')) return;

      sendLog({
        level: 'error',
        source: 'client',
        message: event.message || 'Unhandled Client Exception',
        stack_trace: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
        page_url: window.location.pathname,
        metadata: {
          lineno: event.lineno,
          colno: event.colno,
          filename: event.filename,
        },
      });
    };

    // 2. Unhandled Async Promise Rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      sendLog({
        level: 'error',
        source: 'client',
        message: typeof reason === 'string' ? reason : reason?.message || 'Unhandled Promise Rejection',
        stack_trace: reason?.stack || String(reason),
        page_url: window.location.pathname,
        metadata: {
          type: 'unhandled_promise_rejection',
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
