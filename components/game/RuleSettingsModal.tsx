'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GameSettings } from '@/types/game';
import { CATEGORIES } from '@/lib/constants';
import { Sliders, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

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
  const [settings, setSettings] = useState<GameSettings>(initialSettings);

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
      <div className="flex flex-col gap-5 text-slate-200">
        {/* Tur Süresi (30 - 120s) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              Tur Süresi
            </label>
            <span className="text-sm font-black text-indigo-400">{settings.turn_duration} saniye</span>
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
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>30s (Hızlı)</span>
            <span>60s (Klasik)</span>
            <span>120s (Geniş)</span>
          </div>
        </div>

        {/* Pas Limiti (0 - 5) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Tur Başı Pas Hakkı
            </label>
            <span className="text-sm font-black text-amber-400">{settings.pass_limit} pas</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSettings({ ...settings, pass_limit: num })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  settings.pass_limit === num
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Buzzer / Tabu Cezası */}
        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Yasaklı Kelime / Buzzer Cezası
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[-1, -2, 0].map((penalty) => (
              <button
                key={penalty}
                type="button"
                onClick={() => setSettings({ ...settings, buzzer_penalty: penalty })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  settings.buzzer_penalty === penalty
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                {penalty === 0 ? 'Ceza Yok (0)' : `${penalty} Puan`}
              </button>
            ))}
          </div>
        </div>

        {/* Toplam Tur Sayısı */}
        <div>
          <label className="text-xs font-bold text-slate-300 mb-2 block">
            Toplam Tur Sayısı
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[4, 6, 8, 10].map((rounds) => (
              <button
                key={rounds}
                type="button"
                onClick={() => setSettings({ ...settings, total_rounds: rounds })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  settings.total_rounds === rounds
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                {rounds} Tur
              </button>
            ))}
          </div>
        </div>

        {/* Kategoriler */}
        <div>
          <label className="text-xs font-bold text-slate-300 mb-2 block">
            Kategoriler ({settings.categories.length} Seçili)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => {
              const selected = settings.categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-[11px] font-bold py-1.5 px-3 rounded-full border transition-all ${
                    selected
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 opacity-60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex gap-3">
          <Button variant="ghost" fullWidth onClick={onClose}>
            İptal
          </Button>
          <Button variant="primary" fullWidth onClick={handleSave}>
            Ayarları Uygula
          </Button>
        </div>
      </div>
    </Modal>
  );
};
