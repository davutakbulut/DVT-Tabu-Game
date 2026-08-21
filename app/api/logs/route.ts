import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// In-memory fallback if Supabase is temporarily unreachable
let memoryLogs: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, source, message, stack_trace, page_url, session_id, user_id, user_agent, metadata } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const logEntry = {
      level: level || 'error',
      source: source || 'client',
      message: String(message).slice(0, 1000),
      stack_trace: stack_trace ? String(stack_trace).slice(0, 5000) : null,
      page_url: page_url ? String(page_url).slice(0, 500) : null,
      session_id: session_id ? String(session_id).slice(0, 100) : null,
      user_id: user_id ? String(user_id).slice(0, 100) : null,
      user_agent: user_agent ? String(user_agent).slice(0, 500) : null,
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
      is_resolved: false,
      created_at: new Date().toISOString(),
    };

    // 1. Try writing to Supabase
    if (supabase) {
      const { data, error } = await supabase.from('system_error_logs').insert([logEntry]).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, log: data });
      }
    }

    // 2. Fallback to memory buffer
    const fallbackEntry = { id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`, ...logEntry };
    memoryLogs.unshift(fallbackEntry);
    if (memoryLogs.length > 200) memoryLogs.pop();

    return NextResponse.json({ success: true, log: fallbackEntry, fallback: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Log recording failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const source = searchParams.get('source');
    const status = searchParams.get('status'); // 'open' | 'resolved' | 'all'
    const search = searchParams.get('search');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));

    if (supabase) {
      let query = supabase
        .from('system_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (level && level !== 'all') query = query.eq('level', level);
      if (source && source !== 'all') query = query.eq('source', source);
      if (status === 'open') query = query.eq('is_resolved', false);
      if (status === 'resolved') query = query.eq('is_resolved', true);
      if (search) query = query.ilike('message', `%${search}%`);

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ logs: data, count: data.length });
      }
    }

    // Fallback to memory
    let filtered = [...memoryLogs];
    if (level && level !== 'all') filtered = filtered.filter((l) => l.level === level);
    if (source && source !== 'all') filtered = filtered.filter((l) => l.source === source);
    if (status === 'open') filtered = filtered.filter((l) => !l.is_resolved);
    if (status === 'resolved') filtered = filtered.filter((l) => l.is_resolved);
    if (search) filtered = filtered.filter((l) => l.message.toLowerCase().includes(search.toLowerCase()));

    return NextResponse.json({ logs: filtered.slice(0, limit), count: filtered.length, fallback: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_resolved } = body;

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    if (supabase && !id.startsWith('mem_')) {
      const { data, error } = await supabase
        .from('system_error_logs')
        .update({
          is_resolved: is_resolved !== false,
          resolved_at: is_resolved !== false ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, log: data });
      }
    }

    // Memory update
    memoryLogs = memoryLogs.map((l) =>
      l.id === id
        ? {
            ...l,
            is_resolved: is_resolved !== false,
            resolved_at: is_resolved !== false ? new Date().toISOString() : null,
          }
        : l
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'clear_resolved'; // 'clear_resolved' | 'clear_all'

    if (supabase) {
      if (action === 'clear_resolved') {
        await supabase.from('system_error_logs').delete().eq('is_resolved', true);
      } else if (action === 'clear_all') {
        await supabase.from('system_error_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    if (action === 'clear_resolved') {
      memoryLogs = memoryLogs.filter((l) => !l.is_resolved);
    } else {
      memoryLogs = [];
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
