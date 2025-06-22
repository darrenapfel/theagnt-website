import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-server';
import { canAccessInternal } from '@/lib/domain-utils';
import { cookies } from 'next/headers';

/**
 * Internal Layout - Server-side protection
 * 
 * This layout ensures that all /internal/* pages are protected
 * at the server level, even if middleware fails.
 */
export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await auth();
  let userEmail = session?.user?.email;
  
  // Check for dev session in development mode
  if (!userEmail && process.env.NODE_ENV === 'development') {
    const cookieStore = await cookies();
    const emailSessionCookie = cookieStore.get('email-session');
    const devSessionCookie = cookieStore.get('dev-session');
    
    if (emailSessionCookie && devSessionCookie?.value === 'true') {
      userEmail = emailSessionCookie.value;
    }
  }
  
  // Verify internal access
  if (!userEmail || !canAccessInternal(userEmail)) {
    console.log('🚨 InternalLayout: Blocking access for:', userEmail || 'unauthenticated');
    redirect('/dashboard');
  }
  
  console.log('✅ InternalLayout: Allowing internal access for:', userEmail);
  
  return <>{children}</>;
}