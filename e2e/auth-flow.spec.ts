import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('displays landing page with logo and auth buttons', async ({ page }) => {
    await page.goto('/');

    // Check logo is displayed
    await expect(page.getByText('theAGNT.ai')).toBeVisible();

    // Check auth buttons are present
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /continue with apple/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /continue with email/i })
    ).toBeVisible();
  });

  test('redirects unauthenticated users to signin when accessing dashboard', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Should be redirected to auth page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('redirects unauthenticated users to signin when accessing admin', async ({
    page,
  }) => {
    await page.goto('/admin');

    // Should be redirected to auth page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('landing page has proper dark theme styling', async ({ page }) => {
    await page.goto('/');

    // Check dark background
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    // Check logo text color
    const logo = page.getByText('theAGNT.ai');
    await expect(logo).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('auth buttons have proper hover states', async ({ page }) => {
    await page.goto('/');

    const googleButton = page.getByRole('button', {
      name: /continue with google/i,
    });

    // Check initial state
    await expect(googleButton).toBeVisible();

    // Hover and check state change
    await googleButton.hover();
    // Note: In a real test, you'd check for specific CSS changes
    // This is a placeholder for hover state testing
  });
});
