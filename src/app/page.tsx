import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/auth/AuthButton';
import EmailAuthButton from '@/components/auth/EmailAuthButton';

export default async function Home() {
  const headersList = await headers(); // Ensure headers are awaited properly
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-12">
        <Logo size="large" animated />

        <div className="space-y-4">
          <AuthButton provider="google">Continue with Google</AuthButton>

          {/* Temporarily disabled until email limits resolved */}
          {/* <AuthButton provider="apple">Continue with Apple</AuthButton> */}
          {/* <EmailAuthButton>Continue with Email</EmailAuthButton> */}
          
          <div className="text-center text-sm text-muted-foreground mt-6">
            Sign in with your Google account to get started
          </div>
        </div>
      </div>
    </div>
  );
}
