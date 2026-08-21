'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '@/lib/audio';

interface UseTimerOptions {
  duration: number;
  isRunning: boolean;
  onTick?: (remaining: number) => void;
  onTimeout?: () => void;
}

export const useTimer = ({ duration, isRunning, onTick, onTimeout }: UseTimerOptions) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(duration);
  const onTimeoutRef = useRef(onTimeout);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    onTickRef.current = onTick;
  });

  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            if (onTimeoutRef.current) {
              onTimeoutRef.current();
            }
          }, 0);
          return 0;
        }

        const next = prev - 1;
        setTimeout(() => {
          if (onTickRef.current) {
            onTickRef.current(next);
          }
        }, 0);

        // Ticking audio in last 10 seconds
        if (next <= 10 && next > 0) {
          soundManager.playTick();
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const resetTimer = useCallback((newDuration?: number) => {
    setTimeRemaining(newDuration ?? duration);
  }, [duration]);

  return { timeRemaining, resetTimer };
};
