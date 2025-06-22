import { supabaseAdmin } from './supabase';

export async function sendMagicLink(email: string, redirectTo: string = '/dashboard') {
  try {
    console.log('📧 Generating magic link and sending via Resend to:', email);
    
    // Generate the magic link without sending via Supabase
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXTAUTH_URL}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      console.error('❌ Error generating magic link:', error);
      throw error;
    }

    const magicLink = data.properties?.action_link;
    if (!magicLink) {
      throw new Error('No magic link generated');
    }

    console.log('✅ Magic link generated, now sending via Resend');

    // Send email directly via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `TheAGNT <${process.env.EMAIL_FROM || 'noreply@theagnt.ai'}>`,
        to: [email],
        subject: 'Sign in to theAGNT.ai',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Sign in to theAGNT.ai</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Click the button below to sign in to your account:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" 
                 style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Sign In
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${magicLink}" style="color: #000;">${magicLink}</a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error('❌ Resend API error:', resendError);
      throw new Error(`Resend API error: ${resendError}`);
    }

    const resendData = await resendResponse.json();
    console.log('✅ Email sent successfully via Resend:', resendData.id);
    
    return {
      success: true,
      data: data,
      magicLink: magicLink,
      emailId: resendData.id,
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