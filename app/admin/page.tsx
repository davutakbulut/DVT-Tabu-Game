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
  Check,
  Search,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  UploadCloud,
  Film,
  Trophy,
  Cpu,
  Utensils,
  History,
  Globe,
  X,
  Bug,
  Filter,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Terminal,
  Server,
  Monitor
} from 'lucide-react';
import { sendLog } from '@/lib/logger';

export default function AdminPortalPage() {
  const router = useRouter();
  const { isAuthenticated, login, logout, updatePin, getCurrentPin } = useAdminStore();
  const { currentVersion, updateInfo, checkNow } = useVersion();
  const { setOnboardingCompleted } = useUserStore();

  // PIN Change State
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Auth Form State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab: 'cards' | 'monetization' | 'analytics' | 'logs' | 'versions' | 'onboarding'
  const [activeTab, setActiveTab] = useState<'cards' | 'monetization' | 'analytics' | 'logs' | 'versions' | 'onboarding'>('cards');

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Error Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [logsStats, setLogsStats] = useState<any>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logLevelFilter, setLogLevelFilter] = useState('all');
  const [logSourceFilter, setLogSourceFilter] = useState('all');
  const [logStatusFilter, setLogStatusFilter] = useState('all'); // 'all' | 'open' | 'resolved'
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Strategy & Monetization State (Live Config)
  const [strategyConfig, setStrategyConfig] = useState({
    paywall_games_threshold: 2,
    ai_deck_paywall_enabled: true,
    vip_room_paywall_enabled: false,
    paywall_3plus_teams_enabled: true,
    paywall_custom_rules_enabled: false,
    paywall_vip_decks_enabled: false,
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

  // Decks & Cards CMS State
  const [cmsSubTab, setCmsSubTab] = useState<'decks' | 'cards' | 'add_card' | 'bulk_import'>('decks');
  const [decks, setDecks] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [searchCardQuery, setSearchCardQuery] = useState('');
  const [selectedDeckFilter, setSelectedDeckFilter] = useState('all');

  // New Deck Form
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('#6366f1');
  const [isNewDeckOpen, setIsNewDeckOpen] = useState(false);

  // Single Card Form
  const [newMainWord, setNewMainWord] = useState('');
  const [newForbiddenWords, setNewForbiddenWords] = useState('');
  const [newCardDeckId, setNewCardDeckId] = useState('deck-general');
  const [newCardCategory, setNewCardCategory] = useState('Genel Kültür');
  const [newCardDifficulty, setNewCardDifficulty] = useState('Orta');
  const [cardSaveStatus, setCardSaveStatus] = useState<string | null>(null);

  // Bulk Import Form
  const [bulkDeckId, setBulkDeckId] = useState('deck-general');
  const [bulkText, setBulkText] = useState(`FUTBOL: TOP, GOL, MAÇ, SAHA, HAKEM\nTİYATRO: SAHNE, OYUN, PERDE, ALKIŞ, AKTÖR\nKAHVE: ÇEKİRDEK, ESPRESSO, KAFEİN, FİNCAN, SÜT`);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Edit Card Modal
  const [editingCard, setEditingCard] = useState<any | null>(null);

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

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      let url = `/api/logs?limit=100`;
      if (logLevelFilter !== 'all') url += `&level=${logLevelFilter}`;
      if (logSourceFilter !== 'all') url += `&source=${logSourceFilter}`;
      if (logStatusFilter !== 'all') url += `&status=${logStatusFilter}`;
      if (logSearchQuery) url += `&search=${encodeURIComponent(logSearchQuery)}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch {} finally {
      setLoadingLogs(false);
    }
  };

  const fetchLogsStats = async () => {
    try {
      const res = await fetch('/api/logs/stats');
      if (res.ok) {
        const json = await res.json();
        setLogsStats(json);
      }
    } catch {}
  };

  const handleResolveLog = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_resolved: !currentStatus }),
      });
      setLogs((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_resolved: !currentStatus } : l))
      );
      fetchLogsStats();
    } catch {}
  };

  const handleClearResolvedLogs = async () => {
    if (!confirm('Çözülmüş olarak işaretlenen tüm logları silmek istediğinize emin misiniz?')) return;
    try {
      await fetch('/api/logs?action=clear_resolved', { method: 'DELETE' });
      fetchLogs();
      fetchLogsStats();
    } catch {}
  };

  const handleCreateTestError = () => {
    sendLog({
      level: 'error',
      source: 'client',
      message: 'Test Hatası: Yönetici Paneli Üzerinden Canlı Loglama Tetiklendi 🚨',
      stack_trace: 'Error: Simulated Admin Portal Test\n    at handleCreateTestError (app/admin/page.tsx:180:12)',
      page_url: '/admin',
      metadata: { test_mode: true, timestamp: new Date().toISOString() },
    });
    setTimeout(() => {
      fetchLogs();
      fetchLogsStats();
    }, 600);
  };

  const fetchStrategyConfig = () => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((res) => {
        if (res.config) setStrategyConfig(res.config);
      })
      .catch(() => {});
  };

  const fetchDecks = async () => {
    try {
      const res = await fetch('/api/decks');
      if (res.ok) {
        const json = await res.json();
        setDecks(json.decks || []);
      }
    } catch {}
  };

  const fetchCards = async () => {
    setLoadingCards(true);
    try {
      let url = `/api/cards?limit=150`;
      if (selectedDeckFilter !== 'all') url += `&deckId=${selectedDeckFilter}`;
      if (searchCardQuery) url += `&search=${encodeURIComponent(searchCardQuery)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setCards(json.cards || []);
      }
    } catch {} finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
      fetchStrategyConfig();
      fetchDecks();
      fetchCards();
      fetchLogs();
      fetchLogsStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'logs') {
      fetchLogs();
    }
  }, [logLevelFilter, logSourceFilter, logStatusFilter, logSearchQuery, activeTab]);

  useEffect(() => {
    if (isAuthenticated && (cmsSubTab === 'cards' || cmsSubTab === 'decks')) {
      fetchCards();
    }
  }, [selectedDeckFilter, searchCardQuery, cmsSubTab]);

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

  // Toggle Deck Active Status
  const handleToggleDeck = async (deckId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/decks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deckId, is_active: !currentStatus }),
      });
      setDecks((prev) =>
        prev.map((d) => (d.id === deckId ? { ...d, is_active: !currentStatus } : d))
      );
    } catch {
      alert('Deste durumu güncellenemedi');
    }
  };

  // Create New Deck
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName) return;
    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeckName,
          description: newDeckDesc,
          color: newDeckColor,
          icon: 'Layers',
          is_active: true,
        }),
      });
      if (res.ok) {
        setNewDeckName('');
        setNewDeckDesc('');
        setIsNewDeckOpen(false);
        fetchDecks();
      }
    } catch {}
  };

  // Toggle Card Active Status
  const handleToggleCard = async (cardId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cardId, is_active: !currentStatus }),
      });
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, is_active: !currentStatus } : c))
      );
    } catch {}
  };

  // Delete Card
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Bu kartı kelime havuzundan silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`/api/cards?id=${cardId}`, { method: 'DELETE' });
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      fetchDecks();
    } catch {}
  };

  // Save Single Card
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
          deck_id: newCardDeckId,
          category: newCardCategory,
          difficulty: newCardDifficulty,
        }),
      });

      if (res.ok) {
        setCardSaveStatus(`✓ "${newMainWord.toUpperCase()}" kartı eklendi!`);
        setNewMainWord('');
        setNewForbiddenWords('');
        fetchDecks();
        fetchCards();
        setTimeout(() => setCardSaveStatus(null), 3000);
      }
    } catch {
      alert('Kart kaydedilemedi.');
    }
  };

  // Bulk Import Cards
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setBulkImporting(true);
    setBulkSuccessMsg(null);

    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedCards: any[] = [];

    lines.forEach((line) => {
      if (line.includes(':')) {
        const [main, forbiddenPart] = line.split(':');
        const taboos = forbiddenPart.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
        if (main && taboos.length >= 5) {
          parsedCards.push({
            main_word: main.trim().toUpperCase(),
            forbidden_words: taboos.slice(0, 5),
            deck_id: bulkDeckId,
          });
        }
      }
    });

    if (parsedCards.length === 0) {
      alert('Geçerli kart formatı bulunamadı. Lütfen her satıra "KELİME: yasak1, yasak2, yasak3, yasak4, yasak5" şeklinde yazın.');
      setBulkImporting(false);
      return;
    }

    try {
      const res = await fetch('/api/cards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: parsedCards, deck_id: bulkDeckId }),
      });

      if (res.ok) {
        const json = await res.json();
        setBulkSuccessMsg(`🎉 ${json.count || parsedCards.length} adet kart desteye başarıyla yüklendi!`);
        setBulkText('');
        fetchDecks();
        fetchCards();
      }
    } catch {
      alert('Toplu yükleme başarısız oldu.');
    } finally {
      setBulkImporting(false);
    }
  };

  // Update Editing Card
  const handleUpdateEditingCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    try {
      const res = await fetch('/api/cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCard),
      });
      if (res.ok) {
        setCards((prev) => prev.map((c) => (c.id === editingCard.id ? editingCard : c)));
        setEditingCard(null);
      }
    } catch {}
  };

  // Dynamic Deck Icon Helper
  const renderDeckIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Film': return <Film className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Utensils': return <Utensils className={className} />;
      case 'History': return <History className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'Flame': return <Flame className={className} />;
      default: return <Sparkles className={className} />;
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

  const logStatsSummary = logsStats?.summary || {
    total: logs.length,
    unresolved: logs.filter((l) => !l.is_resolved).length,
    resolved: logs.filter((l) => l.is_resolved).length,
    fatal: logs.filter((l) => l.level === 'fatal' && !l.is_resolved).length,
    error: logs.filter((l) => l.level === 'error' && !l.is_resolved).length,
    warn: logs.filter((l) => l.level === 'warn' && !l.is_resolved).length,
    resolutionRate: 100,
  };

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
      {/* Responsive Admin Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">
              DVT Tabu Yönetim Merkezi
            </h1>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Canlı Sistem, Desteler, Kelime Havuzu CMS, Hata Logları & Analitik Kontrolü
            </span>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setNewPinValue('');
              setPinChangeSuccess(false);
              setIsChangePinOpen(true);
            }}
            className="text-xs font-bold text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            title="Yönetici PIN Kodunu Değiştir"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN Değiştir</span>
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Oyuna Dön</span>
          </button>

          <button
            onClick={logout}
            className="text-xs font-bold text-rose-400 hover:bg-rose-500/10 bg-slate-900 border border-rose-500/30 py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Güvenli Çıkış"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış</span>
          </button>
        </div>
      </header>

      {/* Admin Main Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'cards', label: 'Kart & Deste Havuzu (CMS)', icon: <Layers className="w-4 h-4" /> },
          { id: 'logs', label: 'Hata & Log Merkezi', icon: <Bug className="w-4 h-4" />, badge: logStatsSummary.unresolved > 0 ? logStatsSummary.unresolved : null },
          { id: 'monetization', label: 'Monetizasyon & Paywall', icon: <Crown className="w-4 h-4" /> },
          { id: 'analytics', label: 'Analitik & Drop-off', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'versions', label: 'Sürüm & Dağıtım', icon: <ArrowUpCircle className="w-4 h-4" /> },
          { id: 'onboarding', label: 'Onboarding Akışı', icon: <Compass className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-black transition-all shrink-0 whitespace-nowrap relative ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge ? (
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse ml-0.5">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* TAB: ERROR & LOG CENTER */}
      {activeTab === 'logs' && (
        <div className="flex flex-col gap-4">
          {/* Top Error Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Açık Hatalar</span>
              <span className="text-2xl font-black text-rose-400 font-mono">{logStatsSummary.unresolved}</span>
              <span className="text-[10px] text-slate-500">{logStatsSummary.total} Toplam Kayıt</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Kritik (Fatal)</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{logStatsSummary.fatal}</span>
              <span className="text-[10px] text-rose-400 font-semibold">{logStatsSummary.error} Standart Hata</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Uyarılar (Warn)</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{logStatsSummary.warn}</span>
              <span className="text-[10px] text-slate-500">Hafif İhlaller</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Çözülme Oranı</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">%{logStatsSummary.resolutionRate}</span>
              <span className="text-[10px] text-emerald-400">{logStatsSummary.resolved} Çözüldü</span>
            </div>
          </div>

          {/* Filter & Action Toolbar */}
          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Hata mesajı veya sayfa URL'inde ara..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {logSearchQuery && (
                <button onClick={() => setLogSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdowns & Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={logLevelFilter}
                onChange={(e) => setLogLevelFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none"
              >
                <option value="all">Tüm Seviyeler</option>
                <option value="fatal">Fatal (Kritik)</option>
                <option value="error">Error (Hata)</option>
                <option value="warn">Warn (Uyarı)</option>
              </select>

              <select
                value={logSourceFilter}
                onChange={(e) => setLogSourceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none"
              >
                <option value="all">Tüm Kaynaklar</option>
                <option value="client">İstemci (Client)</option>
                <option value="server">Sunucu (Server)</option>
                <option value="api">API Routes</option>
                <option value="gemini">Gemini AI</option>
                <option value="supabase">Supabase</option>
              </select>

              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="open">Açık Hatalar</option>
                <option value="resolved">Çözülmüşler</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchLogs();
                  fetchLogsStats();
                }}
                disabled={loadingLogs}
                className="text-xs px-3 py-2 bg-slate-950 border-slate-800 hover:bg-slate-800"
                title="Yenile"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin text-indigo-400' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              onClick={handleCreateTestError}
              className="text-[11px] font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Bug className="w-3.5 h-3.5" /> 🧪 Test Hatası Oluştur & Gönder
            </button>

            <button
              onClick={handleClearResolvedLogs}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Çözülen Logları Temizle
            </button>
          </div>

          {/* Log Items List */}
          <div className="flex flex-col gap-2.5">
            {logs.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span className="text-sm font-bold text-white">Harika! Hiç Açık Hata Kaydı Yok</span>
                <p className="text-xs text-slate-500">Sistem stabil çalışıyor. Yeni hatalar oluştukça burada listelenecektir.</p>
              </div>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const isResolved = log.is_resolved;

                return (
                  <div
                    key={log.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                      isResolved
                        ? 'bg-slate-950/60 border-slate-900 opacity-60'
                        : log.level === 'fatal'
                        ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                        : log.level === 'error'
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {/* Level Badge */}
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border shrink-0 mt-0.5 ${
                            log.level === 'fatal'
                              ? 'bg-rose-500 text-white border-rose-400'
                              : log.level === 'error'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : log.level === 'warn'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {log.level}
                        </span>

                        {/* Source Badge */}
                        <span className="text-[9px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 shrink-0 mt-0.5">
                          {log.source || 'client'}
                        </span>

                        {/* Message */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black text-white leading-snug break-words">
                            {log.message}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 flex-wrap font-mono">
                            <span>📍 {log.page_url || '/'}</span>
                            <span>🕒 {new Date(log.created_at).toLocaleString('tr-TR')}</span>
                            {log.user_id && <span>👤 {log.user_id}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleResolveLog(log.id, isResolved)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${
                            isResolved
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-300 border-slate-700'
                          }`}
                          title={isResolved ? 'Tekrar Aç' : 'Çözüldü Olarak İşaretle'}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isResolved ? 'Çözüldü' : 'Çöz'}</span>
                        </button>

                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="Detayları Göster / Gizle"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Stack Trace & Metadata Accordion */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5 text-xs">
                        {log.stack_trace && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                              <Terminal className="w-3 h-3 text-indigo-400" /> Hata Yığın İzi (Stack Trace):
                            </span>
                            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-300/90 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                              {log.stack_trace}
                            </pre>
                          </div>
                        )}

                        {log.user_agent && (
                          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                            <Monitor className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">Tarayıcı: {log.user_agent}</span>
                          </div>
                        )}

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-1">Ek Parametreler (Metadata):</span>
                            <pre className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB: CARDS & DECKS CMS */}
      {activeTab === 'cards' && (
        <div className="flex flex-col gap-4">
          {/* Sub-Tabs Bar & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
              {[
                { id: 'decks', label: '📁 Desteler & Kategoriler' },
                { id: 'cards', label: '🗂️ Kelime Havuzu & Arama' },
                { id: 'add_card', label: '➕ Tekil Kart Ekle' },
                { id: 'bulk_import', label: '⚡ Toplu İçe Aktar' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setCmsSubTab(sub.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all text-center sm:text-left ${
                    cmsSubTab === sub.id
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {cmsSubTab === 'decks' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewDeckOpen(true)}
                className="text-xs py-2 px-3 font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 self-end sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Yeni Deste Oluştur
              </Button>
            )}
          </div>

          {/* SUB-TAB 1: DECKS LIST */}
          {cmsSubTab === 'decks' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      deck.is_active
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/60 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-md shrink-0"
                          style={{ backgroundColor: deck.color || '#6366f1' }}
                        >
                          {renderDeckIcon(deck.icon)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white leading-snug">{deck.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {deck.card_count || 0} Toplam Kart ({deck.active_card_count || 0} Aktif)
                          </span>
                        </div>
                      </div>

                      {/* Active/Passive Switch */}
                      <button
                        onClick={() => handleToggleDeck(deck.id, deck.is_active)}
                        className={`text-xs font-black px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 shrink-0 ${
                          deck.is_active
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {deck.is_active ? <Check className="w-3 h-3" /> : null}
                        {deck.is_active ? 'Yayında' : 'Pasif'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{deck.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-slate-500 font-mono">ID: {deck.id}</span>
                      <button
                        onClick={() => {
                          setSelectedDeckFilter(deck.id);
                          setCmsSubTab('cards');
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                      >
                        Kartları İncele & Düzenle ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: CARDS WORD POOL EXPLORER */}
          {cmsSubTab === 'cards' && (
            <div className="flex flex-col gap-3">
              {/* Responsive Search & Filter Bar */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchCardQuery}
                    onChange={(e) => setSearchCardQuery(e.target.value)}
                    placeholder="Kelime havuzunda ara (Örn: SKIBIDI, TİTANİK, KAHVE)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {searchCardQuery && (
                    <button
                      onClick={() => setSearchCardQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedDeckFilter}
                    onChange={(e) => setSelectedDeckFilter(e.target.value)}
                    className="flex-1 sm:flex-none sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 truncate"
                  >
                    <option value="all">Tüm Desteler ({cards.length} Kart)</option>
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCards}
                    disabled={loadingCards}
                    className="text-xs px-3 py-2.5 bg-slate-950 border-slate-800 hover:bg-slate-800"
                    title="Yenile"
                  >
                    <RotateCcw className={`w-4 h-4 ${loadingCards ? 'animate-spin text-indigo-400' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Card List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                      card.is_active !== false
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/60 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base font-black text-white tracking-wider truncate">{card.main_word}</span>
                        <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 shrink-0">
                          {card.category || 'Genel'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleCard(card.id, card.is_active !== false)}
                          className={`p-1 rounded-lg text-xs font-bold transition-colors ${
                            card.is_active !== false ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
                          }`}
                          title={card.is_active !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}
                        >
                          {card.is_active !== false ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => setEditingCard(card)}
                          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Forbidden Words Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {(card.forbidden_words || []).map((w: string, i: number) => (
                        <span key={i} className="text-[10px] font-bold bg-rose-950/30 text-rose-300 border border-rose-500/20 px-2.5 py-0.5 rounded-md">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: ADD SINGLE CARD */}
          {cmsSubTab === 'add_card' && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Kelime Havuzuna Tekil Kart Ekle
              </h3>

              {cardSaveStatus && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  {cardSaveStatus}
                </div>
              )}

              <form onSubmit={handleSaveCard} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Hedef Deste:</label>
                    <select
                      value={newCardDeckId}
                      onChange={(e) => {
                        setNewCardDeckId(e.target.value);
                        const selectedDeck = decks.find((d) => d.id === e.target.value);
                        if (selectedDeck) setNewCardCategory(selectedDeck.name);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                    >
                      {decks.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

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
                  <Plus className="w-4 h-4 mr-1" /> Kartı Veritabanına Ekle
                </Button>
              </form>
            </div>
          )}

          {/* SUB-TAB 4: BULK IMPORT */}
          {cmsSubTab === 'bulk_import' && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
              <div>
                <h3 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-400" /> Toplu Kart İçe Aktarma (Bulk Import)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Her satıra bir kart gelecek şekilde yapıştırın. Tek tıkla yüzlerce kartı desteye yükleyin.
                </p>
              </div>

              {bulkSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {bulkSuccessMsg}
                </div>
              )}

              <form onSubmit={handleBulkImport} className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Yüklenecek Hedef Deste:</label>
                  <select
                    value={bulkDeckId}
                    onChange={(e) => setBulkDeckId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                  >
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Kart Listesi Formatı: <code>ANA KELİME: YASAK1, YASAK2, YASAK3, YASAK4, YASAK5</code>
                  </label>
                  <textarea
                    rows={6}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none resize-none"
                    placeholder="KELİME: yasak1, yasak2, yasak3, yasak4, yasak5"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={bulkImporting}
                  className="text-xs py-3 font-black bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <UploadCloud className="w-4 h-4 mr-1.5" />
                  {bulkImporting ? 'Yükleniyor...' : '⚡ Kartları Desteye Toplu Yükle'}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB: MONETIZATION */}
      {activeTab === 'monetization' && (
        <div className="flex flex-col gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <label className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">3+ Takım Kilidi (Paywall)</span>
                  <span className="text-[10px] text-slate-400">2 takım ücretsiz, 3. ve sonrası için Pro talep et</span>
                </div>
                <input
                  type="checkbox"
                  checked={strategyConfig.paywall_3plus_teams_enabled}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, paywall_3plus_teams_enabled: e.target.checked })}
                  className="rounded accent-amber-500 w-5 h-5 cursor-pointer"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">VIP & Meme Deste Kilidi</span>
                  <span className="text-[10px] text-slate-400">2026 Memeler destesi seçiminde Pro talep et</span>
                </div>
                <input
                  type="checkbox"
                  checked={strategyConfig.paywall_vip_decks_enabled}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, paywall_vip_decks_enabled: e.target.checked })}
                  className="rounded accent-amber-500 w-5 h-5 cursor-pointer"
                />
              </label>

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

      {/* TAB: ANALYTICS */}
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

      {/* TAB: VERSIONS */}
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

      {/* TAB: ONBOARDING */}
      {activeTab === 'onboarding' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" /> Onboarding & Kullanıcı Hesap Dönüşüm Yöneticisi
            </h3>
            <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold">
              Canlı Bulut Verileri
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Kullanıcıların onboarding akışını, misafir olarak başlama ve daha sonra Google/Apple hesabı bağlama oranlarını takip edin.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Bulut Misafirleri</span>
              <span className="text-xl font-black text-white font-mono">{summary.uniqueSessions || 1}</span>
              <span className="text-[9px] text-indigo-400 font-bold">Aktif Kayıt</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Bağlı Sosyal Hesap</span>
              <span className="text-xl font-black text-emerald-400 font-mono">1</span>
              <span className="text-[9px] text-emerald-400 font-bold">Google / Apple / FB</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Onboarding Başarısı</span>
              <span className="text-xl font-black text-purple-300 font-mono">%{summary.onboardingRate}</span>
              <span className="text-[9px] text-purple-400 font-bold">4 Adım Tamamlandı</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Hesap Bağlama Oranı</span>
              <span className="text-xl font-black text-amber-400 font-mono">%45</span>
              <span className="text-[9px] text-amber-400 font-bold">Misafir ➔ Hesap</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
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

      {/* New Deck Modal */}
      {isNewDeckOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-black text-white">Yeni Deste Oluştur</h4>
              <button onClick={() => setIsNewDeckOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeck} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Deste Başlığı:</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Örn: 90lar Pop Müziği"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Deste Açıklaması:</label>
                <input
                  type="text"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  placeholder="Şarkıcılar, albümler ve nostalji..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Deste Rengi:</label>
                <div className="flex items-center gap-2">
                  {['#6366f1', '#ec4899', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ef4444', '#f43f5e'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewDeckColor(col)}
                      className={`w-7 h-7 rounded-xl border-2 transition-all ${
                        newDeckColor === col ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <Button variant="primary" size="md" type="submit" className="text-xs py-3 font-black mt-2">
                Desteyi Oluştur & Kaydet
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-black text-white">Kartı Düzenle</h4>
              <button onClick={() => setEditingCard(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEditingCard} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Ana Kelime:</label>
                <input
                  type="text"
                  value={editingCard.main_word}
                  onChange={(e) => setEditingCard({ ...editingCard, main_word: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-black text-white uppercase focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">5 Yasaklı Kelime (Virgülle ayrılmış):</label>
                <input
                  type="text"
                  value={(editingCard.forbidden_words || []).join(', ')}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      forbidden_words: e.target.value.split(',').map((w) => w.trim().toUpperCase()),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white uppercase focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Deste:</label>
                <select
                  value={editingCard.deck_id || 'deck-general'}
                  onChange={(e) => setEditingCard({ ...editingCard, deck_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <Button variant="primary" size="md" type="submit" className="text-xs py-3 font-black mt-1">
                Değişiklikleri Kaydet
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {isChangePinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Yönetici PIN Kodunu Değiştir</h4>
                  <span className="text-[10px] text-slate-400">Yeni bir güvenlik PIN kodu belirleyin</span>
                </div>
              </div>
              <button onClick={() => setIsChangePinOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinChangeSuccess ? (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Yönetici PIN kodunuz başarıyla güncellendi!</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPinValue.trim().length >= 4) {
                    updatePin(newPinValue.trim());
                    setPinChangeSuccess(true);
                    setTimeout(() => {
                      setIsChangePinOpen(false);
                      setPinChangeSuccess(false);
                    }, 1800);
                  } else {
                    alert('Lütfen en az 4 karakterli bir PIN kodu girin.');
                  }
                }}
                className="flex flex-col gap-3"
              >
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Mevcut Aktif PIN:</label>
                  <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-xs font-mono text-slate-400">
                    {getCurrentPin()}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Yeni PIN Kodu (En az 4 hane):</label>
                  <input
                    type="password"
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                    placeholder="Örn: 98765 veya gizlisifre"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    required
                    autoFocus
                  />
                </div>

                <Button variant="primary" size="md" type="submit" className="text-xs py-3 font-black bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 mt-1">
                  Yeni PIN'i Kaydet & Aktif Et
                </Button>
              </form>
            )}
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
