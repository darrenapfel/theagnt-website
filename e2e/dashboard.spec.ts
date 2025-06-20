import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  // Note: These tests would need proper authentication setup
  // For now, they test the authenticated states assuming session exists

  test.describe('Authenticated User', () => {
    // In a real implementation, you'd set up authentication here
    // test.beforeEach(async ({ page }) => {
    //   // Setup authenticated session
    // });

    test.skip('shows waitlist join button for new users', async ({ page }) => {
      // This test is skipped because it requires Supabase setup
      await page.goto('/dashboard');

      await expect(page.getByText('theAGNT.ai')).toBeVisible();
      await expect(
        page.getByRole('button', { name: /join the waitlist/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /sign out/i })
      ).toBeVisible();
    });

    test.skip('shows confirmation message for waitlist members', async ({
      page,
    }) => {
      // This test is skipped because it requires Supabase setup
      // In a real test, you'd mock a user who's already on the waitlist
      await page.goto('/dashboard');

      await expect(page.getByText("You're on the waitlist.")).toBeVisible();
    });

    test.skip('allows admin to access admin panel', async ({ page }) => {
      // This test is skipped because it requires admin user setup
      await page.goto('/dashboard');

      await expect(page.getByRole('link', { name: /admin/i })).toBeVisible();

      await page.click('text=Admin');
      await expect(page).toHaveURL('/admin');
    });
  });

  test.describe('Admin Dashboard', () => {
    test.skip('displays user metrics and table', async ({ page }) => {
      // This test is skipped because it requires admin authentication
      await page.goto('/admin');

      await expect(page.getByText('theAGNT.ai Admin')).toBeVisible();
      await expect(page.getByText('Total Users')).toBeVisible();
      await expect(page.getByText('Waitlist Members')).toBeVisible();
      await expect(page.getByText('Conversion Rate')).toBeVisible();
      await expect(
        page.getByRole('button', { name: /export csv/i })
      ).toBeVisible();
    });
  });
});
