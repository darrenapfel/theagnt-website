import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/auth/AuthButton';
import EmailAuthButton from '@/components/auth/EmailAuthButton';

export default async function Home({
  searchParams,
}: {
  searchParams: { verified?: string; email?: string; error?: string };
}) {
  const headersList = await headers(); // Ensure headers are awaited properly
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-12">
        <Logo size="large" animated />

        {/* Success/Error Messages */}
        {searchParams.verified && (
          <div className="p-4 text-sm text-green-800 bg-green-100 border border-green-200 rounded-md">
            ✅ Email verified! You can now sign in with Google using {searchParams.email}
          </div>
        )}

        {searchParams.error && (
          <div className="p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
            ❌ {searchParams.error === 'auth-failed' ? 'Authentication failed' : 'An error occurred'}
          </div>
        )}

        <div className="space-y-4">
          <AuthButton provider="google">Continue with Google</AuthButton>

          <EmailAuthButton>Continue with Email</EmailAuthButton>

          {/* Apple temporarily disabled */}
          {/* <AuthButton provider="apple">Continue with Apple</AuthButton> */}
          
          <div className="text-center text-sm text-muted-foreground mt-6">
            Sign in with Google or get a magic link via email
          </div>
        </div>
      </div>
    </div>
  );
}
