'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { History, Sparkles, Wrench, Zap, Calendar, CheckCircle2 } from 'lucide-react';

interface ChangeItem {
  type: 'feat' | 'fix' | 'perf';
  text: string;
}

interface AppVersion {
  id?: string;
  version: string;
  title: string;
  release_date?: string;
  is_mandatory?: boolean;
  changes: ChangeItem[];
}

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/versions')
      .then((res) => res.json())
      .then((data) => {
        if (data.versions) setVersions(data.versions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const getBadge = (type: string) => {
    switch (type) {
      case 'feat':
        return (
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Yeni Özellik
          </span>
        );
      case 'fix':
        return (
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Wrench className="w-3 h-3" /> Düzeltme
          </span>
        );
      case 'perf':
        return (
          <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Zap className="w-3 h-3" /> Performans
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sürüm Güncelleme Geçmişi">
      <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1 text-slate-200">
        {loading && versions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Sürüm geçmişi veritabanından getiriliyor...
          </div>
        ) : (
          versions.map((ver, idx) => (
            <div
              key={ver.version}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2.5 relative shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-500/30">
                      {ver.version}
                    </span>
                    {idx === 0 && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        En Güncel
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1.5">{ver.title}</h4>
                </div>

                {ver.release_date && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(ver.release_date).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>

              {/* Changelog Bullets */}
              <ul className="flex flex-col gap-2 text-xs text-slate-300">
                {ver.changes &&
                  ver.changes.map((item, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">{getBadge(item.type)}</div>
                      <span className="leading-snug">{item.text}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
