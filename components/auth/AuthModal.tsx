'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { 
  User, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Flame, 
  Check,
  Zap,
  Globe
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RANDOM_NICKNAMES = [
  'UstaTabucu', 'GizemliKaplan', 'KelimeAvcısı', 'HızlıAnlatıcı', 
  'GeceKartalı', 'ZekiPanda', 'FırtınaTabu', 'Şampiyon99'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { guestName, setGuestName, loginWithSocial, isLoggedIn, provider } = useUserStore();
  const [customName, setCustomName] = useState(guestName || '');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRandomName = () => {
    const random = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    setCustomName(random);
    setGuestName(random);
  };

  const handleGuestContinue = () => {
    if (customName.trim()) {
      setGuestName(customName.trim());
    }
    setSuccessMsg(`Hoş geldin, ${customName || 'Tabucu'}!`);
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 800);
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setTimeout(async () => {
      const simulatedEmail = (customName.toLowerCase().replace(/\s+/g, '') || 'oyuncu') + '@gmail.com';
      await loginWithSocial('google', simulatedEmail, customName || 'Google Oyuncusu', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100');
      setLoadingGoogle(false);
      setSuccessMsg('Google hesabınız başarıyla bağlandı! 🎉');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    }, 800);
  };

  const handleAppleSignIn = async () => {
    setLoadingApple(true);
    setTimeout(async () => {
      const simulatedEmail = (customName.toLowerCase().replace(/\s+/g, '') || 'oyuncu') + '@icloud.com';
      await loginWithSocial('apple', simulatedEmail, customName || 'Apple Oyuncusu');
      setLoadingApple(false);
      setSuccessMsg('Apple hesabınız başarıyla bağlandı! 🍏');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    }, 800);
  };

  const handleFacebookSignIn = async () => {
    setLoadingFacebook(true);
    setTimeout(async () => {
      const simulatedEmail = (customName.toLowerCase().replace(/\s+/g, '') || 'oyuncu') + '@facebook.com';
      await loginWithSocial('facebook', simulatedEmail, customName || 'Facebook Oyuncusu', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100');
      setLoadingFacebook(false);
      setSuccessMsg('Facebook hesabınız başarıyla bağlandı! 🔵');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {successMsg ? (
          <div className="py-12 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">{successMsg}</h3>
            <p className="text-xs text-slate-400">Arenaya yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-2 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  DVT TABU HESABI
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  Oyuna Giriş Yap
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Skorlarını, özel destelerini ve ayarlarını buluta kaydet.
              </p>
            </div>

            {/* Social Buttons: Google, Apple, Facebook */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle || loadingApple || loadingFacebook}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                {loadingGoogle ? 'Giriş Yapılıyor...' : 'Google ile Devam Et'}
              </button>

              <button
                onClick={handleAppleSignIn}
                disabled={loadingGoogle || loadingApple || loadingFacebook}
                className="w-full py-2.5 px-4 rounded-2xl bg-black hover:bg-slate-950 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all border border-slate-700 active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-6.3-9.77-11.37-20.73-15.21-32.88-3.84-12.15-5.76-23.71-5.76-34.68 0-14.54 3.73-26.68 11.19-36.42 7.46-9.74 16.73-14.73 27.81-14.98 4.58 0 9.77 1.25 15.57 3.75 5.8 2.5 9.74 3.79 11.83 3.87 1.85-.08 5.87-1.39 12.06-3.92 6.19-2.54 11.31-3.69 15.36-3.46 12.98.63 23.36 5.4 31.13 14.32-11.33 6.84-16.87 16.32-16.63 28.43.25 9.53 3.97 17.51 11.17 23.94 7.2 6.43 15.7 10.12 25.5 11.07-2.12 6.44-4.8 12.68-8.03 18.73zM119.22 33.06c0-7.39 2.67-14.28 8.01-20.67 5.34-6.39 12.06-10.42 20.16-12.09.43 1.09.65 2.29.65 3.6 0 7.39-2.73 14.35-8.19 20.88-5.46 6.53-12.21 10.49-20.25 11.88-.26-1.2-.38-2.4-.38-3.6z"/>
                </svg>
                {loadingApple ? 'Giriş Yapılıyor...' : 'Apple ile Devam Et'}
              </button>

              <button
                onClick={handleFacebookSignIn}
                disabled={loadingGoogle || loadingApple || loadingFacebook}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {loadingFacebook ? 'Giriş Yapılıyor...' : 'Facebook ile Devam Et'}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-0.5">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">veya Misafir Olarak</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Guest Quick Start */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Oyuncu Takma Adın..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleRandomName}
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold shrink-0"
                  title="Rastgele İsim Üret"
                >
                  🎲 Rastgele
                </button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleGuestContinue}
                fullWidth
                className="py-2.5 text-xs font-black shadow-md shadow-indigo-500/20"
              >
                Hızlı Başla & Oyna <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
