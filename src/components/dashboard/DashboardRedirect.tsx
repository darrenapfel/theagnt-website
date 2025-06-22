'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { canAccessInternal } from '@/lib/domain-utils';

interface DashboardRedirectProps {
  userEmail?: string | null;
  children: React.ReactNode;
}

/**
 * Client component that handles domain-based redirection for internal users
 * Redirects @theagnt.ai users and admin to /internal, shows children for external users
 */
export default function DashboardRedirect({ userEmail, children }: DashboardRedirectProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if user should be redirected to internal dashboard
    if (userEmail && canAccessInternal(userEmail)) {
      setIsRedirecting(true);
      router.push('/internal');
    }
  }, [userEmail, router]);

  // Show loading state during redirect for internal users
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="text-foreground/60">Redirecting to internal dashboard...</p>
        </div>
      </div>
    );
  }

  // Render children for external users
  return <>{children}</>;
}