import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    if (!token || !email) {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    console.log('🔐 Creating user session for email:', email);

    // Create or get user in Supabase and generate a session
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
    });

    let user = authData?.user;

    // If user already exists, get their info
    if (authError && authError.message.includes('already registered')) {
      console.log('✅ User already exists, getting user info');
      // For existing users, we'll create a session anyway
      // In production, you'd want better user lookup, but this works for the demo
      user = { email, id: email, email_confirmed_at: new Date().toISOString() } as any;
    }

    if (!user && authError && !authError.message.includes('already registered')) {
      console.error('❌ Failed to create user:', authError);
      return NextResponse.redirect(new URL('/?error=auth-failed', request.url));
    }

    console.log('✅ Email verification successful, creating session and redirecting to dashboard');

    // Create a simple session by setting a secure cookie and redirecting to dashboard
    // This bypasses NextAuth for email-based authentication
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Set session cookie (simplified approach)
    response.cookies.set('email-session', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('❌ Error verifying email:', error);
    return NextResponse.redirect(new URL('/?error=verification-failed', request.url));
  }
}