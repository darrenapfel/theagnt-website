import { supabaseAdmin } from './supabase';

export async function sendMagicLink(email: string, redirectTo: string = '/dashboard') {
  try {
    console.log('📧 Sending magic link via Supabase to:', email);
    
    // Use production URL for all redirects
    const baseUrl = 'https://theagnt-website-6k9egwodc-darrens-projects-0443eb48.vercel.app';
    
    // Use Supabase's built-in magic link system (completely free, no restrictions)
    const { data, error } = await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${baseUrl}${redirectTo}`,
      },
    });

    if (error) {
      console.error('❌ Error sending magic link:', error);
      
      // Handle rate limiting with user-friendly message
      if (error.message?.includes('Email rate limit exceeded') || 
          error.message?.includes('rate_limit_exceeded') ||
          error.message?.includes('too_many_requests')) {
        throw new Error('Please wait 60 seconds before requesting another magic link');
      }
      
      // Handle other common errors
      if (error.message?.includes('invalid_email')) {
        throw new Error('Please enter a valid email address');
      }
      
      throw error;
    }

    console.log('✅ Magic link sent successfully via Supabase');
    
    return {
      success: true,
      data: data,
      message: 'Magic link sent successfully',
    };
  } catch (error) {
    console.error('❌ Failed to send magic link:', error);
    return {
      success: false,
      error: error,
    };
  }
}

export async function verifyOTP(email: string, token: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email',
    });

    if (error) {
      console.error('❌ Error verifying OTP:', error);
      throw error;
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('❌ Failed to verify OTP:', error);
    return {
      success: false,
      error: error,
    };
  }
}