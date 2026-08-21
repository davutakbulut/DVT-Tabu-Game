'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Check, FastForward, AlertOctagon } from 'lucide-react';

interface GameControlsProps {
  onCorrect: () => void;
  onPass: () => void;
  onBuzzer: () => void;
  remainingPasses: number;
  correctCount?: number;
  passCount?: number;
  tabuCount?: number;
  isPresenter?: boolean;
  isRival?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onCorrect,
  onPass,
  onBuzzer,
  remainingPasses,
  correctCount = 0,
  passCount = 0,
  tabuCount = 0,
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
    <div className="w-full max-w-sm mx-auto flex flex-col gap-2 p-1">
      {/* Action Control Buttons with Counter Badges */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* 1. Pas Butonu */}
        <div className="flex flex-col items-center gap-1">
          <div className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black py-0.5 px-2 rounded-full">
            {passCount} Pas
          </div>
          <Button
            variant="warning"
            size="lg"
            fullWidth
            onClick={onPass}
            disabled={remainingPasses <= 0}
            className="flex flex-col items-center justify-center py-3.5 px-1 relative shadow-amber-500/20"
          >
            <FastForward className="w-6 h-6 mb-0.5" />
            <span className="text-xs uppercase font-extrabold">Pas</span>
            <span className="text-[10px] opacity-80">({remainingPasses} Hak)</span>
          </Button>
        </div>

        {/* 2. Tabu / Cız Butonu */}
        <div className="flex flex-col items-center gap-1">
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-black py-0.5 px-2 rounded-full">
            {tabuCount} Tabu
          </div>
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={onBuzzer}
            className="flex flex-col items-center justify-center py-3.5 px-1 shadow-red-500/25"
          >
            <AlertOctagon className="w-6 h-6 mb-0.5" />
            <span className="text-xs uppercase font-extrabold">Tabu</span>
            <span className="text-[10px] opacity-80">(-1 Puan)</span>
          </Button>
        </div>

        {/* 3. Doğru Butonu */}
        <div className="flex flex-col items-center gap-1">
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black py-0.5 px-2 rounded-full">
            {correctCount} Doğru
          </div>
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={onCorrect}
            className="flex flex-col items-center justify-center py-3.5 px-1 shadow-emerald-500/30"
          >
            <Check className="w-6 h-6 mb-0.5 stroke-[3]" />
            <span className="text-xs uppercase font-extrabold">Doğru</span>
            <span className="text-[10px] opacity-80">(+1 Puan)</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
