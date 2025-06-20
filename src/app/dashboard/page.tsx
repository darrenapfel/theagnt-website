import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';
import Logo from '@/components/ui/Logo';
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';
import DashboardHeader from '@/components/ui/DashboardHeader';

export default async function DashboardPage() {
  await headers(); // Ensure headers are awaited
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-16">
          <Logo size="default" animated={false} />
          <WaitlistStatus />
        </div>
      </main>

      {session.user.isAdmin && (
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
  );
}
