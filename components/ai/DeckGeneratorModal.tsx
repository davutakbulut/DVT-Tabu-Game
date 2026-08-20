'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/types/game';
import { Sparkles, Wand2, Plus, Check } from 'lucide-react';

interface DeckGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCards: (cards: Card[]) => void;
}

export const DeckGeneratorModal: React.FC<DeckGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddCards,
}) => {
  const [theme, setTheme] = useState('');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Card[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;

    setLoading(true);
    setSuccessMessage('');
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate_deck',
          context: { theme, count },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.cards) {
          const formatted = json.cards.map((c: any, idx: number) => ({
            id: `ai-deck-${Date.now()}-${idx}`,
            main_word: c.main_word,
            forbidden_words: c.forbidden_words,
            category: c.category || theme,
            difficulty: c.difficulty || 'Orta',
            language: 'tr'
          }));
          setGeneratedCards(formatted);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToGame = () => {
    if (generatedCards.length > 0) {
      onAddCards(generatedCards);
      setSuccessMessage(`${generatedCards.length} adet yapay zeka kartı oyuna eklendi!`);
      setTimeout(() => {
        onClose();
        setGeneratedCards([]);
        setSuccessMessage('');
        setTheme('');
      }, 1200);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gemini ile Özel Deste Üret">
      <div className="flex flex-col gap-4 text-slate-200">
        <form onSubmit={handleGenerate} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Tema veya Konu Başlığı
            </label>
            <input
              type="text"
              placeholder="Örn: 90lar Türk Popu, Game of Thrones, Yazılımcı Terimleri..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Kart Sayısı:</span>
            <div className="flex gap-2">
              {[3, 5, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    count === num
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {num} Kart
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" size="md" type="submit" disabled={loading || !theme.trim()}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 animate-spin" /> Gemini Kartları Yazıyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" /> Yapay Zeka ile Kartları Üret
              </span>
            )}
          </Button>
        </form>

        {/* Generated Cards Preview */}
        {generatedCards.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-2 max-h-56 overflow-y-auto pr-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Üretilen Kartlar ({generatedCards.length}):
            </span>
            {generatedCards.map((c, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-black text-indigo-400 text-sm mb-1">{c.main_word}</div>
                <div className="text-slate-400 flex flex-wrap gap-1">
                  {c.forbidden_words.map((w, idx) => (
                    <span key={idx} className="bg-red-500/10 text-red-300 px-1.5 py-0.5 rounded text-[10px]">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <Button variant="success" size="md" onClick={handleApplyToGame} className="mt-2">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Kartları Desteme ve Oyuna Ekle
              </span>
            </Button>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
            {successMessage}
          </div>
        )}
      </div>
    </Modal>
  );
};
