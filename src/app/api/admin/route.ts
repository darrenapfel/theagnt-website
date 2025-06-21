import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';

export async function GET() {
  try {
    await headers(); // Ensure headers are awaited
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Simplified admin endpoint - just return basic info for now
    return NextResponse.json({
      totalUsers: 0,
      totalWaitlist: 0,
      conversionRate: 0,
      users: [],
      message: 'Admin dashboard - full functionality coming soon'
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
