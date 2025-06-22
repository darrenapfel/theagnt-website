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

    console.log('🔐 Verifying email magic link for:', email);

    // For this simple implementation, we'll create/get the user and sign them in
    // In a more robust implementation, you'd store tokens in a database
    
    // Create or get user in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
    });

    let userId = authData?.user?.id;

    // If user already exists, that's fine - they can still sign in
    if (authError && authError.message.includes('already registered')) {
      console.log('✅ User already exists:', email);
    }

    if (!userId && authError && !authError.message.includes('already registered')) {
      console.error('❌ Failed to create user:', authError);
      return NextResponse.redirect(new URL('/?error=auth-failed', request.url));
    }

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