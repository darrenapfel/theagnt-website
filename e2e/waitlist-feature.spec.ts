import { test, expect, Page } from '@playwright/test';

// Mock authentication responses for different user types
async function mockAuthentication(page: Page, userType: 'external' | 'internal' | 'admin') {
  const mockUsers = {
    external: {
      email: 'external@example.com',
      name: 'External User',
      id: '1',
      isAdmin: false,
    },
    internal: {
      email: 'internal@theagnt.ai',
      name: 'Internal User',
      id: '2',
      isAdmin: false,
    },
    admin: {
      email: 'darrenapfel@gmail.com',
      name: 'Admin User',
      id: '3',
      isAdmin: true,
    },
  };

  const user = mockUsers[userType];

  // Mock the NextAuth session
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });

  // Mock waitlist API
  await page.route('**/api/waitlist', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isOnWaitlist: false,
        }),
      });
    } else if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
        }),
      });
    }
  });

  // Mock admin API for internal/admin users
  if (userType === 'internal' || userType === 'admin') {
    await page.route('**/api/admin', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 150,
          waitlistUsers: 45,
          conversionRate: 30,
          users: [
            {
              id: '1',
              email: 'waitlist1@example.com',
              name: 'Waitlist User 1',
              waitlist_status: true,
              waitlist_joined_at: '2024-01-15T10:00:00Z',
              created_at: '2024-01-10T10:00:00Z',
              auth_provider: 'google',
              last_login: '2024-01-20T10:00:00Z',
            },
            {
              id: '2',
              email: 'waitlist2@example.com',
              name: 'Waitlist User 2',
              waitlist_status: true,
              waitlist_joined_at: '2024-01-16T10:00:00Z',
              created_at: '2024-01-11T10:00:00Z',
              auth_provider: 'email',
              last_login: null,
            },
          ],
        }),
      });
    });
  }
}

