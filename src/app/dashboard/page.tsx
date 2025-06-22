import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { auth } from '@/lib/auth-server';
import Logo from '@/components/ui/Logo';
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardRedirect from '@/components/dashboard/DashboardRedirect';

export default async function DashboardPage() {
  await headers(); // Ensure headers are awaited
  const session = await auth();
  const cookieStore = await cookies();
  const emailSession = cookieStore.get('email-session');

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

  return (
    <DashboardRedirect userEmail={user.email}>
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardHeader />

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
