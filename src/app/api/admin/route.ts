import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    await headers(); // Ensure headers are awaited
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Users count error:', usersError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get total waitlist count
    const { count: totalWaitlist, error: waitlistError } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (waitlistError) {
      console.error('Waitlist count error:', waitlistError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get detailed user data with waitlist status
    const { data: usersData, error: detailedError } = await supabaseAdmin.rpc(
      'get_admin_dashboard_data'
    );

    if (detailedError) {
      // Fallback if RPC doesn't exist yet
      const { data: users, error: usersQueryError } = await supabaseAdmin
        .from('users')
        .select(
          `
          id,
          email,
          raw_user_meta_data,
          created_at,
          last_sign_in_at,
          waitlist:waitlist(joined_at)
        `
        )
        .order('created_at', { ascending: false });

      if (usersQueryError) {
        console.error('Users query error:', usersQueryError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      const formattedUsers =
        users?.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.raw_user_meta_data?.name || null,
          created_at: user.created_at,
          last_login: user.last_sign_in_at,
          auth_provider: user.raw_user_meta_data?.provider || 'email',
          waitlist_status: user.waitlist && user.waitlist.length > 0,
          waitlist_joined_at: user.waitlist?.[0]?.joined_at || null,
        })) || [];

      const conversionRate =
        totalUsers && totalUsers > 0
          ? Math.round(((totalWaitlist || 0) / totalUsers) * 100)
          : 0;

      return NextResponse.json({
        totalUsers: totalUsers || 0,
        totalWaitlist: totalWaitlist || 0,
        conversionRate,
        users: formattedUsers,
      });
    }

    const conversionRate =
      totalUsers && totalUsers > 0
        ? Math.round(((totalWaitlist || 0) / totalUsers) * 100)
        : 0;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalWaitlist: totalWaitlist || 0,
      conversionRate,
      users: usersData || [],
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
