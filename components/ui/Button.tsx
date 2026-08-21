'use client';

import React from 'react';
import { clsx } from 'clsx';
import { triggerHaptic } from '@/lib/haptics';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic('click');
    if (onClick) onClick(e);
  };

  const variants = {
    primary: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 border-b-2 border-amber-700 active:scale-[0.98]',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 active:scale-[0.98] shadow-md',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 border-b-2 border-emerald-800 active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 border-b-2 border-rose-900 active:scale-[0.98]',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25 border-b-2 border-amber-800 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-850 text-slate-300 active:scale-[0.98]',
    outline: 'border-2 border-amber-500/50 hover:bg-amber-500/10 text-amber-400 font-bold active:scale-[0.98]',
  };

  const sizes = {
    sm: 'py-2 px-3.5 text-xs font-semibold rounded-lg min-h-[36px]',
    md: 'py-2.5 px-4.5 text-sm font-bold rounded-xl min-h-[44px]',
    lg: 'py-3.5 px-6 text-base font-black rounded-xl min-h-[52px]',
    xl: 'py-4.5 px-8 text-lg font-black rounded-2xl min-h-[60px]',
  };

  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none tracking-wide',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
