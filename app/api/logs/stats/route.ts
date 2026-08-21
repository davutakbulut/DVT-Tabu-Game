import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let logs: any[] = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('system_error_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        logs = data;
      }
    }

    const totalLogs = logs.length;
    const unresolvedCount = logs.filter((l) => !l.is_resolved).length;
    const resolvedCount = logs.filter((l) => l.is_resolved).length;
    const fatalCount = logs.filter((l) => l.level === 'fatal' && !l.is_resolved).length;
    const errorCount = logs.filter((l) => l.level === 'error' && !l.is_resolved).length;
    const warnCount = logs.filter((l) => l.level === 'warn' && !l.is_resolved).length;

    const sourceBreakdown: Record<string, number> = {};
    const pageBreakdown: Record<string, number> = {};

    logs.forEach((log) => {
      const src = log.source || 'client';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;

      const page = log.page_url || '/';
      pageBreakdown[page] = (pageBreakdown[page] || 0) + 1;
    });

    const resolutionRate = totalLogs > 0 ? Math.round((resolvedCount / totalLogs) * 100) : 100;

    return NextResponse.json({
      summary: {
        total: totalLogs,
        unresolved: unresolvedCount,
        resolved: resolvedCount,
        fatal: fatalCount,
        error: errorCount,
        warn: warnCount,
        resolutionRate,
      },
      sourceBreakdown,
      pageBreakdown: Object.entries(pageBreakdown)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
