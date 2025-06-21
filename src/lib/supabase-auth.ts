import { supabaseAdmin } from './supabase';

export async function sendMagicLink(email: string, redirectTo: string = '/dashboard') {
  try {
    console.log('📧 Sending magic link via Supabase to:', email);
    
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXTAUTH_URL}${redirectTo}`,
      },
    });

    if (error) {
      console.error('❌ Error generating magic link:', error);
      throw error;
    }

    console.log('✅ Magic link generated successfully');
    console.log('🔗 Magic link URL:', data.properties?.action_link);
    
    return {
      success: true,
      data: data,
      magicLink: data.properties?.action_link,
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