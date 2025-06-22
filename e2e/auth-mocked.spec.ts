import { test, expect, devSignIn, signOut } from './fixtures/auth';

test.describe('Mocked Authentication Tests', () => {
  test.describe('Dashboard Redirection Logic', () => {
    test('admin user should stay on dashboard', async ({ page }) => {
      // Sign in as admin
      await devSignIn(page, 'admin');
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      
      // Should stay on dashboard (admin is not redirected)
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=Join the waitlist')).toBeVisible();
      await expect(page.locator('a[href="/admin"]')).toBeVisible(); // Admin link
    });

    test('internal user should be redirected to /internal', async ({ page }) => {
      // Sign in as internal user
      await devSignIn(page, 'internal');
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      
      // Should be redirected to internal dashboard
      await expect(page).toHaveURL('/internal');
      await expect(page.locator('h1:has-text("Internal Dashboard")')).toBeVisible();
    });

    test('external user should stay on dashboard', async ({ page }) => {
      // Sign in as external user
      await devSignIn(page, 'external');
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      
      // Should stay on dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=Join the waitlist')).toBeVisible();
      await expect(page.locator('a[href="/admin"]')).not.toBeVisible(); // No admin link
    });
  });

  test.describe('Direct Navigation Tests', () => {
    test('unauthenticated user should be redirected to signin', async ({ page }) => {
      // Clear any existing session
      await page.goto('/dev/auth');
      const clearButton = page.locator('button:has-text("Clear Session")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
      }
      
      // Try to access dashboard
      await page.goto('/dashboard');
      
      // Should redirect to signin
      await expect(page).toHaveURL('/auth/signin');
    });

    test('external user cannot access /internal', async ({ page }) => {
      // Sign in as external user
      await devSignIn(page, 'external');
      
      // Try to access internal page directly
      await page.goto('/internal');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });

    test('internal user can access /internal directly', async ({ page }) => {
      // Sign in as internal user
      await devSignIn(page, 'internal');
      
      // Access internal page directly
      await page.goto('/internal');
      
      // Should stay on internal page
      await expect(page).toHaveURL('/internal');
      await expect(page.locator('h1:has-text("Internal Dashboard")')).toBeVisible();
    });
  });

  test.describe('Session Debug Page', () => {
    test('should display correct session info for each user type', async ({ page }) => {
      // Test admin user
      await devSignIn(page, 'admin');
      await page.goto('/debug/session');
      await expect(page.locator('text=darrenapfel@gmail.com')).toBeVisible();
      await expect(page.locator('text="role": "admin"')).toBeVisible();
      await expect(page.locator('text="canAccessInternal": true')).toBeVisible();
      await expect(page.locator('text="canAccessAdmin": true')).toBeVisible();
      
      // Test internal user
      await devSignIn(page, 'internal');
      await page.goto('/debug/session');
      await expect(page.locator('text=test@theagnt.ai')).toBeVisible();
      await expect(page.locator('text="role": "internal"')).toBeVisible();
      await expect(page.locator('text="canAccessInternal": true')).toBeVisible();
      await expect(page.locator('text="canAccessAdmin": false')).toBeVisible();
      
      // Test external user
      await devSignIn(page, 'external');
      await page.goto('/debug/session');
      await expect(page.locator('text=test@example.com')).toBeVisible();
      await expect(page.locator('text="role": "external"')).toBeVisible();
      await expect(page.locator('text="canAccessInternal": false')).toBeVisible();
      await expect(page.locator('text="canAccessAdmin": false')).toBeVisible();
    });
  });

  test.describe('Dev Auth Page', () => {
    test('should switch between users correctly', async ({ page }) => {
      await page.goto('/dev/auth');
      
      // Start with no session
      await expect(page.locator('text=No development session active')).toBeVisible();
      
      // Switch to admin
      await page.click('button:has-text("Use This User"):near(:text("admin User"))');
      await expect(page).toHaveURL('/dashboard');
      
      // Go back and verify session
      await page.goto('/dev/auth');
      await expect(page.locator('text=darrenapfel@gmail.com')).toBeVisible();
      await expect(page.locator('text=Type: admin')).toBeVisible();
      
      // Switch to internal
      await page.click('button:has-text("Use This User"):near(:text("internal User"))');
      await expect(page).toHaveURL('/internal'); // Internal users get redirected
      
      // Clear session
      await page.goto('/dev/auth');
      await page.click('button:has-text("Clear Session")');
      await expect(page.locator('text=No development session active')).toBeVisible();
    });
  });
});