import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessInternal } from '@/lib/domain-utils';

export async function GET() {
  try {
    await headers(); // Ensure headers are awaited
    const session = await auth();

    // Check if user has internal access
    if (!session?.user?.email || !canAccessInternal(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all waitlist entries
    const { data: waitlistEntries, error: waitlistError } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .order('joined_at', { ascending: false });

    if (waitlistError) {
      console.error('Error fetching waitlist:', waitlistError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Fetch user details for each waitlist entry
    const userIds = waitlistEntries?.map(entry => entry.user_id) || [];
    
    // Get user details from auth.users table
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Map users to include waitlist information
    const userMap = new Map(users?.map(user => [user.id, user]) || []);
    const waitlistUsers = waitlistEntries?.map(entry => {
      const user = userMap.get(entry.user_id);
      return {
        id: entry.user_id,
        email: user?.email || 'Unknown',
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Unknown',
        created_at: user?.created_at || entry.joined_at,
        waitlist_status: true,
        waitlist_joined_at: entry.joined_at,
        auth_provider: user?.app_metadata?.provider || 'email',
        last_login: user?.last_sign_in_at || null
      };
    }) || [];

    // Calculate metrics
    const totalUsers = users?.length || 0;
    const totalWaitlist = waitlistEntries?.length || 0;
    const conversionRate = totalUsers > 0 ? Math.round((totalWaitlist / totalUsers) * 100) : 0;

    return NextResponse.json({
      totalUsers,
      totalWaitlist,
      conversionRate,
      users: waitlistUsers
    });
  } catch (error) {
    console.error('Internal waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}