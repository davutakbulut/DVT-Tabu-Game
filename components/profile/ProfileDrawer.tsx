'use client';

import React, { useState } from 'react';
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
  Globe,
  Check
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
    loginWithSocial,
    logoutUser 
  } = useUserStore();

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const winRate = stats.totalGamesPlayed > 0 
    ? Math.round((stats.totalWins / stats.totalGamesPlayed) * 100) 
    : 0;

  const handleSocialConnect = async (prov: 'google' | 'apple' | 'facebook') => {
    setLoadingProvider(prov);
    setTimeout(async () => {
      let email = '';
      let name = guestName || 'Tabu Oyuncusu';
      let avatar: string | undefined = undefined;

      if (prov === 'google') {
        email = `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
        avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
      } else if (prov === 'apple') {
        email = `${name.toLowerCase().replace(/\s+/g, '')}@icloud.com`;
      } else {
        email = `${name.toLowerCase().replace(/\s+/g, '')}@facebook.com`;
        avatar = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100';
      }

      await loginWithSocial(prov, email, name, avatar);
      setLoadingProvider(null);
      setSuccessToast(`✓ ${prov.toUpperCase()} hesabı başarıyla bağlandı!`);
      setTimeout(() => setSuccessToast(null), 3000);
    }, 800);
  };

  const handleLogout = async () => {
    await logoutUser();
    setSuccessToast('✓ Hesaptan çıkış yapıldı, misafir profiline dönüldü.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

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

          {/* Success Toast Notification */}
          <AnimatePresence>
            {successToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{successToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

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
              <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 border ${
                isLoggedIn 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-slate-800 text-indigo-400 border-slate-700'
              }`}>
                {provider === 'google' 
                  ? 'Google Hesabı' 
                  : provider === 'apple' 
                  ? 'Apple Hesabı' 
                  : provider === 'facebook' 
                  ? 'Facebook Hesabı' 
                  : 'Cihaz Profili (Misafir)'}
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

        {/* Footer Actions & Login/Logout Logic */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-800">
          {/* 1. GİRİŞ YAPILMAMIŞSA VEYA ÇIKIŞ YAPILDIYSA (MISAFIR ISE) -> 3 SOSYAL GİRİŞ BUTONU GÖZÜKÜR */}
          {!isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center block">
                Hesabını Bağla & Skorlarını Koru
              </span>

              {/* Google Button */}
              <button
                onClick={() => handleSocialConnect('google')}
                disabled={loadingProvider !== null}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                {loadingProvider === 'google' ? 'Bağlanıyor...' : 'Google ile Giriş Yap'}
              </button>

              {/* Apple Button */}
              <button
                onClick={() => handleSocialConnect('apple')}
                disabled={loadingProvider !== null}
                className="w-full py-2.5 px-3 rounded-xl bg-black hover:bg-slate-950 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-6.3-9.77-11.37-20.73-15.21-32.88-3.84-12.15-5.76-23.71-5.76-34.68 0-14.54 3.73-26.68 11.19-36.42 7.46-9.74 16.73-14.73 27.81-14.98 4.58 0 9.77 1.25 15.57 3.75 5.8 2.5 9.74 3.79 11.83 3.87 1.85-.08 5.87-1.39 12.06-3.92 6.19-2.54 11.31-3.69 15.36-3.46 12.98.63 23.36 5.4 31.13 14.32-11.33 6.84-16.87 16.32-16.63 28.43.25 9.53 3.97 17.51 11.17 23.94 7.2 6.43 15.7 10.12 25.5 11.07-2.12 6.44-4.8 12.68-8.03 18.73zM119.22 33.06c0-7.39 2.67-14.28 8.01-20.67 5.34-6.39 12.06-10.42 20.16-12.09.43 1.09.65 2.29.65 3.6 0 7.39-2.73 14.35-8.19 20.88-5.46 6.53-12.21 10.49-20.25 11.88-.26-1.2-.38-2.4-.38-3.6z"/>
                </svg>
                {loadingProvider === 'apple' ? 'Bağlanıyor...' : 'Apple ile Giriş Yap'}
              </button>

              {/* Facebook Button */}
              <button
                onClick={() => handleSocialConnect('facebook')}
                disabled={loadingProvider !== null}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {loadingProvider === 'facebook' ? 'Bağlanıyor...' : 'Facebook ile Giriş Yap'}
              </button>
            </div>
          ) : (
            /* 2. ZATEN BİR ÜYE GİRİŞİ VARSA -> SOSYAL BUTONLAR GİZLENİR, BELİRGİN ÇIKIŞ BUTONU GÖZÜKÜR */
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Aktif Oturum:</span>
                <span className="font-bold text-white truncate max-w-[140px]">{userEmail}</span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-950/30 active:scale-98"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Hesaptan Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
