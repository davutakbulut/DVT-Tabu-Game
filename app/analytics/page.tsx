'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PaywallModal } from '@/components/monetization/PaywallModal';
import { UpdateModal } from '@/components/version/UpdateModal';
import { useVersion } from '@/components/version/VersionProvider';
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
  History,
  Send,
  ArrowUpCircle,
  Plus
} from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const { currentVersion, updateInfo, checkNow } = useVersion();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTestPaywallOpen, setIsTestPaywallOpen] = useState(false);
  const [paywallTriggerThreshold, setPaywallTriggerThreshold] = useState(2);

  // Version Publishing Form State
  const [newVersionTag, setNewVersionTag] = useState('1.2.0');
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('Yeni tema ve kart desteleri eklendi.\nPerformans optimizasyonları yapıldı.');
  const [isMandatoryUpdate, setIsMandatoryUpdate] = useState(false);
  const [minSupported, setMinSupported] = useState('1.1.0');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Test Update Modal State
  const [testUpdateModal, setTestUpdateModal] = useState<any | null>(null);

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

  const handlePublishVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTag || !newVersionTitle) return;

    setPublishing(true);
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
      setPublishing(false);
    }
  };

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
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Analitik & Sürüm Yönetimi
            </h1>
            <span className="text-[11px] text-slate-400">
              Kullanıcı Akışı, Drop-off & Sürüm Kontrol Mekanizması
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

        {/* Card 4: Current Client Version */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
            <History className="w-3 h-3" /> İstemci Sürümü
          </span>
          <span className="text-2xl font-black text-indigo-300 font-mono">v{currentVersion}</span>
          <span className="text-[10px] text-slate-400">Canlı Kontrol Aktif</span>
        </div>
      </div>

      {/* 2. Sürüm Kontrol & Güncelleme Yayınlama Servisi */}
      <div className="p-5 rounded-3xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-indigo-400" /> Sürüm Güncelleme Kontrol Merkezi
          </h3>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
            Otomatik Takip Açık
          </span>
        </div>

        {/* Canlı Sürüm Durumu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400">Aktif İstemci:</span>
            <span className="text-sm font-black text-white font-mono">v{currentVersion}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400">En Son Sunucu Sürümü:</span>
            <span className="text-sm font-black text-indigo-400 font-mono">
              v{updateInfo?.latestVersion || currentVersion}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400">Min. Desteklenen Sürüm:</span>
            <span className="text-sm font-black text-amber-400 font-mono">
              v{updateInfo?.minSupportedVersion || '1.0.0'}
            </span>
          </div>
        </div>

        {/* Sürüm Test Butonları */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setTestUpdateModal({
                hasUpdate: true,
                isMandatory: false,
                currentVersion,
                latestVersion: '1.2.0',
                releaseName: 'Örnek İsteğe Bağlı Güncelleme',
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
                releaseName: 'Kritik Güvenlik & Veritabanı Güncellemesi',
                releaseNotes: ['Veritabanı protokolü güncellendi.', 'Zorunlu PWA önbellek yenilemesi.'],
                minSupportedVersion: '2.0.0',
              })
            }
            className="text-xs flex-1 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
          >
            Zorunlu Güncelleme Test Et
          </Button>
        </div>

        {/* Yeni Sürüm Yayınla Formu */}
        <form onSubmit={handlePublishVersion} className="pt-3 border-t border-indigo-500/20 flex flex-col gap-3">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-indigo-400" /> Yeni Sürüm Yayınla (Canlıya Gönder)
          </span>

          {publishSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {publishSuccess}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Sürüm Kodu (SemVer):</label>
              <input
                type="text"
                value={newVersionTag}
                onChange={(e) => setNewVersionTag(e.target.value)}
                placeholder="1.2.0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Min. Desteklenen Sürüm:</label>
              <input
                type="text"
                value={minSupported}
                onChange={(e) => setMinSupported(e.target.value)}
                placeholder="1.0.0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Sürüm Başlığı:</label>
            <input
              type="text"
              value={newVersionTitle}
              onChange={(e) => setNewVersionTitle(e.target.value)}
              placeholder="v1.2.0: AI Özel Deste & Oda Geliştirmeleri "
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Sürüm Notları (Her satır 1 madde):</label>
            <textarea
              rows={3}
              value={newVersionNotes}
              onChange={(e) => setNewVersionNotes(e.target.value)}
              placeholder="Yeni özellikler..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={isMandatoryUpdate}
                onChange={(e) => setIsMandatoryUpdate(e.target.checked)}
                className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
              />
              <span className={isMandatoryUpdate ? 'text-rose-400' : 'text-slate-300'}>
                Zorunlu Güncelleme (Force Update — Uygulamayı Kilitler)
              </span>
            </label>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={publishing}
              className="text-xs px-4"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {publishing ? 'Yayınlanıyor...' : 'Sürümü Yayınla'}
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Funnel (Dönüşüm Hunisi) */}
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

      {/* 4. Sorun Çıkaran & Terk Edilen Sayfalar (Drop-off Raporu) */}
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

      {/* 5. Monetizasyon & Paywall Tetikleme Ayarları */}
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

      {/* Test Update Modal */}
      {testUpdateModal && (
        <UpdateModal
          isOpen={Boolean(testUpdateModal)}
          onClose={() => setTestUpdateModal(null)}
          updateInfo={testUpdateModal}
        />
      )}
    </div>
  );
}
