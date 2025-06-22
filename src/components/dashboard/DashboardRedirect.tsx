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
    console.log('🔄 DashboardRedirect Debug:');
    console.log('  - Received userEmail:', userEmail);
    console.log('  - userEmail type:', typeof userEmail);
    console.log('  - Is userEmail truthy?', !!userEmail);
    
    if (userEmail) {
      const canAccess = canAccessInternal(userEmail);
      console.log('  - canAccessInternal result:', canAccess);
      console.log('  - Domain check for:', userEmail);
      
      // Additional domain debugging
      const trimmedEmail = userEmail.trim().toLowerCase();
      const domain = trimmedEmail.split('@')[1];
      console.log('  - Trimmed email:', trimmedEmail);
      console.log('  - Extracted domain:', domain);
      console.log('  - Is theagnt.ai?', domain === 'theagnt.ai');
    }
    
    // Check if user should be redirected to internal dashboard
    if (userEmail && canAccessInternal(userEmail)) {
      console.log('  ✅ Redirecting to /internal');
      setIsRedirecting(true);
      router.push('/internal');
    } else {
      console.log('  ❌ Not redirecting - showing external dashboard');
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