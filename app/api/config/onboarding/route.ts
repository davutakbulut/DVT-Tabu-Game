import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEFAULT_ONBOARDING_STEPS, OnboardingStepItem } from '@/types/onboarding';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .eq('id', 'onboarding_flow')
        .single();

      if (!error && data?.data?.steps && data.data.steps.length > 0) {
        return NextResponse.json({
          steps: data.data.steps,
          updated_at: data.updated_at,
        });
      }
    } catch {}
  }

  return NextResponse.json({
    steps: DEFAULT_ONBOARDING_STEPS,
    updated_at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const steps: OnboardingStepItem[] = body.steps || [];

    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json({ error: 'En az 1 adet adım gereklidir' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('app_config')
        .upsert({
          id: 'onboarding_flow',
          category: 'experience',
          data: { steps },
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, steps: data[0].data.steps });
    }

    return NextResponse.json({ success: true, steps, fallback: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
