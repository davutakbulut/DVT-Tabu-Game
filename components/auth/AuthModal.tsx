'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
  Globe,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Dices,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { soundManager } from '@/lib/audio';

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
  const { guestName, setGuestName, loginWithSocial, userId } = useUserStore();
  const [authMode, setAuthMode] = useState<'social' | 'email'>('social');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Email Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customName, setCustomName] = useState(guestName || '');
  
  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRandomName = () => {
    const random = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    setCustomName(random);
    setGuestName(random);
    soundManager.play('pass');
  };

  const handleGuestContinue = () => {
    if (customName.trim()) {
      setGuestName(customName.trim());
    }
    soundManager.play('correct');
    setSuccessMsg(`Hoş geldin, ${customName || 'Tabucu'}!`);
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 600);
  };

  // --- OAuth: Google Sign In ---
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
      } else {
        // Mock fallback if offline
        const simEmail = (customName.toLowerCase().replace(/\s+/g, '') || 'oyuncu') + '@gmail.com';
        await loginWithSocial('google', simEmail, customName || 'Google Oyuncusu', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100');
        soundManager.play('start');
        setSuccessMsg('Google hesabınız başarıyla bağlandı!');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google ile giriş başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  // --- OAuth: Apple Sign In ---
  const handleAppleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
      } else {
        // Mock fallback if offline
        const simEmail = (customName.toLowerCase().replace(/\s+/g, '') || 'oyuncu') + '@icloud.com';
        await loginWithSocial('apple', simEmail, customName || 'Apple Oyuncusu');
        soundManager.play('start');
        setSuccessMsg('Apple hesabınız başarıyla bağlandı!');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Apple ile giriş başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  // --- Email & Password Auth ---
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured()) {
        if (isSignUp) {
          // Kayıt Ol
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: customName || email.split('@')[0],
              },
            },
          });
          if (error) throw error;

          await loginWithSocial(
            'google',
            email,
            customName || email.split('@')[0]
          );

          soundManager.play('start');
          setSuccessMsg('Hesabınız başarıyla oluşturuldu! Hoş geldiniz!');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 900);
        } else {
          // Giriş Yap
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;

          const name = data.user?.user_metadata?.display_name || email.split('@')[0];
          await loginWithSocial('google', email, name);

          soundManager.play('start');
          setSuccessMsg(`Tekrar hoş geldin, ${name}!`);
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 900);
        }
      } else {
        // Fallback local update
        await loginWithSocial('google', email, customName || email.split('@')[0]);
        soundManager.play('start');
        setSuccessMsg(`Giriş başarılı! Hoş geldin!`);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Giriş işlemi sırasında bir hata oluştu.');
      soundManager.play('tabu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
            {/* Top Logo & Title */}
            <div className="flex flex-col items-center text-center gap-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  DVT TABU BULUT HESABI
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {authMode === 'email' ? (isSignUp ? 'Yeni Hesap Oluştur' : 'E-Posta ile Giriş') : 'Oyuna Giriş Yap'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Skorlarınızı, kazandığınız maçları ve özel destelerinizi güvenle kaydedin.
              </p>
            </div>

            {/* Mode Switch Tabs (Sosyal / E-Posta) */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode('social'); setErrorMessage(null); }}
                className={`py-2 rounded-xl transition-all ${
                  authMode === 'social'
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hızlı Giriş
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('email'); setErrorMessage(null); }}
                className={`py-2 rounded-xl transition-all ${
                  authMode === 'email'
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                E-Posta ile
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: SOCIAL AUTH */}
            {authMode === 'social' && (
              <div className="flex flex-col gap-2.5 pt-1 animate-in fade-in">
                {/* Google Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{loading ? 'Giriş Yapılıyor...' : 'Google ile Devam Et'}</span>
                </button>

                {/* Apple Button (Pixel Perfect Centered SVG) */}
                <button
                  onClick={handleAppleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-slate-950 text-white font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all border border-slate-700 active:scale-98 disabled:opacity-50 shadow-md"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.66 1.38-.56.65-1.06 1.71-.93 2.74 1.05.08 2.07-.52 2.67-1.25z" />
                  </svg>
                  <span>{loading ? 'Giriş Yapılıyor...' : 'Apple ile Devam Et'}</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">veya Misafir Girişi</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* Guest Quick Mode */}
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
                      className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold shrink-0 flex items-center gap-1"
                      title="Rastgele İsim Üret"
                    >
                      <Dices className="w-3.5 h-3.5 text-amber-400" />
                      <span>Zar At</span>
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleGuestContinue}
                    fullWidth
                    className="py-2.5 text-xs font-black shadow-md shadow-indigo-500/20"
                  >
                    Misafir Olarak Başla <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: EMAIL & PASSWORD AUTH */}
            {authMode === 'email' && (
              <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 pt-1 animate-in fade-in">
                {isSignUp && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">Takma Ad / İsim:</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Örn: UstaTabucu"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-8 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                        required={isSignUp}
                      />
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold">E-Posta Adresi:</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-8 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold">Şifre:</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="En az 6 karakter..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-8 pr-8 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={loading}
                  fullWidth
                  className="py-3 text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 mt-1"
                >
                  {loading
                    ? 'İşleniyor...'
                    : isSignUp
                    ? 'Kayıt Ol & Giriş Yap'
                    : 'Giriş Yap'}
                </Button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setErrorMessage(null); }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    {isSignUp ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
