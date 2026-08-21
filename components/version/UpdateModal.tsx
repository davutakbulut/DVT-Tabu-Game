'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, AlertTriangle, ArrowUpCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { versionService, VersionCheckResult } from '@/lib/versionService';

interface UpdateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  updateInfo: VersionCheckResult;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, updateInfo }) => {
  const [updating, setUpdating] = useState(false);

  if (!isOpen) return null;

  const handleApplyUpdate = async () => {
    setUpdating(true);
    await versionService.applyUpdate();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!updateInfo.isMandatory ? onClose : undefined}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/70 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden"
        >
          {/* Top Glow & Badge */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-2xl ${
                updateInfo.isMandatory
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {updateInfo.isMandatory ? <AlertTriangle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">
                  {updateInfo.isMandatory ? 'Kritik Zorunlu Güncelleme' : 'Yeni Sürüm Yayında!'}
                </span>
                <h3 className="text-lg font-black text-white">
                  v{updateInfo.latestVersion}
                </h3>
              </div>
            </div>

            {!updateInfo.isMandatory && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Release Title & Current Version Comparison */}
          <div className="my-3">
            <div className="flex items-center justify-between text-xs bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 mb-3">
              <span className="text-slate-400">
                Mevcut: <strong className="text-slate-300">v{updateInfo.currentVersion}</strong>
              </span>
              <span className="text-indigo-400 font-bold flex items-center gap-1">
                 Yeni: <strong className="text-white">v{updateInfo.latestVersion}</strong>
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {updateInfo.releaseName || 'Yenilikler ve İyileştirmeler:'}
            </h4>

            {/* Release Notes List */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2">
              {updateInfo.releaseNotes && updateInfo.releaseNotes.length > 0 ? (
                updateInfo.releaseNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Performans iyileştirmeleri ve hata düzeltmeleri yapıldı.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 mt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleApplyUpdate}
              disabled={updating}
              className="py-3.5 font-black text-sm shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
              {updating ? 'Önbellek Temizleniyor & Güncelleniyor...' : 'Hemen Güncelle ve Yenile'}
            </Button>

            {!updateInfo.isMandatory && onClose && (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 text-xs py-2"
              >
                Daha Sonra Hatırlat
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
