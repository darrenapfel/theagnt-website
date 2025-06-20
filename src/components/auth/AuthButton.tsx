'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

interface AuthButtonProps {
  provider: 'google' | 'apple' | 'email';
  children: React.ReactNode;
}

export default function AuthButton({ provider, children }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: true,
      });
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full h-12 border border-charcoal bg-transparent text-foreground font-medium text-base hover:bg-charcoal active:bg-dark-gray transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal focus:ring-offset-background"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
