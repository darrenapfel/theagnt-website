import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { auth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    await headers(); // Ensure headers are awaited
    const session = await auth();
    const cookieStore = await cookies();

    console.log('GET /api/waitlist - session:', session);
    console.log('GET /api/waitlist - cookies:', cookieStore.getAll().map(c => c.name));

    // Check for session - handle Safari cookie issues
    let userId = session?.user?.id || session?.user?.email;
    
    // Fallback to email-session cookie (Safari workaround)
    if (!userId) {
      const emailSession = cookieStore.get('email-session');
      if (emailSession?.value && emailSession.value.includes('@')) {
        userId = emailSession.value;
        console.log('Using email-session cookie (Safari fallback):', userId);
      }
    }
    
    if (!userId) {
      console.error('No user ID or email in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Checking waitlist for user:', userId);
    
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .eq('user_id', userId)
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
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await headers(); // Ensure headers are awaited
    const session = await auth();
    const cookieStore = await cookies();

    console.log('POST /api/waitlist - session:', session);
    console.log('POST /api/waitlist - cookies:', cookieStore.getAll().map(c => c.name));

    // Check for session - handle Safari cookie issues
    let userId = session?.user?.id || session?.user?.email;
    
    // Fallback to email-session cookie (Safari workaround)
    if (!userId) {
      const emailSession = cookieStore.get('email-session');
      if (emailSession?.value && emailSession.value.includes('@')) {
        userId = emailSession.value;
        console.log('Using email-session cookie (Safari fallback):', userId);
      }
    }
    
    if (!userId) {
      console.error('No user ID or email in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Adding user to waitlist:', userId);
    
    // Determine user details for metadata
    const userEmail = session?.user?.email || userId;
    const userName = session?.user?.name || userEmail?.split('@')[0] || 'Unknown';
    
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert({
        user_id: userId,
        metadata: {
          joined_from: 'dashboard',
          user_agent: request.headers.get('user-agent'),
          email: userEmail,
          name: userName,
          auth_method: session?.user ? 'oauth' : 'magic-link'
        },
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already on waitlist' },
          { status: 409 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      waitlistEntry: data,
    });
  } catch (error) {
    console.error('Waitlist POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
