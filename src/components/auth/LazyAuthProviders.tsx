'use client';

import { lazy, Suspense } from 'react';
import SkeletonLoader from '../ui/SkeletonLoader';

// Lazy load auth components for better performance
const AuthButton = lazy(() => import('./AuthButton'));
const EmailAuthButton = lazy(() => import('./EmailAuthButton'));

interface LazyAuthProvidersProps {
  className?: string;
}

export function LazyAuthProviders({ className = '' }: LazyAuthProvidersProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <Suspense fallback={<SkeletonLoader variant="button" />}>
        <AuthButton provider="google">Continue with Google</AuthButton>
      </Suspense>

      <Suspense fallback={<SkeletonLoader variant="button" />}>
        <AuthButton provider="apple">Continue with Apple</AuthButton>
      </Suspense>

      <Suspense fallback={<SkeletonLoader variant="button" />}>
        <EmailAuthButton>Continue with Email</EmailAuthButton>
      </Suspense>
    </div>
  );
}

export default LazyAuthProviders;