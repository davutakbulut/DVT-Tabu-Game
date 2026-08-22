'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 shadow-xl">
        <Compass className="w-8 h-8 text-indigo-400 animate-pulse" />
      </div>
      <h1 className="text-3xl font-black text-white tracking-tight mb-2">404 - Sayfa Bulunamadı</h1>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        href="/"
        className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
      >
        <Home className="w-4 h-4" /> Ana Sayfaya Dön
      </Link>
    </div>
  );
}
