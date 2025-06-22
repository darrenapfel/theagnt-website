/**
 * Test utilities for authentication and session management
 * These utilities help with testing authentication flows without real OAuth
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Creates a mock session for testing
 */
export function createMockSession(email: string) {
  return {
    user: {
      id: email,
      email: email,
      name: email.split('@')[0],
      image: null,
      isAdmin: email === 'darrenapfel@gmail.com'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
}

/**
 * Injects authentication headers for testing
 */
export function injectAuthHeaders(request: NextRequest, email: string): NextRequest {
  const headers = new Headers(request.headers);
  headers.set('x-test-auth-email', email);
  
  return new NextRequest(request.url, {
    headers,
    method: request.method,
    body: request.body,
  });
}

/**
 * Middleware helper for test authentication
 */
export function handleTestAuth(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testEmail = request.headers.get('x-test-auth-email');
  if (!testEmail) {
    return null;
  }

  // Create response with test session cookie
  const response = NextResponse.next();
  response.cookies.set('email-session', testEmail, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return response;
}

/**
 * Helper to check if we're in test mode
 */
export function isTestMode(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
}

/**
 * Gets test email from environment or headers
 */
export function getTestEmail(request?: NextRequest): string | null {
  if (!isTestMode()) {
    return null;
  }

  // Check request headers first
  if (request) {
    const headerEmail = request.headers.get('x-test-auth-email');
    if (headerEmail) {
      return headerEmail;
    }
  }

  // Check environment variable
  return process.env.TEST_USER_EMAIL || null;
}