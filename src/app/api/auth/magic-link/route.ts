import { NextRequest, NextResponse } from 'next/server';
import { sendMagicLink } from '@/lib/supabase-auth';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
  redirectTo: z.string().optional().default('/dashboard'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, redirectTo } = emailSchema.parse(body);

    console.log('📧 Magic link request for:', email);

    const result = await sendMagicLink(email, redirectTo);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send magic link', details: result.error },
        { status: 500 }
      );
    }

    // Supabase handles email sending automatically, no magic link to return

    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully',
    });

  } catch (error) {
    console.error('❌ Error in magic-link API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}