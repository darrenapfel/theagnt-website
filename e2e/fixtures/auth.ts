import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Authentication fixture types
 */
export type AuthUserType = 'admin' | 'internal' | 'external' | 'unauthenticated';

export interface AuthFixture {
  authenticatedPage: Page;
  userType: AuthUserType;
}

/**
 * Mock user data for different authentication scenarios
 */
export const MOCK_USERS = {
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
} as const;

/**
 * Creates authenticated context by setting session cookies
 */
async function createAuthenticatedContext(page: Page, userType: AuthUserType) {
  if (userType === 'unauthenticated') {
    return;
  }

  const user = MOCK_USERS[userType];
  
  // Set authentication cookies
  await page.context().addCookies([
    {
      name: 'email-session',
      value: user.email,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    },
    {
      name: 'dev-session',
      value: JSON.stringify(user),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }
  ]);
}

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixture>({
  userType: ['unauthenticated', { option: true }],
  
  authenticatedPage: async ({ page, userType }, use) => {
    // Create authenticated context before navigating
    await createAuthenticatedContext(page, userType);
    
    // Use the authenticated page
    await use(page);
    
    // Clean up is automatic when context closes
  }
});

/**
 * Helper to verify user is authenticated correctly
 */
export async function verifyAuthentication(page: Page, expectedUserType: AuthUserType) {
  // Navigate to debug page to check session
  await page.goto('/debug/session');
  
  if (expectedUserType === 'unauthenticated') {
    // Should redirect to sign in
    await expect(page).toHaveURL(/\/auth\/signin/);
  } else {
    const user = MOCK_USERS[expectedUserType];
    await expect(page.locator('text=' + user.email)).toBeVisible();
  }
}

/**
 * Helper to sign in using development auth page
 */
export async function devSignIn(page: Page, userType: Exclude<AuthUserType, 'unauthenticated'>) {
  await page.goto('/dev/auth');
  
  // Click the button for the desired user type
  await page.click(`button:has-text("Use This User"):near(:text("${userType} User"))`);
  
  // Should redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
}

/**
 * Helper to sign out
 */
export async function signOut(page: Page) {
  await page.goto('/dev/auth');
  await page.click('button:has-text("Clear Session")');
}

export { expect } from '@playwright/test';