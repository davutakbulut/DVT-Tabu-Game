import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'blue', className }) => {
  const variants = {
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    red: 'bg-red-500/15 text-red-400 border border-red-500/20',
    gray: 'bg-slate-700/50 text-slate-300 border border-slate-600/30',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full', variants[variant], className)}>
      {children}
    </span>
  );
};
