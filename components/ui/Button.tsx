'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { triggerHaptic } from '@/lib/haptics';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 active:scale-[0.98]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 active:scale-[0.98] shadow-sm',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black shadow-md shadow-emerald-500/20 active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black shadow-md shadow-rose-600/25 active:scale-[0.98]',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 active:scale-[0.98]',
    outline: 'border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold active:scale-[0.98]',
  };

  const sizes = {
    sm: 'py-2 px-3.5 text-xs font-bold rounded-lg min-h-[36px]',
    md: 'py-2.5 px-4.5 text-sm font-bold rounded-xl min-h-[44px]',
    lg: 'py-3.5 px-6 text-base font-black rounded-xl min-h-[50px]',
    xl: 'py-4 px-8 text-lg font-black rounded-2xl min-h-[56px]',
  };

  return (
    <button
      className={cn(
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
