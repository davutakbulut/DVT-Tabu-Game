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
import { InterstitialAdModal } from '@/components/ads/InterstitialAdModal';
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
  ArrowRight,
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
  Monitor,
  Volume2,
  Megaphone,
  ExternalLink,
  Tv,
  Gamepad2,
  RefreshCw
} from 'lucide-react';
import { sendLog } from '@/lib/logger';
import { DEFAULT_ONBOARDING_STEPS, OnboardingStepItem } from '@/types/onboarding';
import { AdConfig, AdItem, DEFAULT_AD_CONFIG, DEFAULT_ADS } from '@/types/ads';

export default function AdminPortalPage() {
  const router = useRouter();
  const { isAuthenticated, login, logout, updatePin, getCurrentPin } = useAdminStore();
  const { currentVersion, updateInfo, checkNow } = useVersion();
  const { setOnboardingCompleted } = useUserStore();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // PIN Change State
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Auth Form State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab: 'cards' | 'monetization' | 'ads' | 'analytics' | 'game_inspector' | 'online_rooms' | 'logs' | 'versions' | 'onboarding'
  const [activeTab, setActiveTab] = useState<'cards' | 'monetization' | 'ads' | 'analytics' | 'game_inspector' | 'online_rooms' | 'logs' | 'versions' | 'onboarding'>('cards');

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

  // Onboarding Studio Flow State
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStepItem[]>(DEFAULT_ONBOARDING_STEPS);
  const [editingOnboardingStep, setEditingOnboardingStep] = useState<OnboardingStepItem | null>(null);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [onboardingSavedSuccess, setOnboardingSavedSuccess] = useState(false);

  // Ad Engine & Inventory State
  const [adConfig, setAdConfig] = useState<AdConfig>(DEFAULT_AD_CONFIG);
  const [adsList, setAdsList] = useState<AdItem[]>(DEFAULT_ADS);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [isNewAdModalOpen, setIsNewAdModalOpen] = useState(false);
  const [isTestAdModalOpen, setIsTestAdModalOpen] = useState(false);
  const [savingAdConfig, setSavingAdConfig] = useState(false);
  const [adConfigSavedSuccess, setAdConfigSavedSuccess] = useState(false);

  // Multiplayer Rooms Admin State
  const [adminRoomsList, setAdminRoomsList] = useState<any[]>([]);
  const [loadingAdminRooms, setLoadingAdminRooms] = useState(false);
  const [closingAdminRoomCode, setClosingAdminRoomCode] = useState<string | null>(null);

  const fetchAdminRooms = async () => {
    setLoadingAdminRooms(true);
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const json = await res.json();
        if (json.rooms) setAdminRoomsList(json.rooms);
      }
    } catch {}
    finally {
      setLoadingAdminRooms(false);
    }
  };

  const handleAdminCloseRoom = async (roomCode: string) => {
    if (!confirm(`${roomCode} kodlu odayı kapatmak ve katılan oyunculara canlı uyarı göndermek istediğinize emin misiniz?`)) {
      return;
    }
    setClosingAdminRoomCode(roomCode);
    try {
      await fetch(`/api/rooms/${roomCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'closed_by_admin',
          closure_reason: 'Bu oyun odası yönetici (Admin) tarafından sonlandırıldı.',
        }),
      });
      fetchAdminRooms();
    } catch {
      alert('Oda kapatılamadı.');
    } finally {
      setClosingAdminRoomCode(null);
    }
  };

  const handleAdminDeleteRoom = async (roomCode: string) => {
    if (!confirm(`${roomCode} kodlu odayı tamamen silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await fetch(`/api/rooms/${roomCode}`, { method: 'DELETE' });
      fetchAdminRooms();
    } catch {
      alert('Oda silinemedi.');
    }
  };

  // Game Sessions & Word Analytics State
  const [gameAnalyticsData, setGameAnalyticsData] = useState<any>(null);
  const [loadingGameAnalytics, setLoadingGameAnalytics] = useState(false);
  const [wordSearchQuery, setWordSearchQuery] = useState('');

  const fetchGameAnalytics = () => {
    setLoadingGameAnalytics(true);
    fetch('/api/games/analytics')
      .then((res) => res.json())
      .then((data) => setGameAnalyticsData(data))
      .catch(() => {})
      .finally(() => setLoadingGameAnalytics(false));
  };

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
      message: 'Test Hatası: Yönetici Paneli Üzerinden Canlı Loglama Tetiklendi',
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

  const fetchOnboardingSteps = () => {
    fetch('/api/config/onboarding')
      .then((res) => res.json())
      .then((res) => {
        if (res.steps && res.steps.length > 0) setOnboardingSteps(res.steps);
      })
      .catch(() => {});
  };

  const handleSaveOnboardingFlow = async () => {
    setSavingOnboarding(true);
    try {
      const res = await fetch('/api/config/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: onboardingSteps }),
      });
      if (res.ok) {
        setOnboardingSavedSuccess(true);
        setTimeout(() => setOnboardingSavedSuccess(false), 3000);
      }
    } catch {
      alert('Onboarding akışı kaydedilemedi.');
    } finally {
      setSavingOnboarding(false);
    }
  };

  const handleMoveOnboardingStep = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= onboardingSteps.length) return;
    const newSteps = [...onboardingSteps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setOnboardingSteps(newSteps);
  };

  const handleDeleteOnboardingStep = (id: string) => {
    if (onboardingSteps.length <= 1) {
      alert('En az 1 adet onboarding adımı bulunmalıdır!');
      return;
    }
    setOnboardingSteps(onboardingSteps.filter((s) => s.id !== id));
  };

  const handleAddNewOnboardingStep = () => {
    const newId = `step_${Date.now()}`;
    const newStep: OnboardingStepItem = {
      id: newId,
      icon: 'Gamepad2',
      badge: 'YENİ DENEYİM',
      badge_color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      title: 'Özel Deneyim Adımı',
      desc: 'Bu adımda oyunculara sunmak istediğiniz yeni özelliği veya eğlenceli kuralı açıklayın.',
      interactive_type: 'rules_card',
      bullets: ['Yeni kural açıklaması', 'Anında kapışma hissi'],
      cta_text: 'Devam Et',
    };
    setOnboardingSteps([...onboardingSteps, newStep]);
    setEditingOnboardingStep(newStep);
  };

  const handleResetDefaultOnboarding = () => {
    if (confirm('Onboarding akışını varsayılan 4 adımlı interaktif deneyime sıfırlamak istiyor musunuz?')) {
      setOnboardingSteps(DEFAULT_ONBOARDING_STEPS);
    }
  };

  const [adEventsData, setAdEventsData] = useState<any>(null);
  const [loadingAdEvents, setLoadingAdEvents] = useState(false);

  const fetchAdsData = () => {
    fetch('/api/ads')
      .then((res) => res.json())
      .then((res) => {
        if (res.config) setAdConfig(res.config);
        if (res.ads && res.ads.length > 0) setAdsList(res.ads);
      })
      .catch(() => {});

    setLoadingAdEvents(true);
    fetch('/api/ads/events?limit=150')
      .then((res) => res.json())
      .then((data) => setAdEventsData(data))
      .catch(() => {})
      .finally(() => setLoadingAdEvents(false));
  };

  const handleSaveAdConfig = async () => {
    setSavingAdConfig(true);
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: adConfig }),
      });
      if (res.ok) {
        setAdConfigSavedSuccess(true);
        setTimeout(() => setAdConfigSavedSuccess(false), 3000);
      }
    } catch {
      alert('Reklam ayarları kaydedilemedi.');
    } finally {
      setSavingAdConfig(false);
    }
  };

  const handleSaveAdsList = async (updatedList: AdItem[]) => {
    setAdsList(updatedList);
    try {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ads: updatedList }),
      });
    } catch {}
  };

  const handleToggleAdStatus = (adId: string, currentStatus: boolean) => {
    const updated = adsList.map((a) => (a.id === adId ? { ...a, is_active: !currentStatus } : a));
    handleSaveAdsList(updated);
  };

  const handleDeleteAd = (adId: string) => {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;
    const updated = adsList.filter((a) => a.id !== adId);
    handleSaveAdsList(updated);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
      fetchStrategyConfig();
      fetchDecks();
      fetchCards();
      fetchLogs();
      fetchLogsStats();
      fetchOnboardingSteps();
      fetchAdsData();
      fetchGameAnalytics();
      fetchAdminRooms();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'game_inspector') {
      fetchGameAnalytics();
    }
    if (isAuthenticated && activeTab === 'online_rooms') {
      fetchAdminRooms();
    }
  }, [isAuthenticated, activeTab]);

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
        setCardSaveStatus(` "${newMainWord.toUpperCase()}" kartı eklendi!`);
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
        setBulkSuccessMsg(` ${json.count || parsedCards.length} adet kart desteye başarıyla yüklendi!`);
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

  // 1. PIN Lock Screen if not logged in or during initial mount
  if (!hasMounted || !isAuthenticated) {
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
          { id: 'online_rooms', label: 'Çok Oyunculu Odalar', icon: <Globe className="w-4 h-4" /> },
          { id: 'game_inspector', label: 'Oyun & Kelime Raporu', icon: <Gamepad2 className="w-4 h-4" /> },
          { id: 'logs', label: 'Hata & Log Merkezi', icon: <Bug className="w-4 h-4" />, badge: logStatsSummary.unresolved > 0 ? logStatsSummary.unresolved : null },
          { id: 'monetization', label: 'Monetizasyon & Paywall', icon: <Crown className="w-4 h-4" /> },
          { id: 'ads', label: 'Reklam & Ad Engine', icon: <Megaphone className="w-4 h-4" /> },
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

      {/* TAB: MULTIPLAYER ROOMS & LIVE LOBBIES INSPECTOR */}
      {activeTab === 'online_rooms' && (
        <div className="flex flex-col gap-5">
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" /> Çok Oyunculu Odalar & Canlı Lobi Yönetimi
              </h3>
              <span className="text-[10px] text-slate-400">
                Sistemdeki tüm açık oyun odaları, katılımcılar, canlı durumlar ve anında kapatma/silme kontrolleri
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminRooms}
              disabled={loadingAdminRooms}
              className="text-xs py-1.5 px-3 bg-slate-900 border-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingAdminRooms ? 'animate-spin' : ''}`} /> Odaları Yenile
            </Button>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1 shadow-lg">
              <span className="text-[10px] text-slate-400">Toplam Oda</span>
              <span className="text-xl font-black text-white">{adminRoomsList.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1 shadow-lg">
              <span className="text-[10px] text-slate-400">Lobi / Bekliyor</span>
              <span className="text-xl font-black text-emerald-400">
                {adminRoomsList.filter((r) => r.status === 'waiting').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1 shadow-lg">
              <span className="text-[10px] text-slate-400">Oynanıyor</span>
              <span className="text-xl font-black text-amber-400">
                {adminRoomsList.filter((r) => r.status === 'in_progress').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1 shadow-lg">
              <span className="text-[10px] text-slate-400">Kapatılan Odalar</span>
              <span className="text-xl font-black text-rose-400">
                {adminRoomsList.filter((r) => r.status === 'closed_by_admin' || r.status === 'closed_by_host').length}
              </span>
            </div>
          </div>

          {/* Rooms Table */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Oda Kodu</th>
                    <th className="py-3 px-4">Oda Başlığı</th>
                    <th className="py-3 px-4">Kurucu (Host)</th>
                    <th className="py-3 px-4 text-center">Oyuncular</th>
                    <th className="py-3 px-4 text-center">Ayarlar</th>
                    <th className="py-3 px-4 text-center">Durum</th>
                    <th className="py-3 px-4 text-right">Admin Eylemleri</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {adminRoomsList.length > 0 ? (
                    adminRoomsList.map((room) => {
                      const isClosed = room.status === 'closed_by_admin' || room.status === 'closed_by_host';

                      return (
                        <tr key={room.id || room.code} className="hover:bg-slate-850/50 transition-colors">
                          {/* Code & Pin */}
                          <td className="py-3 px-4 font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
                                {room.code}
                              </span>
                              {room.is_private && (
                                <span className="text-[10px] text-amber-400" title={`PIN: ${room.pin || 'Gizli'}`}>
                                  🔒 {room.pin || ''}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Title */}
                          <td className="py-3 px-4 font-bold text-slate-200">
                            <span className="truncate max-w-[180px] block">{room.title}</span>
                          </td>

                          {/* Host */}
                          <td className="py-3 px-4 text-slate-400 text-xs">
                            <span className="truncate max-w-[120px] block text-slate-300">
                              {room.host_name || room.host_id || 'Misafir'}
                            </span>
                          </td>

                          {/* Players */}
                          <td className="py-3 px-4 text-center text-slate-300 font-bold">
                            {room.players?.length || 0} / {room.max_players || 8}
                          </td>

                          {/* Settings */}
                          <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                            {room.settings?.turn_duration || 60}s • {room.settings?.pass_limit ?? 3} Pas
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              room.status === 'waiting'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                                : room.status === 'in_progress'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}>
                              {room.status === 'waiting' ? 'Lobi Açık' :
                               room.status === 'in_progress' ? 'Oynanıyor' :
                               room.status === 'closed_by_admin' ? 'Admin Kapattı' : 'Kapatıldı'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open room in new tab */}
                              <a
                                href={`/room/${room.code}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400 hover:text-white transition-colors"
                                title="Odayı İncele"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              {/* Admin Close Button */}
                              {!isClosed && (
                                <button
                                  onClick={() => handleAdminCloseRoom(room.code)}
                                  disabled={closingAdminRoomCode === room.code}
                                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-black transition-all flex items-center gap-1"
                                  title="Odayı Kapat & Oyuncuları Çıkar"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{closingAdminRoomCode === room.code ? 'Kapatılıyor...' : 'Kapat'}</span>
                                </button>
                              )}

                              {/* Delete Room Button */}
                              <button
                                onClick={() => handleAdminDeleteRoom(room.code)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition-colors"
                                title="Odayı Veritabanından Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        Kayıtlı çok oyunculu oda bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: GAME SESSIONS & WORD PERFORMANCE INSPECTOR */}
      {activeTab === 'game_inspector' && (
        <div className="flex flex-col gap-5">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-400" /> Oyun Denetimi & Kelime Zorluk Raporları
              </h3>
              <span className="text-[10px] text-slate-400">
                Oynanan tüm maçlar, anlık durumlar, nerede kaldıkları ve kelime başarı/tabu metrikleri
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchGameAnalytics}
              disabled={loadingGameAnalytics}
              className="text-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 mr-1 ${loadingGameAnalytics ? 'animate-spin' : ''}`} /> Yenile
            </Button>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400">Toplam Oynanan Oyun</span>
              <span className="text-2xl font-black text-indigo-400 font-mono">
                {gameAnalyticsData?.summary?.totalGames || 0}
              </span>
              <span className="text-[10px] text-slate-500">Tüm Misafir & Üyeler</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400">Tamamlanan Maçlar</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {gameAnalyticsData?.summary?.completedGames || 0}
              </span>
              <span className="text-[10px] text-emerald-400/80 font-bold">
                %{gameAnalyticsData?.summary?.completionRate || 0} Bitirme Oranı
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400">Anlık Devam Edenler</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {gameAnalyticsData?.summary?.inProgressGames || 0}
              </span>
              <span className="text-[10px] text-amber-400/80 font-bold">Aktif Arenada</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400">İncelenen Kelime Olayı</span>
              <span className="text-2xl font-black text-purple-400 font-mono">
                {gameAnalyticsData?.summary?.totalCardEvents || 0}
              </span>
              <span className="text-[10px] text-slate-500">Doğru, Pas & Tabular</span>
            </div>
          </div>

          {/* Section 1: Recent Game Sessions */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Son Oyunlar & Durumları (Nerede Kaldılar?)
            </h4>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Tarih & Oyuncu</th>
                      <th className="py-3 px-4">Durum</th>
                      <th className="py-3 px-4">Tur İlerlemesi</th>
                      <th className="py-3 px-4">Takımlar & Skorlar</th>
                      <th className="py-3 px-4">Kazanan</th>
                      <th className="py-3 px-4">Doğru / Pas / Tabu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {loadingGameAnalytics ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Oyun verileri yükleniyor...
                        </td>
                      </tr>
                    ) : (gameAnalyticsData?.recentGames || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Henüz kayıtlı oyun verisi bulunmuyor.
                        </td>
                      </tr>
                    ) : (
                      (gameAnalyticsData?.recentGames || []).map((game: any) => {
                        const dateStr = new Date(game.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <tr key={game.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white text-xs">{dateStr}</div>
                              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                                {game.user_id || game.guest_id}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                game.status === 'finished'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : game.status === 'in_progress'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {game.status === 'finished' ? 'Tamamlandı ' : game.status === 'in_progress' ? 'Devam Ediyor ' : 'Terk Edildi'}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-slate-300 text-xs">
                              Tur {game.current_round} / {game.total_rounds || 6}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                                {(game.teams || []).map((t: any) => (
                                  <span key={t.id} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800" style={{ color: t.color || '#fff' }}>
                                    {t.name?.split(' ')[0]}: {t.score}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3 px-4 font-bold text-amber-300">
                              {game.winner_team_name ? (
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>{game.winner_team_name} ({game.winner_score}P)</span>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-[11px]">-</span>
                              )}
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px]">
                              <span className="text-emerald-400 font-bold">{game.total_correct || 0} D</span> •{' '}
                              <span className="text-amber-400 font-bold">{game.total_pass || 0} P</span> •{' '}
                              <span className="text-red-400 font-bold">{game.total_tabu || 0} T</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 2: Word Performance & Difficulty Analytics */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Kelime Seviyesinde Başarı & Dinamik Zorluk Analizi
                </h4>
                <span className="text-[10px] text-slate-400">
                  Kelimelerin maçlarda kaç kez görüldüğü, bilinme, pas ve tabu yapılma oranları
                </span>
              </div>

              <input
                type="text"
                value={wordSearchQuery}
                onChange={(e) => setWordSearchQuery(e.target.value)}
                placeholder="Kelime Ara..."
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-full sm:w-48"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Kelime</th>
                      <th className="py-3 px-4">Görülme Sayısı</th>
                      <th className="py-3 px-4">Doğru Oranı</th>
                      <th className="py-3 px-4">Pas Oranı</th>
                      <th className="py-3 px-4">Tabu / Hata Oranı</th>
                      <th className="py-3 px-4">Dinamik Zorluk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {loadingGameAnalytics ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Kelime analitikleri hesaplanıyor...
                        </td>
                      </tr>
                    ) : (
                      (gameAnalyticsData?.words || [])
                        .filter((w: any) =>
                          !wordSearchQuery || w.word.toLowerCase().includes(wordSearchQuery.toLowerCase())
                        )
                        .slice(0, 50)
                        .map((w: any) => (
                          <tr key={w.word} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-black text-white text-xs">
                              {w.word}
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-300">
                              {w.seen} kez
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-emerald-400">%{w.correctRate}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({w.correct})</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-amber-400">%{w.passRate}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({w.pass})</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-rose-400">%{w.tabuRate}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({w.tabu})</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                w.difficulty === 'Zor'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : w.difficulty === 'Kolay'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}>
                                {w.difficulty === 'Zor' ? 'Zor' : w.difficulty === 'Kolay' ? 'Kolay' : 'Orta'}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <Bug className="w-3.5 h-3.5" /> Test Hatası Oluştur & Gönder
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
                            <span>{log.page_url || '/'}</span>
                            <span>{new Date(log.created_at).toLocaleString('tr-TR')}</span>
                            {log.user_id && <span>{log.user_id}</span>}
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
                { id: 'decks', label: 'Desteler & Kategoriler' },
                { id: 'cards', label: 'Kelime Havuzu & Arama' },
                { id: 'add_card', label: 'Tekil Kart Ekle' },
                { id: 'bulk_import', label: 'Toplu İçe Aktar' },
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
                        Kartları İncele & Düzenle
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
                  {bulkImporting ? 'Yükleniyor...' : 'Kartları Desteye Toplu Yükle'}
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
                      {trigger.conversionRate >= 30 ? 'Yüksek' : trigger.conversionRate >= 15 ? 'Normal' : 'Geliştir'}
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
                {savingStrategy ? 'Canlıya Alınıyor...' : 'Stratejiyi Kaydet & Canlıya Al'}
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

      {/* TAB: ADS & AD ENGINE STUDIO */}
      {activeTab === 'ads' && (
        <div className="flex flex-col gap-5">
          {/* Section 1: Ad Engine Configuration & Rules */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-500/40 flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-400" /> Reklam Motoru & Gösterim Kuralları
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Oyun aralarında, tur sonlarında ve maç özetinde çıkacak reklamların sıklığını, süresini ve Pro ayrıcalıklarını belirleyin.
                </p>
              </div>

              {adConfigSavedSuccess && (
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5 animate-pulse shrink-0">
                  <Check className="w-4 h-4" /> Reklam Ayarları Canlıda!
                </div>
              )}
            </div>

            {/* Master Switch & Pro Ad Free */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-black text-white block">Reklam Gösterimi (Master Switch)</span>
                  <span className="text-[10px] text-slate-400">Tüm sistem genelinde reklamları aç / kapat</span>
                </div>
                <input
                  type="checkbox"
                  checked={adConfig.ads_enabled}
                  onChange={(e) => setAdConfig({ ...adConfig, ads_enabled: e.target.checked })}
                  className="rounded accent-indigo-500 w-5 h-5 cursor-pointer"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-black text-white block">Pro Üyelere Reklamsız Deneyim</span>
                  <span className="text-[10px] text-slate-400">Pro kullanıcılara hiçbir reklam gösterme</span>
                </div>
                <input
                  type="checkbox"
                  checked={adConfig.pro_users_ad_free}
                  onChange={(e) => setAdConfig({ ...adConfig, pro_users_ad_free: e.target.checked })}
                  className="rounded accent-amber-500 w-5 h-5 cursor-pointer"
                />
              </label>
            </div>

            {/* Frequency (Interval Turns) */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Tur Sıklığı (Kaç turda bir reklam gösterilsin?):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAdConfig({ ...adConfig, interval_turns: num })}
                    className={`py-3 rounded-2xl text-xs font-black border transition-all ${
                      adConfig.interval_turns === num
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {num === 1 ? 'Her Turda' : `Her ${num} Turda Bir`}
                  </button>
                ))}
              </div>
            </div>

            {/* Global Default Display Format */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Varsayılan Reklam Formatı (Global Default):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'fullscreen', label: 'Tam Ekran', desc: 'Sürükleyici Geçiş' },
                  { type: 'popup', label: 'Popup Modal', desc: 'Merkezi Kart' },
                  { type: 'banner_bottom', label: 'Alt Banner', desc: 'Sabit Şerit' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setAdConfig({ ...adConfig, default_display_type: item.type as any })}
                    className={`py-2.5 px-3 rounded-2xl text-left flex flex-col gap-0.5 border transition-all ${
                      (adConfig.default_display_type || 'popup') === item.type
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black">{item.label}</span>
                    <span className="text-[9px] text-slate-400">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skip Delay Countdown */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Reklam Atlama Süresi (Geri sayım kaç saniye sürsün?):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { delay: 0, label: '0 sn (Hemen Geçilebilir)' },
                  { delay: 3, label: '3 sn Geri Sayım' },
                  { delay: 5, label: '5 sn Geri Sayım' },
                ].map((item) => (
                  <button
                    key={item.delay}
                    type="button"
                    onClick={() => setAdConfig({ ...adConfig, skip_delay_seconds: item.delay })}
                    className={`py-3 rounded-2xl text-xs font-black border transition-all ${
                      adConfig.skip_delay_seconds === item.delay
                        ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Triggers Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Tur Sonlarında Göster</span>
                  <span className="text-[10px] text-slate-400">Tur aralarında süre bittiğinde reklam tetikle</span>
                </div>
                <input
                  type="checkbox"
                  checked={adConfig.on_round_end}
                  onChange={(e) => setAdConfig({ ...adConfig, on_round_end: e.target.checked })}
                  className="rounded accent-indigo-500 w-5 h-5 cursor-pointer"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Maç Sonunda Göster</span>
                  <span className="text-[10px] text-slate-400">Oyun bittiğinde özet ekranından önce reklam tetikle</span>
                </div>
                <input
                  type="checkbox"
                  checked={adConfig.on_match_end}
                  onChange={(e) => setAdConfig({ ...adConfig, on_match_end: e.target.checked })}
                  className="rounded accent-indigo-500 w-5 h-5 cursor-pointer"
                />
              </label>
            </div>

            {/* Save & Test Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSaveAdConfig}
                disabled={savingAdConfig}
                className="flex-1 py-3.5 font-black text-sm bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-95 shadow-lg shadow-indigo-500/25"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingAdConfig ? 'Kaydediliyor...' : 'Reklam Ayarlarını Kaydet & Canlıya Al'}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsTestAdModalOpen(true)}
                className="text-xs py-3.5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 font-bold"
              >
                <Tv className="w-4 h-4 mr-1.5" /> Canlı Reklamı Test Et
              </Button>
            </div>
          </div>

          {/* Section 2: Ad Inventory & Creatives Management (CRUD) */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Tv className="w-4 h-4 text-purple-400" /> Reklam Envanteri & İçerikler ({adsList.length} Reklam)
                </h3>
                <span className="text-[10px] text-slate-400">
                  Yayındaki sponsorlukları, Pro bannerlarını ve reklam içeriklerini yönetin
                </span>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const newAd: AdItem = {
                    id: `ad-${Date.now()}`,
                    title: 'Yeni Sponsor / Özel Fırsat',
                    description: 'Reklam açıklamasını buraya girin...',
                    badge: 'SPONSORLU',
                    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
                    cta_text: 'Hemen İncele',
                    target_url: 'https://portegu.com',
                    placement: 'all',
                    display_type: 'popup',
                    is_skippable: true,
                    skip_delay_seconds: 3,
                    duration_seconds: 8,
                    color_theme: 'from-indigo-600 to-purple-800',
                    is_active: true,
                    impressions: 0,
                    clicks: 0,
                    created_at: new Date().toISOString(),
                  };
                  setEditingAd(newAd);
                }}
                className="text-xs font-bold py-2 px-3 bg-indigo-600 hover:bg-indigo-500"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Yeni Reklam Ekle
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adsList.map((ad) => {
                const ctr = ad.impressions > 0 ? Math.round((ad.clicks / ad.impressions) * 100) : 0;

                return (
                  <div
                    key={ad.id}
                    className={`rounded-3xl border transition-all p-4 flex flex-col justify-between gap-3 shadow-xl ${
                      ad.is_active
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/60 border-slate-900 opacity-60'
                    }`}
                  >
                    {/* Ad Creative Top Preview */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {ad.image_url ? (
                          <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ad.color_theme || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white shrink-0`}>
                            <Megaphone className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {ad.badge || 'REKLAM'}
                            </span>
                            <span className="text-[9px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30 font-mono">
                              {ad.display_type === 'fullscreen' ? 'Tam Ekran' : ad.display_type === 'banner_bottom' ? 'Alt Banner' : 'Popup Modal'}
                            </span>
                            <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                              {ad.is_skippable !== false ? `${ad.skip_delay_seconds ?? 3}s Geçilebilir` : 'Zorunlu'}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white truncate mt-1">{ad.title}</h4>
                        </div>
                      </div>

                      {/* Status Toggle */}
                      <button
                        onClick={() => handleToggleAdStatus(ad.id, ad.is_active)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 shrink-0 ${
                          ad.is_active
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ad.is_active ? <Check className="w-3 h-3" /> : null}
                        {ad.is_active ? 'Yayında' : 'Pasif'}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {ad.description}
                    </p>

                    {/* Stats & Metrics */}
                    <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-slate-950/70 border border-slate-800 text-center font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Gösterim</span>
                        <span className="text-xs font-bold text-white">{ad.impressions || 0}</span>
                      </div>
                      <div className="border-x border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Tıklama</span>
                        <span className="text-xs font-bold text-emerald-400">{ad.clicks || 0}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">CTR</span>
                        <span className="text-xs font-bold text-amber-400">%{ctr}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-500 font-mono truncate max-w-[150px]">
                        {ad.target_url}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAd(ad)}
                          className="text-[10px] py-1 px-2.5 bg-slate-950 border-slate-800 text-indigo-300 font-bold"
                        >
                          <Edit3 className="w-3 h-3 mr-1" /> Düzenle
                        </Button>

                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                          title="Reklamı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Sayfa Bazında Reklam Tıklama & Gösterim Analitiği */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Sayfa Bazında Tıklama & Gösterim Analitiği
                </h3>
                <span className="text-[10px] text-slate-400">
                  Hangi sayfalarda reklamların ne kadar görüntülendiği, tıklandığı ve CTR performansı
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchAdsData}
                disabled={loadingAdEvents}
                className="text-xs py-1.5 px-3 bg-slate-900 border-slate-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingAdEvents ? 'animate-spin' : ''}`} /> Yenile
              </Button>
            </div>

            {/* Page Breakdown Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Sayfa URL</th>
                      <th className="py-2.5 px-4 text-center">Toplam Gösterim</th>
                      <th className="py-2.5 px-4 text-center">Toplam Tıklama</th>
                      <th className="py-2.5 px-4 text-center">Geçilme (Skip)</th>
                      <th className="py-2.5 px-4 text-right">Dönüşüm Oranı (CTR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {adEventsData?.page_stats && Object.keys(adEventsData.page_stats).length > 0 ? (
                      Object.entries(adEventsData.page_stats).map(([page, stat]: [string, any]) => (
                        <tr key={page} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-white flex items-center gap-1.5">
                            <span className="text-indigo-400">📄</span> {page}
                          </td>
                          <td className="py-2.5 px-4 text-center text-slate-300 font-bold">{stat.impressions}</td>
                          <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">{stat.clicks}</td>
                          <td className="py-2.5 px-4 text-center text-amber-400">{stat.skips}</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              stat.ctr >= 15 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              %{stat.ctr}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                          Henüz kayıtlı sayfa bazlı reklam telemetrisi bulunmuyor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 4: Canlı Reklam Etkinlik & Tıklama Günlüğü */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Canlı Reklam Etkinlik & Tıklama Günlüğü (Son {adEventsData?.events?.length || 0} Olay)
              </h3>
              <span className="text-[10px] text-slate-400">
                Kullanıcıların hangi saniyede reklamı geçtiği, tıkladığı ve izlediği tüm telemetri kayıtları
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl max-h-80 overflow-y-auto">
              <div className="divide-y divide-slate-800/60 font-mono text-xs">
                {adEventsData?.events && adEventsData.events.length > 0 ? (
                  adEventsData.events.map((ev: any) => (
                    <div key={ev.id} className="p-3 hover:bg-slate-850/50 transition-colors flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${
                          ev.event_type === 'click'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                            : ev.event_type === 'skip'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        }`}>
                          {ev.event_type === 'click' ? 'TIKLAMA' : ev.event_type === 'skip' ? 'GEÇİLDİ' : 'GÖSTERİM'}
                        </span>

                        <div className="min-w-0">
                          <span className="text-white font-bold truncate block">{ev.ad_title || ev.ad_id}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Sayfa: <strong className="text-indigo-300">{ev.page_url}</strong></span>
                            <span>•</span>
                            <span>Format: <strong className="text-slate-300">{ev.display_type}</strong></span>
                            {ev.duration_watched_seconds > 0 && (
                              <>
                                <span>•</span>
                                <span>İzlenme: <strong className="text-amber-300">{ev.duration_watched_seconds}s</strong></span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">{new Date(ev.created_at).toLocaleTimeString('tr-TR')}</span>
                        <span className="text-[9px] text-slate-500 truncate max-w-[100px] block">{ev.user_id || ev.guest_id || 'Misafir'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Henüz kayıtlı reklam etkinliği bulunmuyor.
                  </div>
                )}
              </div>
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
                  placeholder="v1.2.0: AI & Kart Geliştirmeleri"
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

      {/* TAB: ONBOARDING & EXPERIENCE STUDIO */}
      {activeTab === 'onboarding' && (
        <div className="flex flex-col gap-5">
          {/* Top Info & Summary Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-400" /> Görsel Onboarding & Deneyim Stüdyosu
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kullanıcılara sıradan bir oyun yerine duyusal ve interaktif bir deneyim yaşatın. Adımları yan yana inceleyin, sıralayın ve canlıya alın.
                </p>
              </div>

              {onboardingSavedSuccess && (
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5 animate-pulse shrink-0">
                  <Check className="w-4 h-4" /> Akış Canlıya Alındı!
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Toplam Başlama</span>
                <span className="text-lg font-black text-white font-mono">{summary.onboardingStarts || 1}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Tamamlama Oranı</span>
                <span className="text-lg font-black text-purple-300 font-mono">%{summary.onboardingRate || 100}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Aktif Adım Sayısı</span>
                <span className="text-lg font-black text-cyan-300 font-mono">{onboardingSteps.length} Adım</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Deneyim Türü</span>
                <span className="text-lg font-black text-amber-300 font-mono">İnteraktif</span>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddNewOnboardingStep}
                  className="text-xs py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Yeni Adım Ekle
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDefaultOnboarding}
                  className="text-xs py-2 px-3 border-slate-800 hover:bg-slate-800 text-slate-400"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Sıfırla
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsTestOnboardingOpen(true)}
                  className="text-xs py-2 px-3 font-bold border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                >
                  <Compass className="w-3.5 h-3.5 mr-1 text-purple-400" /> Modal Olarak Test Et
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveOnboardingFlow}
                  disabled={savingOnboarding}
                  className="text-xs py-2 px-4 font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {savingOnboarding ? 'Kaydediliyor...' : 'Tüm Akışı Kaydet & Canlıya Al'}
                </Button>
              </div>
            </div>
          </div>

          {/* VISUAL STORYBOARD / TIMELINE (YAN YANA TELEFON ÇERÇEVELERİ) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Canlı Akış Önizlemesi ({onboardingSteps.length} Adım Sıralı)
              </span>
              <span className="text-[10px] text-slate-500">
                Adımları sağa/sola taşıyarak sırasını değiştirebilirsiniz
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {onboardingSteps.map((step, index) => (
                <div
                  key={step.id || index}
                  className="rounded-3xl bg-slate-950 border border-slate-800/90 hover:border-purple-500/50 transition-all p-4 flex flex-col justify-between gap-3 shadow-xl relative group overflow-hidden"
                >
                  {/* Top Step Pill & Reorder Bar */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-black font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      Adım #{index + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOnboardingStep(index, 'left')}
                        disabled={index === 0}
                        className="p-1 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 disabled:hover:text-slate-500"
                        title="Sola Taşı"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMoveOnboardingStep(index, 'right')}
                        disabled={index === onboardingSteps.length - 1}
                        className="p-1 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 disabled:hover:text-slate-500"
                        title="Sağa Taşı"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Smartphone Frame Inner Content */}
                  <div className="flex flex-col items-center text-center gap-2.5 py-1">
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${step.badge_color || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                      {step.badge}
                    </span>

                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
                      {renderDeckIcon(step.icon, 'w-6 h-6')}
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {step.desc}
                      </p>
                    </div>

                    {/* Interactive Widget Mini Representation */}
                    <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-[10px] text-slate-300">
                      {step.interactive_type === 'buzzer_tester' && (
                        <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold">
                          <Volume2 className="w-3.5 h-3.5" /> Dokunmatik Buzzer Testi
                        </div>
                      )}
                      {step.interactive_type === 'rules_card' && (
                        <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold">
                          <Flame className="w-3.5 h-3.5" /> Yasaklı Kelime Örnek Kartı
                        </div>
                      )}
                      {step.interactive_type === 'ai_spark' && (
                        <div className="flex items-center justify-center gap-1.5 text-purple-400 font-bold">
                          <Sparkles className="w-3.5 h-3.5" /> Gemini 3.5 AI Motoru
                        </div>
                      )}
                      {step.interactive_type === 'user_profile' && (
                        <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                          <Trophy className="w-3.5 h-3.5" /> Oyuncu Adı Girişi
                        </div>
                      )}
                    </div>

                    {/* Bullets preview */}
                    {step.bullets && step.bullets.length > 0 && (
                      <div className="w-full bg-slate-900/50 rounded-xl p-2 text-left flex flex-col gap-1 text-[9px] text-slate-400">
                        {step.bullets.slice(0, 2).map((b, bIdx) => (
                          <div key={bIdx} className="truncate flex items-center gap-1">
                            <span className="text-indigo-400 font-bold">•</span> {b}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Controls */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOnboardingStep(step)}
                      className="text-[10px] py-1 px-2.5 flex-1 bg-slate-900 border-slate-800 hover:bg-slate-800 text-indigo-300 font-bold"
                    >
                      <Edit3 className="w-3 h-3 mr-1" /> Düzenle
                    </Button>

                    <button
                      onClick={() => handleDeleteOnboardingStep(step.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Adımı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Edit Onboarding Step Modal */}
      {editingOnboardingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-purple-500/40 p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Deneyim Adımını Düzenle</h4>
                  <span className="text-[10px] text-slate-400">Adım ID: {editingOnboardingStep.id}</span>
                </div>
              </div>
              <button onClick={() => setEditingOnboardingStep(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setOnboardingSteps((prev) =>
                  prev.map((s) => (s.id === editingOnboardingStep.id ? editingOnboardingStep : s))
                );
                setEditingOnboardingStep(null);
              }}
              className="flex flex-col gap-3.5"
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Rozet Metni (Badge):</label>
                  <input
                    type="text"
                    value={editingOnboardingStep.badge}
                    onChange={(e) => setEditingOnboardingStep({ ...editingOnboardingStep, badge: e.target.value })}
                    placeholder="YENİ NESİL TABU"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Rozet Renk Teması:</label>
                  <select
                    value={editingOnboardingStep.badge_color || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}
                    onChange={(e) => setEditingOnboardingStep({ ...editingOnboardingStep, badge_color: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="bg-amber-500/20 text-amber-300 border-amber-500/30">Amber (Sıcak/Öne Çıkan)</option>
                    <option value="bg-rose-500/20 text-rose-300 border-rose-500/30">Rose (Buzzer/Heyecan)</option>
                    <option value="bg-purple-500/20 text-purple-300 border-purple-500/30">Mor (AI/Trend)</option>
                    <option value="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Yeşil (Başarı/Profil)</option>
                    <option value="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">İndigo (Klasik)</option>
                    <option value="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Camgöbeği (Oyun)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Adım Ana Başlığı:</label>
                <input
                  type="text"
                  value={editingOnboardingStep.title}
                  onChange={(e) => setEditingOnboardingStep({ ...editingOnboardingStep, title: e.target.value })}
                  placeholder="Örn: Sıradan Oyunları Unut!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-black text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Açıklama / Deneyim Mesajı:</label>
                <textarea
                  rows={2}
                  value={editingOnboardingStep.desc}
                  onChange={(e) => setEditingOnboardingStep({ ...editingOnboardingStep, desc: e.target.value })}
                  placeholder="Kullanıcıya bu adımda hissettirmek istediğiniz mesaj..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">İkon Seçimi:</label>
                  <select
                    value={editingOnboardingStep.icon}
                    onChange={(e) => setEditingOnboardingStep({ ...editingOnboardingStep, icon: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Flame">Alev (Kıvılcım & Vibe)</option>
                    <option value="Volume2">Hoparlör / Buzzer</option>
                    <option value="Sparkles">Parıltı / Gemini AI</option>
                    <option value="Trophy">Kupa / Karakter & Profil</option>
                    <option value="Smartphone">Akıllı Telefon</option>
                    <option value="Gamepad2">Oyun Kolu</option>
                    <option value="Crown">Taç / VIP</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">İnteraktif Deneyim Türü:</label>
                  <select
                    value={editingOnboardingStep.interactive_type}
                    onChange={(e) =>
                      setEditingOnboardingStep({
                        ...editingOnboardingStep,
                        interactive_type: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="buzzer_tester">Canlı Dokunmatik Buzzer Testi</option>
                    <option value="rules_card">Yasaklı Kelime Örnek Kartı</option>
                    <option value="ai_spark">Gemini 3.5 Yapay Zeka Çipi</option>
                    <option value="user_profile">Oyuncu Adı Giriş Kutusu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Öne Çıkan Maddeler (Her satıra 1 madde):
                </label>
                <textarea
                  rows={3}
                  value={(editingOnboardingStep.bullets || []).join('\n')}
                  onChange={(e) =>
                    setEditingOnboardingStep({
                      ...editingOnboardingStep,
                      bullets: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  placeholder="Yasaklı kelimeleri söylemeden anlat&#10;Doğru bildiğinde +1 Puan kazan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Buton Metni (CTA):</label>
                <input
                  type="text"
                  value={editingOnboardingStep.cta_text || 'Devam Et'}
                  onChange={(e) => setEditingOnboardingStep({ ...editingOnboardingStep, cta_text: e.target.value })}
                  placeholder="Örn: Devam Et, Harika Dene!, Arenaya Başla!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setEditingOnboardingStep(null)}
                  className="text-xs"
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="text-xs font-black bg-purple-600 hover:bg-purple-500"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Değişiklikleri Uygula
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ad Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Reklam İçeriğini Düzenle</h4>
                  <span className="text-[10px] text-slate-400">ID: {editingAd.id}</span>
                </div>
              </div>
              <button onClick={() => setEditingAd(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const exists = adsList.some((a) => a.id === editingAd.id);
                const updated = exists
                  ? adsList.map((a) => (a.id === editingAd.id ? editingAd : a))
                  : [editingAd, ...adsList];
                handleSaveAdsList(updated);
                setEditingAd(null);
              }}
              className="flex flex-col gap-3.5"
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Rozet Metni (Badge):</label>
                  <input
                    type="text"
                    value={editingAd.badge || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, badge: e.target.value })}
                    placeholder="Örn: SPONSORLU, ÖZEL FIRSAT"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Gösterim Konumu (Placement):</label>
                  <select
                    value={editingAd.placement}
                    onChange={(e) => setEditingAd({ ...editingAd, placement: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Tüm Konumlar (Her Yerde)</option>
                    <option value="turn_break">Tur Aralarında (Turn Break)</option>
                    <option value="round_end">Tur Sonlarında (Round End)</option>
                    <option value="match_end">Maç Sonunda (Match Summary)</option>
                  </select>
                </div>
              </div>

              {/* Reklam Gösterim Formatı (Tam Ekran vs Popup vs Banner) */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold">
                  Reklam Gösterim Formatı (Display Type):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'fullscreen', label: 'Tam Ekran', desc: 'Sürükleyici Geçiş' },
                    { type: 'popup', label: 'Popup Modal', desc: 'Merkezi Kart' },
                    { type: 'banner_bottom', label: 'Alt Banner', desc: 'Sabit Şerit' },
                  ].map((f) => (
                    <button
                      key={f.type}
                      type="button"
                      onClick={() => setEditingAd({ ...editingAd, display_type: f.type as any })}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                        (editingAd.display_type || 'popup') === f.type
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black">{f.label}</span>
                      <span className="text-[9px] text-slate-400">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reklama Özel Geçilebilirlik & Süre Ayarları */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Geçilebilir Reklam (Skippable)</span>
                    <span className="text-[10px] text-slate-400">
                      {editingAd.is_skippable !== false 
                        ? 'Kullanıcı belirli saniye sonra reklamı kapatabilir' 
                        : 'Kullanıcı reklamı geçemez (Süre sonuna kadar zorunlu)'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingAd.is_skippable !== false}
                    onChange={(e) => setEditingAd({ ...editingAd, is_skippable: e.target.checked })}
                    className="rounded accent-indigo-500 w-5 h-5 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Kaç Saniye Sonra Geçilsin?:
                    </label>
                    <select
                      disabled={editingAd.is_skippable === false}
                      value={editingAd.skip_delay_seconds ?? 3}
                      onChange={(e) => setEditingAd({ ...editingAd, skip_delay_seconds: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                    >
                      <option value={0}>0 sn (Anında Kapatılabilir)</option>
                      <option value={3}>3 saniye sonra</option>
                      <option value={5}>5 saniye sonra</option>
                      <option value={10}>10 saniye sonra</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Toplam Gösterim Süresi:
                    </label>
                    <select
                      value={editingAd.duration_seconds ?? 8}
                      onChange={(e) => setEditingAd({ ...editingAd, duration_seconds: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={5}>5 saniye</option>
                      <option value={8}>8 saniye</option>
                      <option value={10}>10 saniye</option>
                      <option value={15}>15 saniye</option>
                      <option value={30}>30 saniye</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Reklam Başlığı:</label>
                <input
                  type="text"
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  placeholder="Örn: Parti Molasında Kahve Keyfi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-black text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Reklam Açıklaması:</label>
                <textarea
                  rows={2}
                  value={editingAd.description}
                  onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                  placeholder="Reklam metnini buraya yazın..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Banner Görsel URL'i:</label>
                <input
                  type="url"
                  value={editingAd.image_url || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Buton Metni (CTA):</label>
                  <input
                    type="text"
                    value={editingAd.cta_text}
                    onChange={(e) => setEditingAd({ ...editingAd, cta_text: e.target.value })}
                    placeholder="Hemen İncele"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Hedef Link (URL veya /paywall):</label>
                  <input
                    type="text"
                    value={editingAd.target_url}
                    onChange={(e) => setEditingAd({ ...editingAd, target_url: e.target.value })}
                    placeholder="https://portegu.com veya /paywall"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="text-xs"
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="text-xs font-black bg-indigo-600 hover:bg-indigo-500"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Reklamı Kaydet & Yayınla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <PaywallModal isOpen={isTestPaywallOpen} onClose={() => setIsTestPaywallOpen(false)} triggerSource="admin_preview" />
      {testUpdateModal && <UpdateModal isOpen={Boolean(testUpdateModal)} onClose={() => setTestUpdateModal(null)} updateInfo={testUpdateModal} />}
      <OnboardingModal isOpen={isTestOnboardingOpen} onClose={() => setIsTestOnboardingOpen(false)} />
      <InterstitialAdModal isOpen={isTestAdModalOpen} onClose={() => setIsTestAdModalOpen(false)} placement="all" />
    </div>
  );
}
