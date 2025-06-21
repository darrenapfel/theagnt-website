'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import ServiceWorkerInit from '../ServiceWorkerInit';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <ServiceWorkerInit />
      {children}
    </SessionProvider>
  );
}
