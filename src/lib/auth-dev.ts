/**
 * Development-only authentication utilities for testing
 * WARNING: These should NEVER be used in production
 */

import { cookies } from 'next/headers';

export type TestUserType = 'admin' | 'internal' | 'external';

export interface TestUser {
  email: string;
  name: string;
  type: TestUserType;
}

/**
 * Predefined test users for different scenarios
 */
export const TEST_USERS: Record<TestUserType, TestUser> = {
  admin: {
    email: 'darrenapfel@gmail.com',
    name: 'Admin User',
    type: 'admin'
  },
  internal: {
    email: 'test@theagnt.ai',
    name: 'Internal User',
    type: 'internal'
  },
  external: {
    email: 'test@example.com',
    name: 'External User',
    type: 'external'
  }
};

/**
 * Creates a development session for testing
 * Only works in development environment
 */
export async function createDevSession(userType: TestUserType) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Dev sessions are only available in development');
  }

  const user = TEST_USERS[userType];
  const cookieStore = await cookies();
  
  // Set a cookie that mimics our email session
  cookieStore.set('email-session', user.email, {
    httpOnly: true,
    secure: false, // Development mode, allow HTTP
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  // Also set a dev-session cookie to identify this as a test session
  cookieStore.set('dev-session', JSON.stringify(user), {
    httpOnly: true,
    secure: false, // Development mode, allow HTTP
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return user;
}

/**
 * Clears development session
 */
export async function clearDevSession() {
  const cookieStore = await cookies();
  cookieStore.delete('email-session');
  cookieStore.delete('dev-session');
}

/**
 * Gets current dev session if it exists
 */
export async function getDevSession(): Promise<TestUser | null> {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const cookieStore = await cookies();
  const devSession = cookieStore.get('dev-session');
  
  if (!devSession?.value) {
    return null;
  }

  try {
    return JSON.parse(devSession.value);
  } catch {
    return null;
  }
}

/**
 * Checks if current session is a dev session
 */
export async function isDevSession(): Promise<boolean> {
  const devSession = await getDevSession();
  return devSession !== null;
}