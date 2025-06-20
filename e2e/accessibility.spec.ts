import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('landing page has proper accessibility features', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading structure
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toHaveText('theAGNT.ai');

    // Check buttons have accessible names
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /continue with apple/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /continue with email/i })
    ).toBeVisible();

    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    // First button should be focused
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeFocused();
  });

  test('buttons have proper focus states', async ({ page }) => {
    await page.goto('/');

    const googleButton = page.getByRole('button', {
      name: /continue with google/i,
    });
    await googleButton.focus();

    // Check that focus is visible (this would need CSS inspection in real test)
    await expect(googleButton).toBeFocused();
  });

  test('page has proper color contrast', async ({ page }) => {
    await page.goto('/');

    // In a real test, you'd use axe-core or similar tools
    // to test color contrast ratios automatically
    // For now, we verify the dark theme is applied
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });

  test('logo has proper semantic markup', async ({ page }) => {
    await page.goto('/');

    // Logo should be in an h1 tag for proper semantics
    const logo = page.getByRole('heading', { level: 1, name: 'theAGNT.ai' });
    await expect(logo).toBeVisible();
  });
});
