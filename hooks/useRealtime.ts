'use client';

import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface UseRealtimeOptions {
  roomCode?: string;
  onEvent?: (event: string, payload: any) => void;
}

export const useRealtime = ({ roomCode, onEvent }: UseRealtimeOptions) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!roomCode || !isSupabaseConfigured()) return;

    const channelName = `room:${roomCode}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: '*' }, (message) => {
        if (onEvent) {
          onEvent(message.event, message.payload);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomCode, onEvent]);

  const broadcastEvent = (event: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  };

  return { broadcastEvent };
};
