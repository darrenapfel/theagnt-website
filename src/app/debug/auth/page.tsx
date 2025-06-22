import { auth } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import { canAccessInternal, getUserAccess } from '@/lib/domain-utils';

export default async function AuthDebugPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const emailSession = cookieStore.get('email-session');
  
  // Get the email from session or cookie
  const userEmail = session?.user?.email || emailSession?.value;
  
  // Test domain validation
  const canAccess = canAccessInternal(userEmail);
  const userAccess = getUserAccess(userEmail);
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Auth Debug Page</h1>
        
        <div className="space-y-6">
          {/* Session Info */}
          <section className="bg-foreground/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
            <pre className="text-sm overflow-auto bg-black/50 p-4 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </section>
          
          {/* Email Session Info */}
          <section className="bg-foreground/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Email Session Cookie</h2>
            <pre className="text-sm overflow-auto bg-black/50 p-4 rounded">
              {JSON.stringify(emailSession, null, 2)}
            </pre>
          </section>
          
          {/* Domain Validation */}
          <section className="bg-foreground/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Domain Validation</h2>
            <div className="space-y-2">
              <p><strong>User Email:</strong> {userEmail || 'No email found'}</p>
              <p><strong>Can Access Internal:</strong> {canAccess ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User Access:</strong></p>
              <pre className="text-sm overflow-auto bg-black/50 p-4 rounded mt-2">
                {JSON.stringify(userAccess, null, 2)}
              </pre>
            </div>
          </section>
          
          {/* Test Different Emails */}
          <section className="bg-foreground/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Domain Validation Tests</h2>
            <div className="space-y-4">
              {[
                'test@theagnt.ai',
                'user@theagnt.ai',
                'darrenapfel@gmail.com',
                'external@gmail.com',
                'test@example.com'
              ].map(email => {
                const access = getUserAccess(email);
                return (
                  <div key={email} className="border-b border-foreground/10 pb-2">
                    <p className="font-mono text-sm">{email}</p>
                    <p className="text-xs text-foreground/60">
                      Role: {access.role} | 
                      Can Access Internal: {access.canAccessInternal ? '✅' : '❌'} |
                      Is Admin: {access.isAdmin ? '✅' : '❌'}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
          
          {/* Navigation */}
          <section className="bg-foreground/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Navigation</h2>
            <div className="space-x-4">
              <a href="/dashboard" className="text-blue-500 hover:underline">Go to Dashboard</a>
              <a href="/internal" className="text-blue-500 hover:underline">Go to Internal</a>
              <a href="/auth/signin" className="text-blue-500 hover:underline">Sign In</a>
              <a href="/api/auth/signout" className="text-blue-500 hover:underline">Sign Out</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}