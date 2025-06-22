import { headers, cookies } from 'next/headers';
import { auth } from '@/lib/auth-server';
import { getUserAccess, validateEmailDomain } from '@/lib/domain-utils';

export default async function DebugSessionPage() {
  await headers();
  const session = await auth();
  const cookieStore = await cookies();
  const emailSession = cookieStore.get('email-session');
  
  // Extract email from either session
  const email = session?.user?.email || emailSession?.value;
  
  // Get domain validation and access info if email exists
  const domainValidation = email ? validateEmailDomain(email) : null;
  const userAccess = email ? getUserAccess(email) : null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Session Debug Information</h1>
        
        {/* NextAuth Session */}
        <section className="bg-foreground/5 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">NextAuth Session</h2>
          {session ? (
            <pre className="bg-black/10 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : (
            <p className="text-foreground/60">No NextAuth session found</p>
          )}
        </section>

        {/* Email Session Cookie */}
        <section className="bg-foreground/5 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Email Session Cookie</h2>
          {emailSession ? (
            <pre className="bg-black/10 p-4 rounded overflow-auto text-sm">
              {JSON.stringify({
                name: emailSession.name,
                value: emailSession.value,
                ...emailSession
              }, null, 2)}
            </pre>
          ) : (
            <p className="text-foreground/60">No email session cookie found</p>
          )}
        </section>

        {/* Extracted Email */}
        <section className="bg-foreground/5 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Extracted Email</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {email || 'None'}</p>
            <p><strong>Type:</strong> {typeof email}</p>
            <p><strong>Truthy:</strong> {!!email ? 'Yes' : 'No'}</p>
          </div>
        </section>

        {/* Domain Validation */}
        <section className="bg-foreground/5 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Domain Validation</h2>
          {domainValidation ? (
            <pre className="bg-black/10 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(domainValidation, null, 2)}
            </pre>
          ) : (
            <p className="text-foreground/60">No email to validate</p>
          )}
        </section>

        {/* User Access */}
        <section className="bg-foreground/5 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">User Access Information</h2>
          {userAccess ? (
            <pre className="bg-black/10 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(userAccess, null, 2)}
            </pre>
          ) : (
            <p className="text-foreground/60">No email for access check</p>
          )}
        </section>

        {/* Quick Links */}
        <section className="bg-foreground/5 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Quick Navigation</h2>
          <div className="flex gap-4">
            <a href="/dashboard" className="text-blue-500 hover:underline">Dashboard</a>
            <a href="/internal" className="text-blue-500 hover:underline">Internal</a>
            <a href="/auth/signin" className="text-blue-500 hover:underline">Sign In</a>
            <a href="/auth/signout" className="text-blue-500 hover:underline">Sign Out</a>
          </div>
        </section>
      </div>
    </div>
  );
}