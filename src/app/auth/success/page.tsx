'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const email = searchParams.get('email');
        const accessToken = searchParams.get('access_token');
        const next = searchParams.get('next') || '/dashboard';

        if (!email || !accessToken) {
          throw new Error('Missing authentication parameters');
        }

        console.log('🔄 Processing authentication for:', email);

        // Create a NextAuth session by signing in with credentials
        // We'll create a custom credentials provider for this
        const result = await signIn('credentials', {
          email: email,
          accessToken: accessToken,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        console.log('✅ Authentication successful, redirecting to:', next);
        
        // Redirect to the intended destination
        router.push(next);

      } catch (error) {
        console.error('❌ Authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleAuthSuccess();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-thin text-foreground">Authentication Error</h1>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-2 border border-charcoal bg-transparent text-foreground hover:bg-charcoal transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
        <h1 className="text-2xl font-thin text-foreground">Signing you in...</h1>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
          <h1 className="text-2xl font-thin text-foreground">Loading...</h1>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  );
}