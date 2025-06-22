'use client';

import { useEffect, useState } from 'react';
import { canAccessInternal } from '@/lib/domain-utils';

interface AuthDebugClientProps {
  userEmail?: string | null;
}

export default function AuthDebugClient({ userEmail }: AuthDebugClientProps) {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session data from API
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSessionData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch session:', err);
        setLoading(false);
      });
  }, []);

  // Only show in development or if explicitly enabled via query param
  const showDebug = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'));

  if (!showDebug) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 border border-white/20 rounded-lg p-4 max-w-md text-xs font-mono text-white/80 z-50">
      <h3 className="text-sm font-bold mb-2 text-white">Auth Debug (Client)</h3>
      
      <div className="space-y-1">
        <p><strong>Prop Email:</strong> {userEmail || 'null'}</p>
        <p><strong>Session Email:</strong> {loading ? 'Loading...' : sessionData?.user?.email || 'null'}</p>
        <p><strong>Can Access Internal (prop):</strong> {userEmail ? (canAccessInternal(userEmail) ? '✅' : '❌') : '—'}</p>
        <p><strong>Can Access Internal (session):</strong> {sessionData?.user?.email ? (canAccessInternal(sessionData.user.email) ? '✅' : '❌') : '—'}</p>
        <p><strong>Current Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : '—'}</p>
      </div>
      
      <div className="mt-2 pt-2 border-t border-white/10">
        <p className="text-[10px] text-white/50">Add ?debug=true to URL to show in production</p>
      </div>
    </div>
  );
}