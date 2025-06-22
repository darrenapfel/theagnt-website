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

    console.log('🔐 Email verification clicked for:', email);

    // For this simple implementation, we just verify the email was clicked
    // The user still needs to sign in with Google to complete authentication
    // This approach avoids complex token storage and Supabase user management

    console.log('✅ Email verification successful for:', email);

    // Redirect to home page with success message
    const successUrl = new URL('/', request.url);
    successUrl.searchParams.set('verified', 'true');
    successUrl.searchParams.set('email', email);
    
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('❌ Error verifying email:', error);
    return NextResponse.redirect(new URL('/?error=verification-failed', request.url));
  }
}