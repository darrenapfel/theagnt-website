import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { auth } from '@/lib/auth-server';

export async function GET() {
  try {
    await headers();
    const session = await auth();
    const cookieStore = await cookies();
    
    // Get email from session or cookie
    let userEmail = session?.user?.email;
    
    if (!userEmail) {
      const emailSession = cookieStore.get('email-session');
      if (emailSession?.value && emailSession.value.includes('@')) {
        userEmail = emailSession.value;
      }
    }
    
    if (!userEmail) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'No session found'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      authenticated: true,
      email: userEmail,
      sessionType: session?.user ? 'oauth' : 'magic-link'
    });
  } catch (error) {
    console.error('Check session error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Internal error'
    }, { status: 500 });
  }
}