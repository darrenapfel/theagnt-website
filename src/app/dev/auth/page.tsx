import { redirect } from 'next/navigation';
import { createDevSession, clearDevSession, getDevSession, TEST_USERS } from '@/lib/auth-dev';

// Server action to set dev session
async function setDevSession(formData: FormData) {
  'use server';
  
  const userType = formData.get('userType') as 'admin' | 'internal' | 'external';
  if (userType) {
    await createDevSession(userType);
  }
  
  redirect('/dashboard');
}

// Server action to clear session
async function clearSession() {
  'use server';
  
  await clearDevSession();
  redirect('/dev/auth');
}

export default async function DevAuthPage() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  const currentSession = await getDevSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Development Auth Testing</h1>
          <p className="text-foreground/60">
            Use this page to quickly switch between different user types for testing
          </p>
        </div>

        {/* Current Session */}
        <section className="bg-foreground/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          {currentSession ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {currentSession.email}</p>
              <p><strong>Name:</strong> {currentSession.name}</p>
              <p><strong>Type:</strong> {currentSession.type}</p>
              <form action={clearSession}>
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Clear Session
                </button>
              </form>
            </div>
          ) : (
            <p className="text-foreground/60">No development session active</p>
          )}
        </section>

        {/* Test Users */}
        <section className="bg-foreground/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Users</h2>
          <div className="grid gap-4">
            {Object.entries(TEST_USERS).map(([type, user]) => (
              <form key={type} action={setDevSession} className="border border-foreground/10 rounded-lg p-4">
                <input type="hidden" name="userType" value={type} />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold capitalize">{type} User</h3>
                    <p className="text-sm text-foreground/60">{user.email}</p>
                    <p className="text-xs text-foreground/40">{user.name}</p>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Use This User
                  </button>
                </div>
              </form>
            ))}
          </div>
        </section>

        {/* Navigation Links */}
        <section className="bg-foreground/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            <a href="/dashboard" className="text-blue-500 hover:underline">Dashboard</a>
            <a href="/internal" className="text-blue-500 hover:underline">Internal Dashboard</a>
            <a href="/debug/session" className="text-blue-500 hover:underline">Session Debug</a>
            <a href="/auth/signin" className="text-blue-500 hover:underline">Sign In</a>
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-yellow-600">⚠️ Development Only</h2>
          <p className="text-sm text-foreground/80">
            This page is only available in development mode. It allows you to quickly test
            different authentication scenarios without going through the actual auth flow.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-foreground/60">
            <li>• <strong>Admin:</strong> Has full access including /admin page</li>
            <li>• <strong>Internal:</strong> @theagnt.ai user, redirected to /internal</li>
            <li>• <strong>External:</strong> Regular user, sees waitlist on /dashboard</li>
          </ul>
        </section>
      </div>
    </div>
  );
}