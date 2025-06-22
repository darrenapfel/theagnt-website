'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear email session cookie if it exists
    document.cookie = 'email-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Also try NextAuth signout (will be a no-op if no NextAuth session)
    try {
      await signOut({ redirect: false });
    } catch (error) {
      // Ignore NextAuth errors if no session exists
    }
    
    // Redirect to home
    router.push('/');
  };

  return (
    <header className="absolute top-6 right-6">
      <button
        onClick={handleSignOut}
        className="text-foreground/60 hover:text-foreground text-sm transition-colors duration-200"
      >
        Sign out
      </button>
    </header>
  );
}
