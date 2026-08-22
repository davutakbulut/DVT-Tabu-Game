'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 shadow-xl">
        <AlertTriangle className="w-8 h-8 text-rose-400" />
      </div>
      <h2 className="text-2xl font-black text-white tracking-tight mb-2">Bir Şeyler Ters Gitti</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        Beklenmeyen bir hata oluştu. Sayfayı yenileyerek veya aşağıdaki butona tıklayarak tekrar deneyebilirsiniz.
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
      >
        <RefreshCw className="w-4 h-4" /> Yeniden Dene
      </button>
    </div>
  );
}
