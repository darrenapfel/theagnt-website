import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    await headers(); // Ensure headers are awaited
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Checking waitlist for user:', session.user.id);
    
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .eq('user_id', session.user.id)
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Adding user to waitlist:', session.user.id);
    
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert({
        user_id: session.user.id,
        metadata: {
          joined_from: 'dashboard',
          user_agent: request.headers.get('user-agent'),
          email: session.user.email,
          name: session.user.name,
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
