'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sendLog } from '@/lib/logger';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error caught by ErrorBoundary:', error, errorInfo);

    sendLog({
      level: 'fatal',
      source: 'client',
      message: error.message || 'React Component Render Error',
      stack_trace: error.stack || errorInfo.componentStack || undefined,
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-white">Beklenmedik Bir Durum Oluştu</h2>
              <p className="text-xs text-slate-400 mt-1">
                Uygulama çalışırken geçici bir hata yakalandı ve sistem yöneticilerine otomatik olarak raporlandı.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 font-mono block">Hata Detayı:</span>
                <p className="text-xs font-mono text-rose-300 font-bold truncate">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                fullWidth
                className="py-3 text-xs font-black"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> Sayfayı Yenile & Tekrar Dene
              </Button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="text-xs font-bold text-slate-400 hover:text-white py-2 flex items-center justify-center gap-1"
              >
                <Home className="w-3.5 h-3.5" /> Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
