'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Gamepad2,
  Radio,
  Smartphone,
  Monitor,
  Tablet,
  Crown,
  UserCheck,
  RefreshCw,
  Play,
  Pause,
  ExternalLink,
  Eye,
  Flame,
  Globe,
  Sparkles,
  Timer
} from 'lucide-react';

interface ActiveSessionData {
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
  idleSeconds: number;
  sessionDurationSeconds: number;
}

interface LiveEventLog {
  id: string;
  sessionId: string;
  type: string;
  title: string;
  details?: string;
  pagePath: string;
  timestamp: number;
}

interface PresenceApiResponse {
  timestamp: number;
  totalActiveUsers: number;
  pageCounts: Record<string, number>;
  exactPageCounts: Record<string, number>;
  devices: { mobile: number; desktop: number; tablet: number };
  userTypes: { pro: number; guest: number };
  sessions: ActiveSessionData[];
  liveGameSessions: ActiveSessionData[];
  recentEvents: LiveEventLog[];
}

export function LivePresenceRadar() {
  const [data, setData] = useState<PresenceApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(3); // 3 seconds
  const [selectedPageFilter, setSelectedPageFilter] = useState<string>('all');
  const [lastFetchedTime, setLastFetchedTime] = useState<Date>(new Date());

  const fetchPresence = async () => {
    try {
      const res = await fetch('/api/presence?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastFetchedTime(new Date());
      }
    } catch {}
  };

  useEffect(() => {
    fetchPresence();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchPresence();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchPresence().finally(() => setLoading(false));
  };

  const totalUsers = data?.totalActiveUsers || 0;
  const pageCounts = data?.pageCounts || {
    '/': 0,
    '/play': 0,
    '/rooms': 0,
    '/room/[code]': 0,
    '/summary': 0,
    '/admin': 0,
    other: 0,
  };

  const PAGE_CONFIG: { key: string; label: string; desc: string; color: string; bg: string; icon: string }[] = [
    { key: '/', label: 'Ana Sayfa & Lobi', desc: 'Giriş ve Menü', color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', icon: '🏠' },
    { key: '/play', label: 'Aktif Maç Arenası', desc: 'Canlı Tek Cihaz Oyunu', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: '🎮' },
    { key: '/room/[code]', label: 'Çok Oyunculu Oda', desc: 'Online Canlı Masa', color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30', icon: '🌐' },
    { key: '/rooms', label: 'Oda Listesi / PIN', desc: 'Oda Arama & Katılma', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30', icon: '🔑' },
    { key: '/summary', label: 'Maç Sonu Podyumu', desc: 'Sonuçlar & AI Yorumu', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: '🏆' },
    { key: '/admin', label: 'Admin Portalı', desc: 'Yönetim & İzleme', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30', icon: '🛡️' },
  ];

  const filteredSessions = (data?.sessions || []).filter((s) => {
    if (selectedPageFilter === 'all') return true;
    if (selectedPageFilter === '/room/[code]') return s.pagePath.startsWith('/room/');
    return s.pagePath === selectedPageFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls & Live Pulse Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <Radio className="w-5 h-5 text-emerald-400" />
                Canlı İzleme & Gerçek Zamanlı Radar
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CANLI VERİ AKIŞI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Son güncelleme: {lastFetchedTime.toLocaleTimeString('tr-TR')} • Her {refreshInterval} saniyede otomatik yenilenir.
            </p>
          </div>
        </div>

        {/* Live Controller Options */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              autoRefresh
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {autoRefresh ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoRefresh ? 'Canlı Akış Açık' : 'Duraklatıldı'}
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Şimdi Yenile
          </button>
        </div>
      </div>

      {/* KPI Counters (Overview) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>Şu An Aktif Kişi</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{totalUsers}</span>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>Oyun Oynayanlar</span>
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">
              {(pageCounts['/play'] || 0) + (pageCounts['/room/[code]'] || 0)}
            </span>
            <span className="text-[11px] text-slate-400">Arenada / Masada</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>PRO / VIP Üyeler</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 tracking-tight">{data?.userTypes?.pro || 0}</span>
            <span className="text-[11px] text-slate-400">
              ({totalUsers > 0 ? Math.round(((data?.userTypes?.pro || 0) / totalUsers) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>Mobil / Masaüstü</span>
            <Smartphone className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {data?.devices?.mobile || 0} <span className="text-xs text-slate-500 font-normal">mob</span> / {data?.devices?.desktop || 0} <span className="text-xs text-slate-500 font-normal">dsk</span>
            </span>
          </div>
        </div>
      </div>

      {/* SAYFA DAĞILIMI (Hangi Sayfada Kaç Kişi Var?) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              Sayfa Dağılımı (Hangi Sayfada Kaç Kişi Var?)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Kullanıcıların şu anda canlı olarak bulunduğu sayfalar ve oranları</p>
          </div>

          <span className="text-xs font-bold text-slate-400">
            Toplam: <strong className="text-white">{totalUsers} Kullanıcı</strong>
          </span>
        </div>

        {/* Dynamic Page Distribution Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {PAGE_CONFIG.map((pg) => {
            const count = pageCounts[pg.key] || 0;
            const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            const isSelected = selectedPageFilter === pg.key;

            return (
              <div
                key={pg.key}
                onClick={() => setSelectedPageFilter(isSelected ? 'all' : pg.key)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 bg-indigo-950/40 border-indigo-500'
                    : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{pg.icon}</span>
                    <div>
                      <h4 className="text-xs font-black text-white">{pg.label}</h4>
                      <span className="text-[10px] text-slate-400 block font-mono">{pg.key}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xl font-black ${pg.color}`}>{count}</span>
                    <span className="text-[10px] text-slate-500 block font-bold">Kişi (%{percentage})</span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      pg.key === '/play'
                        ? 'bg-emerald-500'
                        : pg.key === '/room/[code]'
                        ? 'bg-cyan-500'
                        : pg.key === '/summary'
                        ? 'bg-amber-500'
                        : pg.key === '/admin'
                        ? 'bg-rose-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CANLI AKTİF KULLANICILAR & CANLI HAREKETLİLİK AKIŞI (2 Sütun) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol 2 Sütun: Canlı Aktif Oturumlar Tablosu */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Canlı Bağlı Kullanıcılar ({filteredSessions.length})
              </h3>
              <p className="text-[11px] text-slate-400">Şu anda uygulamayı açık tutan gerçek zamanlı istemciler</p>
            </div>

            {selectedPageFilter !== 'all' && (
              <button
                onClick={() => setSelectedPageFilter('all')}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 self-start sm:self-auto bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
              >
                Filtreyi Temizle ({selectedPageFilter})
              </button>
            )}
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Bu sayfada şu an aktif kullanıcı yok.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                    <th className="py-2.5 px-3">Oturum / Kullanıcı</th>
                    <th className="py-2.5 px-3">Bulunduğu Sayfa</th>
                    <th className="py-2.5 px-3">Cihaz & Ortam</th>
                    <th className="py-2.5 px-3">Üyelik</th>
                    <th className="py-2.5 px-3 text-right">Son Hareket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSessions.map((session) => (
                    <tr key={session.sessionId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate max-w-[120px]">
                              {session.userEmail || session.userId || session.sessionId}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {session.sessionId.substring(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] font-bold">
                          {session.pagePath}
                        </span>
                        {session.activeTeam && (
                          <span className="block text-[10px] text-amber-400 font-bold mt-0.5">
                            Takım: {session.activeTeam} ({session.score || 0} Puan)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          {session.deviceType === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                          ) : session.deviceType === 'tablet' ? (
                            <Tablet className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          <span className="text-[11px] font-medium">{session.os || 'Cihaz'} • {session.browser || 'Web'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {session.isPro ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold">
                            <Crown className="w-3 h-3 text-amber-400" /> PRO
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                            Misafir
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="text-[11px] font-bold text-slate-300 font-mono">
                          {session.idleSeconds < 5 ? 'Şimdi' : `${session.idleSeconds}s önce`}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Süre: {Math.round(session.sessionDurationSeconds / 60)} dk
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sağ 1 Sütun: Canlı Olay / Hareketlilik Akışı (Ticker) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                Canlı Olay Akışı
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Anlık Ticker</span>
            </div>

            <div className="space-y-2.5 mt-3 max-h-[380px] overflow-y-auto pr-1">
              {(data?.recentEvents || []).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-[11px]">{ev.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Math.max(1, Math.round((Date.now() - ev.timestamp) / 1000))}s önce
                    </span>
                  </div>
                  {ev.details && (
                    <p className="text-[11px] text-slate-400 font-medium">{ev.details}</p>
                  )}
                  <span className="text-[9px] font-mono text-indigo-400 block">{ev.pagePath}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
