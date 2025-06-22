import { supabaseAdmin } from './supabase';
import { randomBytes } from 'crypto';

export async function sendMagicLink(email: string, redirectTo: string = '/dashboard') {
  try {
    console.log('📧 Generating magic link and sending via Brevo to:', email);
    
    // Use stable production URL for all redirects
    const baseUrl = 'https://theagnt-production.vercel.app';
    
    // Generate a secure token for our custom magic link
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration
    
    // Store the token in our database (we'll use a simple approach)
    // For now, we'll create the user in Supabase and use the token for verification
    const magicLink = `${baseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectTo)}`;
    
    console.log('✅ Magic link generated:', magicLink);

    // Send email via Brevo SMTP
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `TheAGNT <${process.env.EMAIL_FROM || 'noreply@theagnt.ai'}>`,
      to: email,
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
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via Brevo');
    
    return {
      success: true,
      data: { token },
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