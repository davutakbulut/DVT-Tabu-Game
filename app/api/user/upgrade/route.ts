import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guestId, provider, email, displayName, avatarUrl } = body;

    if (!guestId) {
      return NextResponse.json({ error: 'guestId is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      // 1. Check existing guest profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', guestId)
        .single();

      // 2. Upgrade the profile record in-place to the new social identity
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: guestId,
          display_name: displayName || existingProfile?.display_name || 'Tabucu',
          email: email || existingProfile?.email,
          avatar_url: avatarUrl || existingProfile?.avatar_url,
          provider: provider || 'google',
          is_pro: existingProfile?.is_pro || false,
          last_login_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // 3. Fetch latest combined settings & stats
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', guestId)
        .single();

      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', guestId)
        .single();

      return NextResponse.json({
        success: true,
        message: 'Hesap başarıyla birleştirildi ve buluta bağlandı',
        profile: updatedProfile,
        settings,
        stats,
      });
    }

    return NextResponse.json({ success: true, localOnly: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
