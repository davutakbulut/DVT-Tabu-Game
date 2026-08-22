'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center font-sans">
        <h2 className="text-2xl font-black mb-2">Kritik Bir Hata Oluştu</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Sistem çalışırken beklenmeyen bir durum meydana geldi.
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black"
        >
          Yeniden Yükle
        </button>
      </body>
    </html>
  );
}
