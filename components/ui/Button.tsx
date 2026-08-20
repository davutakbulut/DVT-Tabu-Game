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
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 active:scale-[0.98]',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-500/30 active:scale-[0.98]',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 active:scale-[0.98]',
    outline: 'border-2 border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'py-2 px-3.5 text-xs font-semibold rounded-xl min-h-[38px]',
    md: 'py-3 px-5 text-sm font-semibold rounded-2xl min-h-[48px]',
    lg: 'py-4 px-6 text-base font-bold rounded-2xl min-h-[56px]',
    xl: 'py-5 px-8 text-lg font-extrabold rounded-3xl min-h-[64px]',
  };

  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none',
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
