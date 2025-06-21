'use client';

import { useState, useCallback, useMemo } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import AppleIcon from './icons/AppleIcon';
import EmailIcon from './icons/EmailIcon';
import OptimizedButton from '../ui/OptimizedButton';
import { deduplicatedSignIn } from '../../lib/request-deduplication';

interface AuthButtonProps {
  provider: 'google' | 'apple' | 'email';
  children: React.ReactNode;
  'data-testid'?: string;
}

export default function AuthButton({ provider, children, 'data-testid': testId }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Pre-compute provider mapping for faster execution
  const authProvider = useMemo(() => {
    return provider === 'email' ? 'email' : provider;
  }, [provider]);

  const handleSignIn = useCallback(async () => {
    try {
      // Set loading state immediately for instant feedback
      setIsLoading(true);
      
      console.log(`Attempting to sign in with provider: ${authProvider}`);
      
      // Use deduplicated signIn to prevent multiple requests
      const result = await deduplicatedSignIn(authProvider, {
        callbackUrl: '/dashboard',
        redirect: true,
      });
      
      console.log('Sign in result:', result);
    } catch (error) {
      console.error('Authentication error:', error);
      setIsLoading(false); // Only reset on error, success will redirect
    }
  }, [authProvider]);

  // Memoize icon to prevent unnecessary re-renders
  const providerIcon = useMemo(() => {
    switch (provider) {
      case 'google':
        return <GoogleIcon className="w-5 h-5" />;
      case 'apple':
        return <AppleIcon className="w-5 h-5" />;
      case 'email':
        return <EmailIcon className="w-5 h-5" />;
      default:
        return null;
    }
  }, [provider]);

  return (
    <OptimizedButton
      onClick={handleSignIn}
      loading={isLoading}
      loadingText="Connecting..."
      icon={providerIcon}
      data-testid={testId || `${provider}-auth-button`}
      className="w-full"
      variant="outline"
      size="md"
      hapticFeedback={true}
      instantFeedback={true}
    >
      {children}
    </OptimizedButton>
  );
}
