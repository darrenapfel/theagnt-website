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
    // Production-safe logging
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev || window.location.hostname === 'localhost') {
      console.log('🔄 DashboardRedirect Debug:');
      console.log('  - Received userEmail:', userEmail);
      console.log('  - userEmail type:', typeof userEmail);
      console.log('  - Is userEmail truthy?', !!userEmail);
    }
    
    // Defensive programming - ensure userEmail is a valid string
    if (!userEmail || typeof userEmail !== 'string') {
      if (isDev) {
        console.log('  ⚠️ Invalid userEmail provided:', userEmail);
      }
      return;
    }
    
    // Trim and normalize the email
    const normalizedEmail = userEmail.trim().toLowerCase();
    
    if (isDev || window.location.hostname === 'localhost') {
      const canAccess = canAccessInternal(normalizedEmail);
      console.log('  - canAccessInternal result:', canAccess);
      console.log('  - Normalized email:', normalizedEmail);
      
      // Additional domain debugging
      const domain = normalizedEmail.split('@')[1];
      console.log('  - Extracted domain:', domain);
      console.log('  - Is theagnt.ai?', domain === 'theagnt.ai');
      console.log('  - Is darrenapfel@gmail.com?', normalizedEmail === 'darrenapfel@gmail.com');
    }
    
    // Check if user should be redirected to internal dashboard
    if (canAccessInternal(normalizedEmail)) {
      if (isDev || window.location.hostname === 'localhost') {
        console.log('  ✅ Redirecting to /internal');
      }
      setIsRedirecting(true);
      router.push('/internal');
    } else {
      if (isDev || window.location.hostname === 'localhost') {
        console.log('  ❌ Not redirecting - showing external dashboard');
      }
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