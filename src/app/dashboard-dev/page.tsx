import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardRedirect from '@/components/dashboard/DashboardRedirect';
import DevModeIndicator from '@/components/dev/DevModeIndicator';

/**
 * Development-friendly dashboard that works without NextAuth issues
 * This bypasses the problematic auth() calls that cause headers() sync issues
 */
export default async function DashboardDevPage() {
  const cookieStore = await cookies();
  const emailSession = cookieStore.get('email-session');
  const devSession = cookieStore.get('dev-session');

  // Simple authentication check without NextAuth
  if (!emailSession && !devSession) {
    redirect('/dev/login');
  }

  // Create user object from email session
  const userEmail = emailSession?.value || 'unknown@example.com';
  const user = {
    email: userEmail,
    name: userEmail.split('@')[0],
    id: userEmail,
    isAdmin: userEmail === 'darrenapfel@gmail.com'
  };

  console.log('🔧 DEV DASHBOARD - User:', user);
  console.log('🔧 DEV DASHBOARD - Email:', userEmail);

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