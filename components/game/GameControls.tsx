'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Check, FastForward, AlertOctagon } from 'lucide-react';

interface GameControlsProps {
  onCorrect: () => void;
  onPass: () => void;
  onBuzzer: () => void;
  remainingPasses: number;
  isPresenter?: boolean;
  isRival?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onCorrect,
  onPass,
  onBuzzer,
  remainingPasses,
  isPresenter = true,
  isRival = false,
}) => {
  // If rival player on a separate device: Show giant buzzer button!
  if (isRival) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-4">
        <button
          onClick={onBuzzer}
          className="w-44 h-44 rounded-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 active:scale-95 text-white shadow-2xl shadow-red-600/50 border-4 border-red-400/40 flex flex-col items-center justify-center gap-2 select-none transition-transform"
        >
          <AlertOctagon className="w-14 h-14 animate-pulse" />
          <span className="text-2xl font-black uppercase tracking-wider">BUZZER!</span>
        </button>
        <span className="text-xs text-slate-400 mt-4 text-center">
          Anlatıcı yasaklı kelime kullanırsa hemen bas! (-1 Ceza)
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-2.5 sm:gap-3 p-2">
      {/* Pas Butonu */}
      <Button
        variant="warning"
        size="lg"
        onClick={onPass}
        disabled={remainingPasses <= 0}
        className="flex flex-col items-center justify-center py-3.5 px-2 relative"
      >
        <FastForward className="w-6 h-6 mb-1" />
        <span className="text-xs uppercase font-extrabold">Pas</span>
        <span className="text-[10px] opacity-80 mt-0.5">({remainingPasses} Hak)</span>
      </Button>

      {/* Buzzer / Tabu Butonu */}
      <Button
        variant="danger"
        size="lg"
        onClick={onBuzzer}
        className="flex flex-col items-center justify-center py-3.5 px-2"
      >
        <AlertOctagon className="w-6 h-6 mb-1" />
        <span className="text-xs uppercase font-extrabold">Tabu / Cız</span>
        <span className="text-[10px] opacity-80 mt-0.5">(-1 Puan)</span>
      </Button>

      {/* Doğru Butonu */}
      <Button
        variant="success"
        size="lg"
        onClick={onCorrect}
        className="flex flex-col items-center justify-center py-3.5 px-2 shadow-emerald-500/30"
      >
        <Check className="w-7 h-7 mb-0.5 stroke-[3]" />
        <span className="text-xs uppercase font-extrabold">Doğru</span>
        <span className="text-[10px] opacity-80 mt-0.5">(+1 Puan)</span>
      </Button>
    </div>
  );
};
