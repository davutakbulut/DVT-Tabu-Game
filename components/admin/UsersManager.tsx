'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Search,
  RefreshCw,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Flame,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  Zap,
  Globe
} from 'lucide-react';

interface UserRecord {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  provider: string;
  is_pro: boolean;
  created_at: string;
  last_login_at: string;
  stats: {
    totalGamesPlayed: number;
    totalWins: number;
    totalCorrectWords: number;
    totalTaboosHit: number;
    totalPassesUsed: number;
    winRate: number;
  };
}

interface UsersApiResponse {
  users: UserRecord[];
  summary: {
    totalUsers: number;
    proUsers: number;
    googleUsers: number;
    guestUsers: number;
  };
}

export function UsersManager() {
  const [data, setData] = useState<UsersApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pro' | 'free' | 'google' | 'guest'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTogglePro = async (user: UserRecord) => {
    const newProState = !user.is_pro;
    setUpdatingUserId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isPro: newProState,
        }),
      });

      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            users: prev.users.map((u) => (u.id === user.id ? { ...u, is_pro: newProState } : u)),
            summary: {
              ...prev.summary,
              proUsers: newProState ? prev.summary.proUsers + 1 : prev.summary.proUsers - 1,
            },
          };
        });
      }
    } catch {
      alert('Kullanıcı durumu güncellenemedi.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const usersList = data?.users || [];
  const summary = data?.summary || { totalUsers: 0, proUsers: 0, googleUsers: 0, guestUsers: 0 };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'pro') return u.is_pro;
    if (filterType === 'free') return !u.is_pro;
    if (filterType === 'google') return u.provider === 'google' || Boolean(u.email);
    if (filterType === 'guest') return u.provider === 'guest' && !u.email;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Refresh Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Kayıtlı Kullanıcılar & Üye Veritabanı
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              SUPABASE CRM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Veritabanında kayıtlı tüm kullanıcı hesapları, kariyer istatistikleri ve PRO üyelik yönetimi.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>Toplam Kayıtlı Üye</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{summary.totalUsers}</span>
            <span className="text-[11px] text-slate-400">Profil</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>PRO / VIP Üyeler</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 tracking-tight">{summary.proUsers}</span>
            <span className="text-[11px] text-amber-400/80 font-bold">
              ({summary.totalUsers > 0 ? Math.round((summary.proUsers / summary.totalUsers) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>Google / E-Posta</span>
            <Mail className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">{summary.googleUsers}</span>
            <span className="text-[11px] text-slate-400">Doğrulanmış</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>Misafir Profiller</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{summary.guestUsers}</span>
            <span className="text-[11px] text-slate-400">Cihaz Bazlı</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim, e-posta veya Kullanıcı ID ara..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 pl-8 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: 'all', label: `Tümü (${usersList.length})` },
            { key: 'pro', label: `PRO (${summary.proUsers})` },
            { key: 'free', label: `Ücretsiz (${summary.totalUsers - summary.proUsers})` },
            { key: 'google', label: `Google / Mail (${summary.googleUsers})` },
            { key: 'guest', label: `Misafir (${summary.guestUsers})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key as any)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                filterType === f.key
                  ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Arama kriterlerine uygun kullanıcı bulunamadı.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                  <th className="py-3 px-3">Kullanıcı / Profil</th>
                  <th className="py-3 px-3">Giriş Sağlayıcı</th>
                  <th className="py-3 px-3">Üyelik Durumu</th>
                  <th className="py-3 px-3 text-center">Maç / Galibiyet</th>
                  <th className="py-3 px-3 text-center">Doğru Kelime</th>
                  <th className="py-3 px-3">Son Giriş / Kayıt</th>
                  <th className="py-3 px-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* 1. Profil / Avatar */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.display_name}
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-black text-xs shadow-md">
                            {user.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs truncate max-w-[130px]">
                              {user.display_name}
                            </span>
                            {user.is_pro && (
                              <span className="p-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Crown className="w-2.5 h-2.5 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[150px]">
                            {user.email || user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Sağlayıcı */}
                    <td className="py-3.5 px-3">
                      {user.provider === 'google' || user.email ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Google Auth
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                          Misafir (Cihaz)
                        </span>
                      )}
                    </td>

                    {/* 3. Üyelik Durumu */}
                    <td className="py-3.5 px-3">
                      {user.is_pro ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black">
                          <Crown className="w-3.5 h-3.5 text-amber-400" /> PRO Üye
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                          Standart (Free)
                        </span>
                      )}
                    </td>

                    {/* 4. Maç & Galibiyet */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-white text-xs">
                          {user.stats.totalGamesPlayed} Maç / {user.stats.totalWins} Galibiyet
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          %{user.stats.winRate} Kazanma
                        </span>
                      </div>
                    </td>

                    {/* 5. Doğru Kelimeler */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-black text-indigo-400 text-xs font-mono">
                        {user.stats.totalCorrectWords} Kelime
                      </span>
                    </td>

                    {/* 6. Tarih */}
                    <td className="py-3.5 px-3">
                      <div className="text-[11px] text-slate-300">
                        <span className="block font-medium">
                          {new Date(user.last_login_at || user.created_at).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(user.last_login_at || user.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* 7. Aksiyonlar */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        disabled={updatingUserId === user.id}
                        onClick={() => handleTogglePro(user)}
                        className={`text-[11px] font-black py-1.5 px-3 rounded-xl border transition-all inline-flex items-center gap-1 ${
                          user.is_pro
                            ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-sm'
                        }`}
                      >
                        {updatingUserId === user.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : user.is_pro ? (
                          'PRO Kaldır'
                        ) : (
                          <>
                            <Crown className="w-3 h-3 text-amber-400" />
                            PRO Yap
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
