'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Clock } from 'lucide-react';

interface TimerProps {
  timeRemaining: number;
  totalDuration: number;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, totalDuration }) => {
  const percentage = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
  const isCritical = timeRemaining <= 10;
  const isUrgent = timeRemaining <= 5;

  return (
    <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800/80 py-2 px-4 rounded-2xl shadow-lg backdrop-blur-md">
      <Clock
        className={clsx(
          'w-5 h-5 transition-colors',
          isUrgent ? 'text-red-500 animate-bounce' : isCritical ? 'text-amber-400 animate-pulse' : 'text-indigo-400'
        )}
      />
      <div className="flex flex-col">
        <span
          className={clsx(
            'text-2xl font-black font-mono tracking-tight leading-none',
            isUrgent ? 'text-red-500 animate-pulse' : isCritical ? 'text-amber-400' : 'text-slate-100'
          )}
        >
          {timeRemaining}s
        </span>
      </div>
      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden ml-1">
        <div
          className={clsx(
            'h-full transition-all duration-300 rounded-full',
            isUrgent ? 'bg-red-500' : isCritical ? 'bg-amber-400' : 'bg-indigo-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
