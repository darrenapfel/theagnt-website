import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuth = !!session;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return null;
  }

  if (isDashboard || isAdminPage) {
    if (!isAuth) {
      let from = request.nextUrl.pathname;
      if (request.nextUrl.search) {
        from += request.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, request.url)
      );
    }

    if (isAdminPage && session?.user?.email !== 'darrenapfel@gmail.com') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
