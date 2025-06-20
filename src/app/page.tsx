import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/auth/AuthButton';

export default async function Home() {
  await headers(); // Ensure headers are awaited
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

          <AuthButton provider="apple">Continue with Apple</AuthButton>

          <AuthButton provider="email">Continue with Email</AuthButton>
        </div>
      </div>
    </div>
  );
}
