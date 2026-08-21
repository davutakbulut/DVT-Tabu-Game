'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { VersionCheckResult } from '@/lib/versionService';

interface VersionBannerProps {
  updateInfo: VersionCheckResult;
  onOpenDetails: () => void;
  onDismiss: () => void;
}

export const VersionBanner: React.FC<VersionBannerProps> = ({
  updateInfo,
  onOpenDetails,
  onDismiss,
}) => {
  if (!updateInfo.hasUpdate || updateInfo.isMandatory) return null;

  return (
    <motion.aside
      aria-label="Sürüm Güncelleme Bildirimi"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-2 inset-x-3 max-w-lg mx-auto z-40 bg-gradient-to-r from-indigo-900/95 to-purple-900/95 border border-indigo-500/50 backdrop-blur-md rounded-2xl p-2.5 shadow-xl flex items-center justify-between gap-2 text-xs"
    >
      <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={onOpenDetails}>
        <div className="p-1 rounded-lg bg-indigo-500/20 text-amber-300 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="truncate">
          <span className="font-bold text-white block truncate">
            Yeni Sürüm Yayında (v{updateInfo.latestVersion})
          </span>
          <span className="text-[10px] text-indigo-200 truncate block">
            Yenilikleri keşfetmek ve güncellemek için dokunun
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenDetails}
          className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] shadow-sm transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Güncelle
        </button>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800/40 transition-colors"
          title="Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.aside>
  );
};
