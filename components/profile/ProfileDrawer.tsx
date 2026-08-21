'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { 
  User, 
  Crown, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  LogOut, 
  X, 
  Sparkles, 
  Sliders, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onOpenRules: () => void;
  onOpenPaywall: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onOpenRules,
  onOpenPaywall,
}) => {
  const { 
    guestName, 
    userEmail, 
    userAvatar, 
    provider, 
    isLoggedIn, 
    isProUser, 
    stats,
    turnDuration,
    passLimit,
    logoutUser 
  } = useUserStore();

  if (!isOpen) return null;

  const winRate = stats.totalGamesPlayed > 0 
    ? Math.round((stats.totalWins / stats.totalGamesPlayed) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xs h-full bg-slate-900 border-l border-slate-800 p-5 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-slate-200"
      >
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Oyuncu Profili & Kariyer
            </span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex items-center gap-3">
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-12 h-12 rounded-2xl border border-indigo-500/40 object-cover shadow-md" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                {guestName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-sm truncate block">{guestName}</span>
                {isProUser && (
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                {isLoggedIn ? userEmail : 'Misafir Oyuncu'}
              </span>
              <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-indigo-400 mt-1 border border-slate-700">
                {provider === 'google' ? 'Google Hesabı' : provider === 'apple' ? 'Apple Hesabı' : 'Cihaz Profili'}
              </span>
            </div>
          </div>

          {/* Pro Status Banner */}
          {isProUser ? (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>DVT TABU PRO Aktif</span>
              </div>
              <span className="text-[9px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">VIP</span>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenPaywall();
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-between hover:border-amber-500 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="block leading-tight">Pro'ya Yükselt 👑</span>
                  <span className="text-[10px] text-amber-200/80 font-normal">Sınırsız AI & Reklamsız</span>
                </div>
              </div>
              <span className="text-[10px] font-bold underline">İncele</span>
            </button>
          )}

          {/* Career Stats Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Kariyer İstatistikleri
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> Toplam Maç
                </span>
                <span className="text-lg font-black text-white font-mono mt-0.5">{stats.totalGamesPlayed}</span>
                <span className="text-[9px] text-emerald-400 font-bold">{stats.totalWins} Galibiyet (%{winRate})</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Doğru Bilinen
                </span>
                <span className="text-lg font-black text-emerald-300 font-mono mt-0.5">{stats.totalCorrectWords}</span>
                <span className="text-[9px] text-slate-400">Kelime</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-400" /> Yasaklı (Tabu)
                </span>
                <span className="text-lg font-black text-rose-400 font-mono mt-0.5">{stats.totalTaboosHit}</span>
                <span className="text-[9px] text-slate-400">Ceza Puanı</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-indigo-400" /> Kullanılan Pas
                </span>
                <span className="text-lg font-black text-indigo-300 font-mono mt-0.5">{stats.totalPassesUsed}</span>
                <span className="text-[9px] text-slate-400">Hak</span>
              </div>
            </div>
          </div>

          {/* Active Settings Snapshot */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Kayıtlı Oyun Ayarların
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenRules();
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
              >
                Düzenle
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>⏱️ Tur Süresi:</span>
              <span className="font-mono font-bold text-white">{turnDuration} Saniye</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>🔄 Pas Hakkı:</span>
              <span className="font-mono font-bold text-white">{passLimit} Hak</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
          {!isLoggedIn ? (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="text-xs py-2.5 font-bold shadow-md shadow-indigo-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Google ile Hesabını Bağla
            </Button>
          ) : (
            <button
              onClick={logoutUser}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Hesaptan Çıkış Yap
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