test.describe('Waitlist Feature - User Flows', () => {
  test.describe('External User Flow', () => {
    test('should allow external user to join waitlist from dashboard', async ({ page }) => {
      await mockAuthentication(page, 'external');

      // Navigate to dashboard
      await page.goto('/dashboard');

      // Should see waitlist component
      await expect(page.locator('text=Join the Waitlist')).toBeVisible();

      // Click join waitlist button
      await page.click('text=Join the Waitlist');

      // Should show success message
      await expect(page.locator('text=You\'re on the waitlist.')).toBeVisible();

      // Join button should disappear
      await expect(page.locator('text=Join the Waitlist')).not.toBeVisible();
    });

    test('should show waitlist status for user already on waitlist', async ({ page }) => {
      await mockAuthentication(page, 'external');

      // Mock user already on waitlist
      await page.route('**/api/waitlist', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              isOnWaitlist: true,
            }),
          });
        }
      });

      await page.goto('/dashboard');

      // Should see confirmation message, not join button
      await expect(page.locator('text=You\'re on the waitlist.')).toBeVisible();
      await expect(page.locator('text=Join the Waitlist')).not.toBeVisible();
    });

    test('should not have access to internal pages', async ({ page }) => {
      await mockAuthentication(page, 'external');

      // Try to access internal page - should be redirected by middleware
      await page.goto('/internal');

      // Should be redirected away from internal page
      // Exact redirect depends on middleware implementation
      await expect(page.url()).not.toContain('/internal');
    });

    test('should handle waitlist join errors gracefully', async ({ page }) => {
      await mockAuthentication(page, 'external');

      // Mock API error for joining waitlist
      await page.route('**/api/waitlist', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ isOnWaitlist: false }),
          });
        } else if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          });
        }
      });

      await page.goto('/dashboard');

      // Click join waitlist button
      await page.click('text=Join the Waitlist');

      // Should remain on join button after error
      await expect(page.locator('text=Join the Waitlist')).toBeVisible();
      await expect(page.locator('text=You\'re on the waitlist.')).not.toBeVisible();
    });
  });

  test.describe('Internal User Flow', () => {
    test('should access internal dashboard and navigate to waitlist', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      // Navigate to internal page
      await page.goto('/internal');

      // Should see internal page content
      await expect(page.locator('text=this is a special page')).toBeVisible();
      await expect(page.locator('text=Restricted access for theAGNT.ai team members')).toBeVisible();
      await expect(page.locator('text=View Waitlist Entries')).toBeVisible();

      // Click to view waitlist
      await page.click('text=View Waitlist Entries');

      // Should navigate to waitlist page
      await expect(page.url()).toContain('/internal/waitlist');
      await expect(page.locator('text=Waitlist Entries')).toBeVisible();
    });

    test('should view waitlist data and navigate back', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      await page.goto('/internal/waitlist');

      // Should see waitlist data
      await expect(page.locator('text=Waitlist Entries')).toBeVisible();
      await expect(page.locator('text=2 members')).toBeVisible();

      // Should see metrics
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=150')).toBeVisible();
      await expect(page.locator('text=Waitlist Members')).toBeVisible();

      // Should see user table
      await expect(page.locator('text=waitlist1@example.com')).toBeVisible();
      await expect(page.locator('text=waitlist2@example.com')).toBeVisible();

      // Should see export button
      await expect(page.locator('text=Export Waitlist CSV')).toBeVisible();
      await expect(page.locator('text=Export Waitlist CSV')).not.toBeDisabled();

      // Navigate back
      await page.click('text=← Back');
      await expect(page.url()).toContain('/internal');
      await expect(page.locator('text=this is a special page')).toBeVisible();
    });

    test('should handle empty waitlist state', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      // Mock empty waitlist
      await page.route('**/api/admin', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalUsers: 100,
            waitlistUsers: 0,
            conversionRate: 0,
            users: [],
          }),
        });
      });

      await page.goto('/internal/waitlist');

      // Should show empty state
      await expect(page.locator('text=No users on waitlist yet')).toBeVisible();
      await expect(page.locator('text=Waitlist entries will appear here when users join')).toBeVisible();

      // Export button should be disabled
      await expect(page.locator('text=Export Waitlist CSV')).toBeDisabled();
    });

    test('should handle API errors on waitlist page', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      // Mock API error
      await page.route('**/api/admin', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await page.goto('/internal/waitlist');

      // Should show error state
      await expect(page.locator('text=Error loading waitlist data')).toBeVisible();
      await expect(page.locator('text=Failed to fetch waitlist data')).toBeVisible();
      await expect(page.locator('text=Retry')).toBeVisible();
      await expect(page.locator('text=Back to Internal')).toBeVisible();
    });

    test('should retry failed API requests', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      let requestCount = 0;
      await page.route('**/api/admin', async (route) => {
        requestCount++;
        if (requestCount === 1) {
          // First request fails
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          });
        } else {
          // Second request succeeds
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              totalUsers: 150,
              waitlistUsers: 45,
              conversionRate: 30,
              users: [],
            }),
          });
        }
      });

      await page.goto('/internal/waitlist');

      // Should show error first
      await expect(page.locator('text=Error loading waitlist data')).toBeVisible();

      // Click retry
      await page.click('text=Retry');

      // Should show success state
      await expect(page.locator('text=Waitlist Entries')).toBeVisible();
      await expect(page.locator('text=Error loading waitlist data')).not.toBeVisible();
    });
  });

  test.describe('Admin User Flow', () => {
    test('should have same access as internal users', async ({ page }) => {
      await mockAuthentication(page, 'admin');

      // Should access internal pages
      await page.goto('/internal');
      await expect(page.locator('text=this is a special page')).toBeVisible();

      // Should access waitlist page
      await page.goto('/internal/waitlist');
      await expect(page.locator('text=Waitlist Entries')).toBeVisible();
    });

    test('should access admin dashboard in addition to internal pages', async ({ page }) => {
      await mockAuthentication(page, 'admin');

      // Admin should also have access to /admin routes (if implemented)
      // This test assumes admin routes exist
      await page.goto('/admin');
      // Test would depend on admin page implementation
    });
  });

  test.describe('Route Protection', () => {
    test('should redirect unauthorized users from internal routes', async ({ page }) => {
      await mockAuthentication(page, 'external');

      // Try to access internal route directly
      await page.goto('/internal');

      // Should be redirected (exact behavior depends on middleware)
      await expect(page.url()).not.toContain('/internal');
    });

    test('should redirect unauthorized users from internal waitlist', async ({ page }) => {
      await mockAuthentication(page, 'external');

      // Try to access internal waitlist directly
      await page.goto('/internal/waitlist');

      // Should be redirected
      await expect(page.url()).not.toContain('/internal/waitlist');
    });

    test('should allow authorized users to access internal routes', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      await page.goto('/internal');
      await expect(page.url()).toContain('/internal');
      await expect(page.locator('text=this is a special page')).toBeVisible();
    });
  });

  test.describe('User Experience and Accessibility', () => {
    test('should have proper loading states', async ({ page }) => {
      await mockAuthentication(page, 'external');

      // Mock slow API response
      await page.route('**/api/waitlist', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ isOnWaitlist: false }),
        });
      });

      await page.goto('/dashboard');

      // Should show loading spinner
      const loadingSpinner = page.locator('[data-testid="loading-spinner"], .animate-spin').first();
      await expect(loadingSpinner).toBeVisible();

      // Eventually shows content
      await expect(page.locator('text=Join the Waitlist')).toBeVisible({ timeout: 2000 });
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await mockAuthentication(page, 'external');

      await page.goto('/dashboard');
      await expect(page.locator('text=Join the Waitlist')).toBeVisible();

      // Focus and activate with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should activate the join functionality
      await expect(page.locator('text=You\'re on the waitlist.')).toBeVisible();
    });

    test('should have proper focus management in internal pages', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      await page.goto('/internal');

      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to activate waitlist button with keyboard
      const waitlistButton = page.locator('text=View Waitlist Entries');
      await waitlistButton.focus();
      await page.keyboard.press('Enter');

      await expect(page.url()).toContain('/internal/waitlist');
    });

    test('should maintain responsive design', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/internal/waitlist');

      await expect(page.locator('text=Waitlist Entries')).toBeVisible();

      // Table should be scrollable on mobile
      const table = page.locator('table');
      await expect(table).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      await expect(page.locator('text=Waitlist Entries')).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.reload();

      await expect(page.locator('text=Waitlist Entries')).toBeVisible();
    });
  });

  test.describe('Data Integrity and Error Handling', () => {
    test('should handle malformed API responses', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      // Mock malformed response
      await page.route('**/api/admin', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            invalidData: 'test',
            // Missing required fields
          }),
        });
      });

      await page.goto('/internal/waitlist');

      // Should handle gracefully - might show empty state or error
      // Exact behavior depends on implementation
      const hasError = await page.locator('text=Error loading waitlist data').isVisible();
      const hasEmpty = await page.locator('text=No users on waitlist yet').isVisible();

      expect(hasError || hasEmpty).toBeTruthy();
    });

    test('should filter waitlist users correctly', async ({ page }) => {
      await mockAuthentication(page, 'internal');

      // Mock mixed user data
      await page.route('**/api/admin', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalUsers: 3,
            waitlistUsers: 2,
            conversionRate: 67,
            users: [
              {
                id: '1',
                email: 'waitlist@example.com',
                name: 'On Waitlist',
                waitlist_status: true,
                waitlist_joined_at: '2024-01-15T10:00:00Z',
                created_at: '2024-01-10T10:00:00Z',
                auth_provider: 'google',
                last_login: '2024-01-20T10:00:00Z',
              },
              {
                id: '2',
                email: 'regular@example.com',
                name: 'Regular User',
                waitlist_status: false,
                waitlist_joined_at: null,
                created_at: '2024-01-11T10:00:00Z',
                auth_provider: 'email',
                last_login: '2024-01-18T10:00:00Z',
              },
              {
                id: '3',
                email: 'waitlist2@example.com',
                name: 'Also On Waitlist',
                waitlist_status: true,
                waitlist_joined_at: '2024-01-16T10:00:00Z',
                created_at: '2024-01-12T10:00:00Z',
                auth_provider: 'apple',
                last_login: null,
              },
            ],
          }),
        });
      });

      await page.goto('/internal/waitlist');

      // Should show only waitlist users
      await expect(page.locator('text=waitlist@example.com')).toBeVisible();
      await expect(page.locator('text=waitlist2@example.com')).toBeVisible();
      await expect(page.locator('text=regular@example.com')).not.toBeVisible();

      // Should show correct count
      await expect(page.locator('text=2 members')).toBeVisible();
    });

    test('should handle concurrent API requests', async ({ page }) => {
      await mockAuthentication(page, 'external');

      let requestCount = 0;
      await page.route('**/api/waitlist', async (route) => {
        requestCount++;
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ isOnWaitlist: false }),
          });
        } else if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          });
        }
      });

      await page.goto('/dashboard');
      await expect(page.locator('text=Join the Waitlist')).toBeVisible();

      // Click button multiple times quickly
      const joinButton = page.locator('text=Join the Waitlist');
      await joinButton.click();
      await joinButton.click();
      await joinButton.click();

      // Should handle gracefully and show success only once
      await expect(page.locator('text=You\'re on the waitlist.')).toBeVisible();
    });
  });
});