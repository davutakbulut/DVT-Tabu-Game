'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PaywallModal } from '@/components/monetization/PaywallModal';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  RotateCcw, 
  Crown, 
  ShieldCheck, 
  Layers, 
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTestPaywallOpen, setIsTestPaywallOpen] = useState(false);
  const [paywallTriggerThreshold, setPaywallTriggerThreshold] = useState(2);

  const fetchMetrics = () => {
    setLoading(true);
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const summary = data?.summary || {
    totalEvents: 0,
    uniqueSessions: 1,
    onboardingStarts: 1,
    onboardingCompletes: 1,
    onboardingRate: 100,
    gamesStarted: 1,
    gamesAbandoned: 0,
    gamesFinished: 1,
    dropOffRate: 0,
    paywallViews: 1,
    paywallClicks: 1,
    paywallConversion: 100,
  };

  const pageIssues = data?.pageIssues || {};

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto w-full text-slate-200 flex flex-col gap-5">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Analitik & Raporlama
            </h1>
            <span className="text-[11px] text-slate-400">
              Kullanıcı Akışı, Drop-off & Monetizasyon Takibi
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMetrics}
          disabled={loading}
          className="text-xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </header>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Tekil Ziyaret */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" /> Oturumlar
          </span>
          <span className="text-2xl font-black text-white font-mono">{summary.uniqueSessions}</span>
          <span className="text-[10px] text-emerald-400 font-semibold">{summary.totalEvents} Toplam Olay</span>
        </div>

        {/* Card 2: Onboarding Funnel */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Onboarding
          </span>
          <span className="text-2xl font-black text-purple-300 font-mono">%{summary.onboardingRate}</span>
          <span className="text-[10px] text-slate-400">{summary.onboardingCompletes} Tamamlandı</span>
        </div>

        {/* Card 3: Game Drop-off */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" /> Drop-off Oranı
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono">%{summary.dropOffRate}</span>
          <span className="text-[10px] text-slate-400">{summary.gamesAbandoned} Terk Edilen Maç</span>
        </div>

        {/* Card 4: Paywall Conversion */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" /> Pro Dönüşüm
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono">%{summary.paywallConversion}</span>
          <span className="text-[10px] text-slate-400">{summary.paywallViews} Görüntüleme</span>
        </div>
      </div>

      {/* 2. Funnel (Dönüşüm Hunisi) */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> Kullanıcı Dönüşüm Hunisi (Funnel)
        </h3>

        <div className="flex flex-col gap-2 pt-1">
          {[
            { label: '1. Ziyaret & Onboarding Başladı', count: summary.onboardingStarts, color: 'bg-indigo-500', pct: 100 },
            { label: '2. Onboarding Tamamlandı', count: summary.onboardingCompletes, color: 'bg-purple-500', pct: summary.onboardingRate },
            { label: '3. Oyun Arenasına Girildi', count: summary.gamesStarted, color: 'bg-blue-500', pct: summary.gamesStarted ? 85 : 0 },
            { label: '4. Maç Başarıyla Bitirildi', count: summary.gamesFinished, color: 'bg-emerald-500', pct: summary.gamesStarted ? Math.round((summary.gamesFinished / summary.gamesStarted) * 100) : 0 },
            { label: '5. Pro Paywall Teklifi Görüldü', count: summary.paywallViews, color: 'bg-amber-500', pct: summary.paywallViews ? 60 : 0 },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">{step.label}</span>
                <span className="font-mono text-white">{step.count} ({step.pct}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.max(5, step.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sorun Çıkaran & Terk Edilen Sayfalar (Drop-off Raporu) */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Sayfa Sağlığı & Drop-off Raporu
          </h3>
          <span className="text-[10px] text-slate-400">Canlı Metrikler</span>
        </div>

        <div className="flex flex-col gap-2">
          {Object.entries(pageIssues).map(([path, stats]: [string, any]) => {
            const hasIssues = stats.errors > 0 || stats.abandons > 0;
            return (
              <div
                key={path}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                  hasIssues
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {hasIssues ? (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-mono font-bold text-white block">{path}</span>
                    <span className="text-[10px] text-slate-400">
                      {path === '/' && 'Ana Menü & Mod Seçimi'}
                      {path === '/rooms' && 'Oda Arama & PIN Listesi'}
                      {path === '/room/[code]' && 'Lobi & Takım Dağılımı'}
                      {path === '/play' && 'Canlı Tabu Arenası'}
                      {path === '/summary' && 'Maç Sonu Podyumu'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <div className="flex flex-col items-end">
                    <span className="text-slate-300">{stats.views || 0} Ziyaret</span>
                    {stats.abandons > 0 && (
                      <span className="text-amber-400">{stats.abandons} Terk (Drop-off)</span>
                    )}
                    {stats.errors > 0 && (
                      <span className="text-red-400 font-black">{stats.errors} Hata!</span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      hasIssues
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {hasIssues ? 'İnceleme Gerekli' : 'Sorunsuz'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Monetizasyon & Paywall Tetikleme Ayarları */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" /> Pro Plan / Paywall Strateji Yönetimi
          </h3>
          <span className="text-[10px] bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
            Aktif
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Kullanıcılar kaç maç tamamladıktan sonra Pro Plan teklifi (Paywall) ile karşılaşsın?
        </p>

        {/* Eşik Seçimi */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setPaywallTriggerThreshold(num)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                paywallTriggerThreshold === num
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {num}. Oyundan Sonra
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsTestPaywallOpen(true)}
          className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs py-3"
        >
          <Crown className="w-4 h-4 mr-1.5" /> Paywall Modalını Önizle / Test Et
        </Button>
      </div>

      {/* Paywall Preview Modal */}
      <PaywallModal
        isOpen={isTestPaywallOpen}
        onClose={() => setIsTestPaywallOpen(false)}
        triggerSource="admin_preview"
      />
    </div>
  );
}
