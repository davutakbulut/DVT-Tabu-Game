'use client';

import React from 'react';
import { Check, FastForward, AlertOctagon } from 'lucide-react';

interface GameControlsProps {
  onCorrect: () => void;
  onPass: () => void;
  onBuzzer: () => void;
  remainingPasses: number;
  remainingTabus?: number;
  tabuLimit?: number;
  correctCount?: number;
  passCount?: number;
  tabuCount?: number;
  penaltyPoints?: number;
  correctPoints?: number;
  isPresenter?: boolean;
  isRival?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onCorrect,
  onPass,
  onBuzzer,
  remainingPasses,
  remainingTabus = 999,
  tabuLimit = 0,
  correctCount = 0,
  passCount = 0,
  tabuCount = 0,
  penaltyPoints = -1,
  correctPoints = 1,
  isPresenter = true,
  isRival = false,
}) => {
  // If rival player on a separate device: Show giant buzzer button!
  if (isRival) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-4">
        <button
          onClick={onBuzzer}
          className="w-48 h-48 rounded-full btn-3d-rose text-white shadow-2xl flex flex-col items-center justify-center gap-2 select-none"
        >
          <AlertOctagon className="w-16 h-16 animate-pulse" />
          <span className="text-3xl font-black uppercase tracking-wider">BUZZER!</span>
        </button>
        <span className="text-xs font-bold text-slate-400 mt-4 text-center">
          Anlatıcı yasaklı kelime kullanırsa hemen bas! ({penaltyPoints} Ceza)
        </span>
      </div>
    );
  }

  const isPassDisabled = remainingPasses <= 0 && remainingPasses < 99;
  const isTabuDisabled = tabuLimit > 0 && remainingTabus <= 0;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-2 p-1">
      {/* Action Control Buttons with 3D Arcade Tactile Feel */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* 1. Pas Butonu */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black py-0.5 px-2.5 rounded-lg shadow-sm">
            {passCount} Pas
          </div>
          <button
            type="button"
            onClick={onPass}
            disabled={isPassDisabled}
            className={`w-full py-4 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-white disabled:opacity-40 disabled:cursor-not-allowed select-none ${
              isPassDisabled ? 'bg-slate-900 border-b-2 border-slate-950 text-slate-500' : 'btn-3d-amber'
            }`}
          >
            <FastForward className="w-6 h-6 stroke-[2.5]" />
            <span className="text-xs uppercase font-black tracking-wider">Pas</span>
            <span className="text-[10px] font-bold opacity-90">
              {remainingPasses >= 99 ? '∞ Sınırsız' : `${remainingPasses} Hak`}
            </span>
          </button>
        </div>

        {/* 2. Tabu / Cız Butonu */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black py-0.5 px-2.5 rounded-lg shadow-sm">
            {tabuCount} Tabu
          </div>
          <button
            type="button"
            onClick={onBuzzer}
            disabled={isTabuDisabled}
            className={`w-full py-4 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-white disabled:opacity-40 disabled:cursor-not-allowed select-none ${
              isTabuDisabled ? 'bg-slate-900 border-b-2 border-slate-950 text-slate-500' : 'btn-3d-rose'
            }`}
          >
            <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
            <span className="text-xs uppercase font-black tracking-wider">Tabu!</span>
            <span className="text-[10px] font-bold opacity-90">
              {tabuLimit > 0
                ? isTabuDisabled
                  ? 'Limit Doldu'
                  : `${remainingTabus} Hak`
                : penaltyPoints === 0
                ? '0 Puan'
                : `${penaltyPoints} Puan`}
            </span>
          </button>
        </div>

        {/* 3. Doğru Butonu */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black py-0.5 px-2.5 rounded-lg shadow-sm">
            {correctCount} Doğru
          </div>
          <button
            type="button"
            onClick={onCorrect}
            className="w-full py-4 px-2 rounded-xl btn-3d-emerald text-white flex flex-col items-center justify-center gap-0.5 select-none"
          >
            <Check className="w-6 h-6 stroke-[3.5]" />
            <span className="text-xs uppercase font-black tracking-wider">Doğru!</span>
            <span className="text-[10px] font-bold opacity-90">(+{correctPoints} Puan)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
