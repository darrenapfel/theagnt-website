import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { canAccessInternal, canAccessAdmin } from '@/lib/domain-utils';

export async function middleware(request: NextRequest) {
  console.log('🚨 MIDDLEWARE RUNNING for:', request.nextUrl.pathname);
  const session = await auth();
  
  // Check for dev session in development mode
  let isAuth = !!session?.user;
  let userEmail = session?.user?.email;
  
  if (process.env.NODE_ENV === 'development') {
    const emailSessionCookie = request.cookies.get('email-session');
    const devSessionCookie = request.cookies.get('dev-session');
    
    if (emailSessionCookie && devSessionCookie?.value === 'true') {
      // Use dev session
      isAuth = true;
      userEmail = emailSessionCookie.value;
      console.log('🔧 Middleware: Using dev session for:', userEmail);
    }
  }
  
  // Route path checks
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isInternalPage = request.nextUrl.pathname.startsWith('/internal');

  // Auth page logic - redirect authenticated users to dashboard
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return null;
  }

  // Helper function to create redirect with 'from' parameter
  const createRedirectWithFrom = (targetPath: string) => {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`${targetPath}?from=${encodeURIComponent(from)}`, request.url)
    );
  };

  // Internal routes protection - requires authentication AND theAGNT.ai domain
  if (isInternalPage) {
    console.log('🔧 Middleware: Checking internal route access for:', userEmail);
    
    // First check: user must be authenticated
    if (!isAuth) {
      console.log('❌ Middleware: User not authenticated, redirecting to signin');
      return createRedirectWithFrom('/auth/signin');
    }

    // Second check: user must have internal access (theAGNT.ai domain or admin)
    const hasInternalAccess = canAccessInternal(userEmail);
    console.log('🔧 Middleware: Internal access check:', { userEmail, hasInternalAccess });
    
    if (!hasInternalAccess) {
      // Redirect external users to their dashboard
      console.log('❌ Middleware: External user blocked from internal route, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // User is authenticated and has internal access - allow through
    console.log('✅ Middleware: Internal user allowed through');
    return null;
  }

  // Dashboard and admin routes protection
  if (isDashboard || isAdminPage) {
    // First check: user must be authenticated
    if (!isAuth) {
      return createRedirectWithFrom('/auth/signin');
    }

    // Admin page additional check - requires admin privileges
    if (isAdminPage && !canAccessAdmin(userEmail)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Default: allow request to continue
  return null;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/internal/:path*',
    '/admin/:path*',
    '/dashboard/:path*'
  ],
};

// Add default export for Next.js compatibility
export default middleware;
