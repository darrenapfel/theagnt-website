'use client';

import { signOut } from 'next-auth/react';

export default function DashboardHeader() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
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
