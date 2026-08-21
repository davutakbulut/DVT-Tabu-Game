'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import { useVersion } from '@/components/version/VersionProvider';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { PaywallModal } from '@/components/monetization/PaywallModal';
import { UpdateModal } from '@/components/version/UpdateModal';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  BarChart3, 
  ArrowUpCircle, 
  Crown, 
  Layers, 
  Compass, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  RotateCcw, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Plus, 
  LogOut, 
  ArrowLeft,
  Save,
  Clock,
  Zap,
  Tag,
  Flame,
  Check
} from 'lucide-react';

export default function AdminPortalPage() {
  const router = useRouter();
  const { isAuthenticated, login, logout } = useAdminStore();
  const { currentVersion, updateInfo, checkNow } = useVersion();
  const { setOnboardingCompleted } = useUserStore();

  // Auth Form State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab: 'analytics' | 'versions' | 'monetization' | 'cards' | 'onboarding'
  const [activeTab, setActiveTab] = useState<'analytics' | 'versions' | 'monetization' | 'cards' | 'onboarding'>('analytics');

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Strategy & Monetization State (Live Config)
  const [strategyConfig, setStrategyConfig] = useState({
    paywall_games_threshold: 2,
    ai_deck_paywall_enabled: true,
    vip_room_paywall_enabled: false,
    monthly_price: 49.99,
    annual_price: 349.99,
    active_campaign_title: '%40 Lansman Fırsatı',
    campaign_badge: 'SINIRLI SÜRE',
  });
  const [savingStrategy, setSavingStrategy] = useState(false);
  const [strategySavedSuccess, setStrategySavedSuccess] = useState(false);

  // Version Form
  const [newVersionTag, setNewVersionTag] = useState('1.2.0');
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('Yeni kart kategorileri eklendi.\nPerformans ve kararlılık iyileştirmeleri yapıldı.');
  const [isMandatoryUpdate, setIsMandatoryUpdate] = useState(false);
  const [minSupported, setMinSupported] = useState('1.1.0');
  const [publishingVersion, setPublishingVersion] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Card CMS Form
  const [newMainWord, setNewMainWord] = useState('');
  const [newForbiddenWords, setNewForbiddenWords] = useState('');
  const [newCardCategory, setNewCardCategory] = useState('Genel Kültür');
  const [cardSaveStatus, setCardSaveStatus] = useState<string | null>(null);

  // Previews
  const [isTestPaywallOpen, setIsTestPaywallOpen] = useState(false);
  const [testUpdateModal, setTestUpdateModal] = useState<any | null>(null);
  const [isTestOnboardingOpen, setIsTestOnboardingOpen] = useState(false);

  const fetchMetrics = () => {
    setLoadingMetrics(true);
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((res) => setAnalyticsData(res))
      .catch(() => {})
      .finally(() => setLoadingMetrics(false));
  };

  const fetchStrategyConfig = () => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((res) => {
        if (res.config) setStrategyConfig(res.config);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
      fetchStrategyConfig();
    }
  }, [isAuthenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(pinInput);
    if (success) {
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleSaveStrategy = async () => {
    setSavingStrategy(true);
    setStrategySavedSuccess(false);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategyConfig),
      });
      if (res.ok) {
        setStrategySavedSuccess(true);
        setTimeout(() => setStrategySavedSuccess(false), 4000);
      } else {
        alert('Strateji kaydedilemedi.');
      }
    } catch {
      alert('Sunucu bağlantı hatası.');
    } finally {
      setSavingStrategy(false);
    }
  };

  const handlePublishVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTag || !newVersionTitle) return;

    setPublishingVersion(true);
    setPublishSuccess(null);

    const notesArray = newVersionNotes
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newVersionTag.startsWith('v') ? newVersionTag : `v${newVersionTag}`,
          title: newVersionTitle,
          changes: notesArray.map((text) => ({ type: 'feat', text })),
          is_mandatory: isMandatoryUpdate,
          min_supported_version: minSupported,
        }),
      });

      if (res.ok) {
        setPublishSuccess(`v${newVersionTag} sürümü başarıyla yayınlandı! Tüm kullanıcılara anında iletildi.`);
        setNewVersionTitle('');
        checkNow(true);
      } else {
        const err = await res.json();
        alert(`Hata: ${err.error || 'Sürüm yayınlanamadı'}`);
      }
    } catch {
      alert('Sürüm yayınlama servisine ulaşılamadı.');
    } finally {
      setPublishingVersion(false);
    }
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMainWord || !newForbiddenWords) return;

    const words = newForbiddenWords.split(',').map((w) => w.trim().toUpperCase()).filter(Boolean);
    if (words.length < 5) {
      alert('Lütfen en az 5 yasaklı kelimeyi virgülle ayırarak girin.');
      return;
    }

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          main_word: newMainWord.toUpperCase(),
          forbidden_words: words.slice(0, 5),
          category: newCardCategory,
          difficulty: 'Orta',
        }),
      });

      if (res.ok) {
        setCardSaveStatus(`✓ "${newMainWord.toUpperCase()}" kartı veritabanına eklendi!`);
        setNewMainWord('');
        setNewForbiddenWords('');
        setTimeout(() => setCardSaveStatus(null), 3000);
      }
    } catch {
      alert('Kart kaydedilemedi.');
    }
  };

  const summary = analyticsData?.summary || {
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

  const pageIssues = analyticsData?.pageIssues || {};
  const paywallByTrigger = analyticsData?.paywallByTrigger || [];

  // 1. PIN Lock Screen if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 max-w-md mx-auto w-full">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center">
          <div className="w-14 h-14 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Yönetim Portalı Girişi</h2>
            <p className="text-xs text-slate-400 mt-1">
              Yönetici paneline erişmek için güvenlik PIN kodunuzu girin.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Yönetici PIN Kodu..."
                className={`w-full bg-slate-950 border rounded-2xl py-3 px-4 text-center font-mono font-black text-lg text-white tracking-widest focus:outline-none transition-all ${
                  pinError ? 'border-rose-500 shadow-rose-500/20 shadow-md' : 'border-slate-800 focus:border-indigo-500'
                }`}
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-4 top-4" />
            </div>

            {pinError && (
              <span className="text-xs font-bold text-rose-400">
                Hatalı PIN Kodu! Lütfen tekrar deneyin.
              </span>
            )}

            <Button variant="primary" size="lg" type="submit" fullWidth className="py-3.5 font-black text-sm">
              Panele Giriş Yap
            </Button>
          </form>

          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Oyuncu Ana Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  // 2. Full Admin Dashboard
  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto w-full text-slate-200 flex flex-col gap-5">
      {/* Admin Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              DVT Tabu Yönetim Merkezi
            </h1>
            <span className="text-[11px] text-slate-400">
              Canlı Sistem, Sürüm, Kart CMS & Analitik Kontrolü
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 py-2 px-3 rounded-xl flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Oyuna Dön
          </button>
          <button
            onClick={logout}
            className="text-xs font-bold text-rose-400 hover:bg-rose-500/10 bg-slate-900 border border-rose-500/30 py-2 px-3 rounded-xl flex items-center gap-1.5"
            title="Güvenli Çıkış"
          >
            <LogOut className="w-3.5 h-3.5" /> Çıkış
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-900">
        {[
          { id: 'analytics', label: 'Analitik & Drop-off', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'monetization', label: 'Monetizasyon & Paywall', icon: <Crown className="w-4 h-4" /> },
          { id: 'versions', label: 'Sürüm & Dağıtım', icon: <ArrowUpCircle className="w-4 h-4" /> },
          { id: 'cards', label: 'Kart Havuzu (CMS)', icon: <Layers className="w-4 h-4" /> },
          { id: 'onboarding', label: 'Onboarding Akışı', icon: <Compass className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-black transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB 1: ANALYTICS & SCREEN ENGAGEMENT */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Kullanıcı Akışı & Drop-off Metrikleri
            </h2>
            <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loadingMetrics} className="text-xs">
              <RotateCcw className={`w-3.5 h-3.5 mr-1 ${loadingMetrics ? 'animate-spin' : ''}`} /> Yenile
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Tekil Oturum</span>
              <span className="text-2xl font-black text-white font-mono">{summary.uniqueSessions}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{summary.totalEvents} Toplam Olay</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Onboarding Başarısı</span>
              <span className="text-2xl font-black text-purple-300 font-mono">%{summary.onboardingRate}</span>
              <span className="text-[10px] text-slate-400">{summary.onboardingCompletes} Tamamlandı</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Drop-off / Terk</span>
              <span className="text-2xl font-black text-amber-400 font-mono">%{summary.dropOffRate}</span>
              <span className="text-[10px] text-slate-400">{summary.gamesAbandoned} Terk Edilen Maç</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Paywall Dönüşümü</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">%{summary.paywallConversion}</span>
              <span className="text-[10px] text-slate-400">{summary.paywallViews} Görüntüleme</span>
            </div>
          </div>

          {/* ⏱️ Ekran Kalış Süreleri & Sağlık Isı Haritası */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Ekran Kalış Süreleri (Dwell Time) & Sağlık Dökümü
              </h3>
              <span className="text-[10px] text-slate-400">Kullanıcı Nerede Ne Kadar Kalıyor?</span>
            </div>

            <div className="flex flex-col gap-3">
              {Object.entries(pageIssues).map(([path, stats]: [string, any]) => {
                const hasIssues = stats.errors > 0 || stats.abandons > 0;
                const dwell = stats.avgDwellSeconds || 30;
                const minutes = Math.floor(dwell / 60);
                const seconds = dwell % 60;
                const timeFormatted = minutes > 0 ? `${minutes}dk ${seconds}sn` : `${seconds}sn`;

                return (
                  <div key={path} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white">{path}</span>
                        <span className="text-[11px] text-slate-400">
                          {path === '/' && '(Ana Sayfa)'}
                          {path === '/play' && '(Oyun Arenası - En Yoğun 🔥)'}
                          {path === '/room/[code]' && '(Oda Lobisi)'}
                          {path === '/rooms' && '(Oda Keşfi)'}
                          {path === '/summary' && '(Podyum & Özet)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-bold text-[11px]">
                        <span className="text-cyan-300 font-mono flex items-center gap-1 bg-cyan-950/40 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                          <Clock className="w-3 h-3 text-cyan-400" /> Ort. {timeFormatted}
                        </span>
                        <span className="text-slate-400">{stats.views || 0} Ziyaret</span>
                        {stats.abandons > 0 && <span className="text-amber-400">{stats.abandons} Terk</span>}
                        {stats.errors > 0 && <span className="text-rose-400 font-black">{stats.errors} Hata!</span>}
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          hasIssues ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {hasIssues ? 'İnceleme' : 'Stabil'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Visualizing Relative Time */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(10, (dwell / 180) * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONETIZATION, LIVE STRATEGY & TRIGGER BREAKDOWN */}
      {activeTab === 'monetization' && (
        <div className="flex flex-col gap-4">
          {/* 🎯 Paywall Tetikleme Noktaları Başarı & Tıklama Tablosu */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" /> Paywall Tetikleme Noktaları & Tıklama Sayıları (Canlı)
              </h3>
              <span className="text-[10px] text-slate-400">Dönüşüm / Tıklama Oranları</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {paywallByTrigger.map((trigger: any) => (
                <div key={trigger.key} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-white block text-sm">{trigger.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Kaynak: {trigger.key}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-slate-300 font-bold">{trigger.views} Gösterim</span>
                      <span className="text-emerald-400 font-bold">{trigger.clicks} Tıklama / Abone</span>
                    </div>

                    <div className="flex flex-col items-end min-w-[70px]">
                      <span className="text-base font-black text-amber-400 font-mono">%{trigger.conversionRate}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Dönüşüm</span>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                      trigger.conversionRate >= 30
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : trigger.conversionRate >= 15
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {trigger.conversionRate >= 30 ? 'Yüksek 🚀' : trigger.conversionRate >= 15 ? 'Normal' : 'Geliştir'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 💾 Dinamik Paywall Stratejisini Kaydet & Canlıya Al */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" /> Canlı Paywall & Fiyatlandırma Stratejisi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ayarları değiştirdikten sonra "Kaydet & Canlıya Al" butonuna basarak tüm oyunculara anında yayınlayabilirsiniz.
                </p>
              </div>

              {strategySavedSuccess && (
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5 animate-pulse">
                  <Check className="w-4 h-4" /> Strateji Canlıda!
                </div>
              )}
            </div>

            {/* 1. Oyun Eşiği */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                1. Maç Sonu Tetikleyicisi (Kaçıncı maçtan sonra Paywall açılsın?):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStrategyConfig({ ...strategyConfig, paywall_games_threshold: num })}
                    className={`py-3 rounded-2xl text-xs font-black border transition-all ${
                      strategyConfig.paywall_games_threshold === num
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {num}. Oyundan Sonra
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Ek Tetikleme Anahtarları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <label className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Gemini AI Deste Limiti</span>
                  <span className="text-[10px] text-slate-400">Ücretsiz 1 desteden sonra Paywall aç</span>
                </div>
                <input
                  type="checkbox"
                  checked={strategyConfig.ai_deck_paywall_enabled}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, ai_deck_paywall_enabled: e.target.checked })}
                  className="rounded accent-amber-500 w-5 h-5 cursor-pointer"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">VIP Özel Oda Koruma</span>
                  <span className="text-[10px] text-slate-400">Şifreli oda açarken Pro talep et</span>
                </div>
                <input
                  type="checkbox"
                  checked={strategyConfig.vip_room_paywall_enabled}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, vip_room_paywall_enabled: e.target.checked })}
                  className="rounded accent-amber-500 w-5 h-5 cursor-pointer"
                />
              </label>
            </div>

            {/* 3. Fiyatlandırma & Kampanya Alanları */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Aylık Fiyat (₺):</label>
                <input
                  type="number"
                  step="0.01"
                  value={strategyConfig.monthly_price}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, monthly_price: parseFloat(e.target.value) || 49 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Yıllık Fiyat (₺):</label>
                <input
                  type="number"
                  step="0.01"
                  value={strategyConfig.annual_price}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, annual_price: parseFloat(e.target.value) || 349 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Aktif Kampanya Başlığı:</label>
                <input
                  type="text"
                  value={strategyConfig.active_campaign_title}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, active_campaign_title: e.target.value })}
                  placeholder="%40 Lansman Fırsatı"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Kampanya Rozet Metni:</label>
                <input
                  type="text"
                  value={strategyConfig.campaign_badge}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, campaign_badge: e.target.value })}
                  placeholder="SINIRLI SÜRE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSaveStrategy}
                disabled={savingStrategy}
                className="flex-1 py-3.5 font-black text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingStrategy ? 'Canlıya Alınıyor...' : '💾 Stratejiyi Kaydet & Canlıya Al'}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsTestPaywallOpen(true)}
                className="text-xs py-3.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                <Crown className="w-4 h-4 mr-1.5" /> Modalı Önizle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERSIONS */}
      {activeTab === 'versions' && (
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 flex flex-col gap-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-indigo-400" /> Sürüm Yayınlama & Zorunlu Güncelleme Kontrolü
            </h3>

            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">İstemci Sürümü:</span>
                <span className="text-base font-black text-white font-mono">v{currentVersion}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">En Son Yayınlanan:</span>
                <span className="text-base font-black text-indigo-400 font-mono">v{updateInfo?.latestVersion || currentVersion}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Min. Desteklenen:</span>
                <span className="text-base font-black text-amber-400 font-mono">v{updateInfo?.minSupportedVersion || '1.0.0'}</span>
              </div>
            </div>

            {/* Test Modalleri */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTestUpdateModal({
                    hasUpdate: true,
                    isMandatory: false,
                    currentVersion,
                    latestVersion: '1.2.0',
                    releaseName: 'İsteğe Bağlı Güncelleme Önizlemesi',
                    releaseNotes: ['Yeni oyun temaları eklendi.', 'Ses efektleri zenginleştirildi.'],
                    minSupportedVersion: '1.0.0',
                  })
                }
                className="text-xs flex-1"
              >
                İsteğe Bağlı Modal Test Et
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setTestUpdateModal({
                    hasUpdate: true,
                    isMandatory: true,
                    currentVersion,
                    latestVersion: '2.0.0',
                    releaseName: 'Kritik Zorunlu Güvenlik Güncellemesi',
                    releaseNotes: ['Veritabanı protokolü güncellendi.', 'Zorunlu PWA önbellek yenilemesi.'],
                    minSupportedVersion: '2.0.0',
                  })
                }
                className="text-xs flex-1 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
              >
                Zorunlu Güncelleme Test Et
              </Button>
            </div>

            {/* Yayınlama Formu */}
            <form onSubmit={handlePublishVersion} className="pt-3 border-t border-slate-800 flex flex-col gap-3">
              {publishSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {publishSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Yeni Sürüm (SemVer):</label>
                  <input
                    type="text"
                    value={newVersionTag}
                    onChange={(e) => setNewVersionTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono font-bold text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Min. Desteklenen Sürüm:</label>
                  <input
                    type="text"
                    value={minSupported}
                    onChange={(e) => setMinSupported(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Sürüm Başlığı:</label>
                <input
                  type="text"
                  value={newVersionTitle}
                  onChange={(e) => setNewVersionTitle(e.target.value)}
                  placeholder="v1.2.0: AI & Kart Geliştirmeleri 🚀"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Sürüm Notları (Madde madde):</label>
                <textarea
                  rows={3}
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={isMandatoryUpdate}
                    onChange={(e) => setIsMandatoryUpdate(e.target.checked)}
                    className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <span className={isMandatoryUpdate ? 'text-rose-400' : 'text-slate-300'}>
                    Zorunlu Güncelleme (Force Update)
                  </span>
                </label>
                <Button variant="primary" size="md" type="submit" disabled={publishingVersion} className="text-xs px-5">
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {publishingVersion ? 'Yayınlanıyor...' : 'Canlıya Yayınla'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: CARDS CMS */}
      {activeTab === 'cards' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Supabase Kart Havuzu & Yeni Kart Ekle
          </h3>

          <form onSubmit={handleSaveCard} className="flex flex-col gap-3">
            {cardSaveStatus && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                {cardSaveStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Ana Kelime (Büyük Harf):</label>
                <input
                  type="text"
                  value={newMainWord}
                  onChange={(e) => setNewMainWord(e.target.value)}
                  placeholder="Örn: AKILLI SAAT"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-black text-white uppercase focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Kategori:</label>
                <select
                  value={newCardCategory}
                  onChange={(e) => setNewCardCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                >
                  {['Genel Kültür', 'Sinema & Dizi', 'Spor', 'Teknoloji', 'Yemek & Mutfak', 'Tarih', '90lar & 2000ler'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">5 Yasaklı Kelime (Virgülle ayırın):</label>
              <input
                type="text"
                value={newForbiddenWords}
                onChange={(e) => setNewForbiddenWords(e.target.value)}
                placeholder="KOL, ZAMAN, APPLE, BİLDİRİM, ADIMSAYAR"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white uppercase focus:outline-none"
                required
              />
            </div>

            <Button variant="primary" size="md" type="submit" className="text-xs py-3 font-black">
              <Plus className="w-4 h-4 mr-1" /> Kartı Supabase Veritabanına Ekle
            </Button>
          </form>
        </div>
      )}

      {/* TAB 5: ONBOARDING */}
      {activeTab === 'onboarding' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col gap-4">
          <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" /> Onboarding Akış Yöneticisi
          </h3>
          <p className="text-xs text-slate-300">
            Oyuncuları karşılayan 4 adımlı rehberi inceleyebilir veya kendi tarayıcınızda sıfırlayarak test edebilirsiniz.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsTestOnboardingOpen(true)}
              className="text-xs py-3 font-bold"
            >
              <Compass className="w-4 h-4 mr-1.5 text-purple-400" /> Onboarding'i Önizle
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setOnboardingCompleted(false);
                alert('Onboarding durumunuz sıfırlandı! Ana sayfaya gittiğinizde rehber tekrar otomatik açılacaktır.');
              }}
              className="text-xs py-3 font-bold border-purple-500/30 text-purple-300"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" /> Onboarding'i Sıfırla (Test Et)
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PaywallModal isOpen={isTestPaywallOpen} onClose={() => setIsTestPaywallOpen(false)} triggerSource="admin_preview" />
      {testUpdateModal && <UpdateModal isOpen={Boolean(testUpdateModal)} onClose={() => setTestUpdateModal(null)} updateInfo={testUpdateModal} />}
      <OnboardingModal isOpen={isTestOnboardingOpen} onClose={() => setIsTestOnboardingOpen(false)} />
    </div>
  );
}
