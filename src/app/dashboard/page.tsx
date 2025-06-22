import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { auth } from '@/lib/auth-server';
import Logo from '@/components/ui/Logo';
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardRedirect from '@/components/dashboard/DashboardRedirect';
import DevModeIndicator from '@/components/dev/DevModeIndicator';

export default async function DashboardPage() {
  await headers(); // Ensure headers are awaited
  const session = await auth();
  const cookieStore = await cookies();
  const emailSession = cookieStore.get('email-session');
  const devSession = cookieStore.get('dev-session');

  // Debug logging
  console.log('🔍 Dashboard Debug Info:');
  console.log('  - NextAuth session:', session);
  console.log('  - Email session cookie:', emailSession);
  console.log('  - Session user email:', session?.user?.email);
  console.log('  - Email session value:', emailSession?.value);

  // Allow access if either NextAuth session OR email session exists
  if (!session && !emailSession) {
    redirect('/auth/signin');
  }

  // Create a user object for email sessions
  const user = session?.user || {
    email: emailSession?.value,
    name: emailSession?.value?.split('@')[0],
    isAdmin: emailSession?.value === 'darrenapfel@gmail.com'
  };

  // Debug logging to help diagnose auth issues
  console.log('🔍 Dashboard Debug - Session:', session);
  console.log('🔍 Dashboard Debug - Email Session:', emailSession);
  console.log('🔍 Dashboard Debug - Email Session Value:', emailSession?.value);
  console.log('🔍 Dashboard Debug - Email Session Name:', emailSession?.name);
  console.log('🔍 Dashboard Debug - User Object:', user);
  console.log('🔍 Dashboard Debug - Final Email:', user.email);
  
  // Additional debugging for email session structure
  if (emailSession) {
    console.log('🔍 Email Session Properties:', Object.keys(emailSession));
    console.log('🔍 Email Session Full Object:', JSON.stringify(emailSession));
  }

  // More debug logging
  console.log('  - Final user object:', user);
  console.log('  - User email passed to DashboardRedirect:', user.email);
  console.log('  - Is user.email truthy?', !!user.email);
  console.log('  - Email type:', typeof user.email);

  return (
    <DashboardRedirect userEmail={user.email}>
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardHeader />

        {/* Development mode indicator */}
        {devSession && process.env.NODE_ENV === 'development' && (
          <DevModeIndicator userEmail={user.email || 'unknown'} />
        )}

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-16">
            <Logo size="default" animated={false} />
            <WaitlistStatus user={user} />
          </div>
        </main>

        {user.isAdmin && (
          <footer className="absolute bottom-6 left-6">
            <a
              href="/admin"
              className="text-foreground/40 hover:text-foreground/60 text-sm transition-colors duration-200"
            >
              Admin
            </a>
          </footer>
        )}
      </div>
    </DashboardRedirect>
  );
}
