import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

// Safari-specific endpoint that works with email-session cookie
export async function GET(request: NextRequest) {
  try {
    await headers();
    const cookieStore = await cookies();
    
    // Get email from URL parameter (passed by client)
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get('email');
    
    // Verify against cookie
    const emailSession = cookieStore.get('email-session');
    
    if (!clientEmail || !emailSession?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Security check: client email must match cookie
    if (clientEmail !== emailSession.value) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .eq('user_id', clientEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase GET error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      isOnWaitlist: !!data,
      waitlistEntry: data,
    });
  } catch (error) {
    console.error('Safari waitlist GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await headers();
    const cookieStore = await cookies();
    
    // Get email from request body
    const body = await request.json();
    const clientEmail = body.email;
    
    // Verify against cookie
    const emailSession = cookieStore.get('email-session');
    
    if (!clientEmail || !emailSession?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Security check: client email must match cookie
    if (clientEmail !== emailSession.value) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert({
        user_id: clientEmail,
        metadata: {
          joined_from: 'dashboard',
          user_agent: request.headers.get('user-agent'),
          email: clientEmail,
          name: clientEmail.split('@')[0],
          auth_method: 'magic-link-safari'
        },
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already on waitlist' }, { status: 409 });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      waitlistEntry: data,
    });
  } catch (error) {
    console.error('Safari waitlist POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}