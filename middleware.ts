import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { canAccessInternal, canAccessAdmin } from '@/lib/domain-utils';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuth = !!session?.user;
  const userEmail = session?.user?.email;
  
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
    // First check: user must be authenticated
    if (!isAuth) {
      return createRedirectWithFrom('/auth/signin');
    }

    // Second check: user must have internal access (theAGNT.ai domain or admin)
    if (!canAccessInternal(userEmail)) {
      // Redirect external users to their dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // User is authenticated and has internal access - allow through
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
