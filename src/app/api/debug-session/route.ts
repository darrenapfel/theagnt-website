import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { auth } from '@/lib/auth-server';

export async function GET() {
  try {
    await headers();
    const session = await auth();
    const cookieStore = await cookies();
    
    const allCookies = cookieStore.getAll();
    const relevantCookies = allCookies.filter(c => 
      c.name.includes('next-auth') || 
      c.name.includes('session') ||
      c.name.includes('auth')
    );

    return NextResponse.json({
      session,
      cookieCount: allCookies.length,
      relevantCookies: relevantCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0
      })),
      userAgent: (await headers()).get('user-agent'),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({
      error: 'Failed to debug session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}