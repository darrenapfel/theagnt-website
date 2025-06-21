import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const token_hash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type');
    const next = url.searchParams.get('next') || '/dashboard';

    console.log('🔗 Auth callback received:', { code, token_hash, type });

    if (code && token_hash && type === 'email') {
      // Exchange the code for a session
      const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/auth/error?error=SessionError', request.url));
      }

      if (data.user && data.session) {
        console.log('✅ User authenticated via magic link:', data.user.email);
        
        // Create a NextAuth session for the user
        // For now, we'll redirect to a success page that handles the session
        const redirectUrl = new URL('/auth/success', request.url);
        redirectUrl.searchParams.set('email', data.user.email || '');
        redirectUrl.searchParams.set('access_token', data.session.access_token);
        redirectUrl.searchParams.set('next', next);
        
        return NextResponse.redirect(redirectUrl);
      }
    }

    // If no valid parameters, redirect to sign-in
    return NextResponse.redirect(new URL('/auth/signin', request.url));

  } catch (error) {
    console.error('❌ Error in auth callback:', error);
    return NextResponse.redirect(new URL('/auth/error?error=CallbackError', request.url));
  }
}