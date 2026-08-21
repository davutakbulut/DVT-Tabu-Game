'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GameSettings } from '@/types/game';
import { CATEGORIES } from '@/lib/constants';
import { Clock, RotateCcw, AlertOctagon, AlertTriangle, CheckCircle2, Trophy, Layers } from 'lucide-react';

interface RuleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
}

export const RuleSettingsModal: React.FC<RuleSettingsModalProps> = ({
  isOpen,
  onClose,
  initialSettings,
  onSave,
}) => {
  const [settings, setSettings] = useState<GameSettings>({
    ...initialSettings,
    tabu_limit: initialSettings.tabu_limit !== undefined ? initialSettings.tabu_limit : 0,
  });

  const toggleCategory = (cat: string) => {
    setSettings((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        if (prev.categories.length <= 1) return prev; // Keep at least 1
        return { ...prev, categories: prev.categories.filter((c) => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Oyun Kurallarını Özelleştir">
      <div className="flex flex-col text-slate-200">
        {/* Scrollable Content */}
        <div className="flex flex-col gap-5 max-h-[58vh] overflow-y-auto pr-1 pb-2">
          {/* 1. Tur Süresi (30 - 120s) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                Tur Süresi
              </label>
              <span className="text-sm font-black text-indigo-400 font-mono">{settings.turn_duration} saniye</span>
            </div>
            <input
              type="range"
              min={30}
              max={120}
              step={10}
              value={settings.turn_duration}
              onChange={(e) => setSettings({ ...settings, turn_duration: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
              <span>30s (Hızlı)</span>
              <span>60s (Klasik)</span>
              <span>120s (Geniş)</span>
            </div>
          </div>

          {/* 2. Pas Hakkı (0, 1, 2, 3, 4, 5, Sınırsız) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Tur Başı Pas Hakkı
              </label>
              <span className="text-sm font-black text-amber-400 font-mono">
                {settings.pass_limit >= 99 ? 'Sınırsız (∞)' : `${settings.pass_limit} pas`}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[0, 1, 2, 3, 4, 5, 999].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSettings({ ...settings, pass_limit: num })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    settings.pass_limit === num
                      ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {num === 999 ? '∞' : num}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tabu Hakkı (Sınırsız, 1, 2, 3, 5) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                Tur Başı Tabu / Ceza Hakkı
              </label>
              <span className="text-sm font-black text-red-400 font-mono">
                {settings.tabu_limit === 0 ? 'Sınırsız (∞)' : `${settings.tabu_limit} tabu`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 0, label: '∞ Sınırsız' },
                { val: 1, label: '1 Tabu' },
                { val: 2, label: '2 Tabu' },
                { val: 3, label: '3 Tabu' },
                { val: 5, label: '5 Tabu' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setSettings({ ...settings, tabu_limit: opt.val })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    settings.tabu_limit === opt.val
                      ? 'bg-red-500/25 border-red-500 text-red-300 shadow-md shadow-red-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Yasaklı Kelime / Buzzer Cezası */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Yasaklı Kelime Cezası
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[-1, -2, 0].map((penalty) => (
                <button
                  key={penalty}
                  type="button"
                  onClick={() => setSettings({ ...settings, buzzer_penalty: penalty })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    settings.buzzer_penalty === penalty
                      ? 'bg-orange-500/25 border-orange-500 text-orange-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {penalty === 0 ? 'Ceza Yok (0)' : `${penalty} Puan`}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Doğru Başı Puan */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Doğru Başı Puan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setSettings({ ...settings, correct_points: pts })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    settings.correct_points === pts
                      ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  +{pts} Puan
                </button>
              ))}
            </div>
          </div>

          {/* 6. Toplam Tur Sayısı */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              Toplam Tur Sayısı
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[4, 6, 8, 10, 12].map((rounds) => (
                <button
                  key={rounds}
                  type="button"
                  onClick={() => setSettings({ ...settings, total_rounds: rounds })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    settings.total_rounds === rounds
                      ? 'bg-indigo-500/25 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {rounds} Tur
                </button>
              ))}
            </div>
          </div>

          {/* 7. Kategoriler */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Kategoriler ({settings.categories.length} Seçili)
              </label>
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    categories:
                      settings.categories.length === CATEGORIES.length ? [CATEGORIES[0]] : [...CATEGORIES],
                  })
                }
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
              >
                {settings.categories.length === CATEGORIES.length ? 'Temizle' : 'Tümünü Seç'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const selected = settings.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-[11px] font-bold py-1.5 px-3 rounded-full border transition-all ${
                      selected
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Clean & Perfectly Aligned) */}
        <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onClose}
            className="text-xs font-bold py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
          >
            İptal
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSave}
            className="text-xs font-extrabold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500"
          >
            Ayarları Uygula
          </Button>
        </div>
      </div>
    </Modal>
  );
};
