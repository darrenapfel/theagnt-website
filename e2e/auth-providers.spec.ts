/**
 * End-to-End Tests for Authentication Provider Flows
 * 
 * This test suite validates complete authentication flows for all providers.
 * These tests follow TDD principles and will initially FAIL to demonstrate
 * the current authentication issues before fixes are implemented.
 * 
 * Production URL: https://theagnt-website-darrens-projects-0443eb48.vercel.app/
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const PRODUCTION_URL = 'https://theagnt-website-darrens-projects-0443eb48.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

// Use production URL for these tests to validate actual deployment
const BASE_URL = process.env.TEST_PRODUCTION === 'true' ? PRODUCTION_URL : LOCAL_URL;

test.describe('Authentication Provider Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page for each test
    await page.goto(BASE_URL);
  });

  test.describe('Google OAuth Flow', () => {
    test('should redirect to Google OAuth with correct callback URL', async ({ page, context }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Wait for the Google sign-in button to be visible
      const googleButton = page.locator('[data-testid="google-auth-button"]').first();
      await expect(googleButton).toBeVisible();

      // Set up promise to catch the popup/redirect
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        googleButton.click()
      ]);

      // This test will FAIL initially due to Google OAuth redirect URI mismatch
      // The redirect should go to Google's OAuth endpoint
      await newPage.waitForLoadState('networkidle');
      const url = newPage.url();
      
      expect(url).toContain('accounts.google.com');
      expect(url).toContain('oauth/authorize');
      
      // Check that the callback URL includes the correct production domain
      const decodedUrl = decodeURIComponent(url);
      expect(decodedUrl).toContain(`${BASE_URL}/api/auth/callback/google`);
      
      await newPage.close();
    });

    test('should not show configuration error on Google OAuth click', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      const googleButton = page.locator('[data-testid="google-auth-button"]').first();
      await googleButton.click();
      
      // Wait a moment for any error messages
      await page.waitForTimeout(2000);
      
      // This test will FAIL initially if there are Google configuration errors
      const errorMessage = page.locator('text=configuration error');
      await expect(errorMessage).not.toBeVisible();
      
      const oauthError = page.locator('text=OAuth error');
      await expect(oauthError).not.toBeVisible();
    });

    test('should handle Google OAuth callback successfully', async ({ page }) => {
      // Mock a successful Google OAuth callback
      const callbackUrl = `${BASE_URL}/api/auth/callback/google?code=test_auth_code&state=test_state`;
      
      // Navigate directly to callback to test handling
      await page.goto(callbackUrl);
      
      // Should redirect to dashboard on successful authentication
      // This test will FAIL initially if callback handling is broken
      await page.waitForURL(/.*\/(dashboard|auth\/success)/);
      
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(dashboard|auth\/success)/);
    });
  });

  test.describe('Apple Sign-in Flow', () => {
    test('should open Apple Sign-in popup with correct configuration', async ({ page, context }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      const appleButton = page.locator('[data-testid="apple-auth-button"]').first();
      await expect(appleButton).toBeVisible();

      // Listen for new page/popup
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        appleButton.click()
      ]);

      // This test will FAIL initially due to Apple Sign-in configuration issues
      await popup.waitForLoadState('networkidle');
      const url = popup.url();
      
      expect(url).toContain('appleid.apple.com');
      expect(url).toContain('/auth/authorize');
      
      // Check for correct return URL configuration
      const decodedUrl = decodeURIComponent(url);
      expect(decodedUrl).toContain(`${BASE_URL}/api/auth/callback/apple`);
      
      await popup.close();
    });

    test('should not show "sign-in couldn\'t be completed" error', async ({ page, context }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      const appleButton = page.locator('[data-testid="apple-auth-button"]').first();
      
      try {
        const [popup] = await Promise.all([
          context.waitForEvent('page'),
          appleButton.click()
        ]);

        // Wait for the popup to load
        await popup.waitForLoadState('networkidle');
        
        // This test will FAIL initially if Apple shows completion error
        const errorText = popup.locator('text*=couldn\'t be completed');
        await expect(errorText).not.toBeVisible();
        
        const signInFailedText = popup.locator('text*=Sign in failed');
        await expect(signInFailedText).not.toBeVisible();
        
        await popup.close();
      } catch (error) {
        // If popup fails to open, that's also a test failure
        console.error('Apple Sign-in popup failed to open:', error);
        throw error;
      }
    });

    test('should handle Apple OAuth callback successfully', async ({ page }) => {
      // Mock a successful Apple OAuth callback
      const callbackUrl = `${BASE_URL}/api/auth/callback/apple`;
      
      // Create mock Apple callback data
      await page.goto(BASE_URL);
      await page.evaluate((url) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        
        const codeInput = document.createElement('input');
        codeInput.type = 'hidden';
        codeInput.name = 'code';
        codeInput.value = 'test_apple_code';
        form.appendChild(codeInput);
        
        const stateInput = document.createElement('input');
        stateInput.type = 'hidden';
        stateInput.name = 'state';
        stateInput.value = 'test_state';
        form.appendChild(stateInput);
        
        document.body.appendChild(form);
        form.submit();
      }, callbackUrl);
      
      // Should redirect to dashboard on successful authentication
      // This test will FAIL initially if Apple callback handling is broken
      await page.waitForURL(/.*\/(dashboard|auth\/success)/, { timeout: 10000 });
      
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(dashboard|auth\/success)/);
    });
  });

  test.describe('Email Magic Link Flow', () => {
    test('should display email input form when email button is clicked', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      const emailButton = page.locator('[data-testid="email-auth-button"]').first();
      await expect(emailButton).toBeVisible();
      
      await emailButton.click();
      
      // Should show email input form
      const emailInput = page.locator('[data-testid="email-input"]');
      await expect(emailInput).toBeVisible();
      
      const sendButton = page.locator('[data-testid="send-magic-link"]');
      await expect(sendButton).toBeVisible();
    });

    test('should send magic link successfully with valid email', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Click email auth button to show form
      const emailButton = page.locator('[data-testid="email-auth-button"]').first();
      await emailButton.click();
      
      // Fill in email address
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');
      
      // Click send magic link button
      const sendButton = page.locator('[data-testid="send-magic-link"]');
      await sendButton.click();
      
      // This test will FAIL initially due to magic link email sending issues
      const successMessage = page.locator('[data-testid="email-sent-message"]');
      await expect(successMessage).toBeVisible({ timeout: 10000 });
      
      const messageText = await successMessage.textContent();
      expect(messageText).toContain('Magic link sent');
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Click email auth button to show form
      const emailButton = page.locator('[data-testid="email-auth-button"]').first();
      await emailButton.click();
      
      // Fill in invalid email
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('invalid-email');
      
      // Click send magic link button
      const sendButton = page.locator('[data-testid="send-magic-link"]');
      await sendButton.click();
      
      // Should show validation error
      const errorMessage = page.locator('[data-testid="email-error"]');
      await expect(errorMessage).toBeVisible();
      
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('email');
    });

    test('should show error when email is empty', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Click email auth button to show form
      const emailButton = page.locator('[data-testid="email-auth-button"]').first();
      await emailButton.click();
      
      // Click send without entering email
      const sendButton = page.locator('[data-testid="send-magic-link"]');
      await sendButton.click();
      
      // Should show required field error
      const errorMessage = page.locator('[data-testid="email-error"]');
      await expect(errorMessage).toBeVisible();
      
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('enter your email');
    });

    test('should handle magic link API failure gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Mock API failure by intercepting the request
      await page.route('/api/auth/magic-link', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to send magic link' })
        });
      });
      
      // Click email auth button to show form
      const emailButton = page.locator('[data-testid="email-auth-button"]').first();
      await emailButton.click();
      
      // Fill in email and submit
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');
      
      const sendButton = page.locator('[data-testid="send-magic-link"]');
      await sendButton.click();
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="email-error"]');
      await expect(errorMessage).toBeVisible();
      
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('Failed to send magic link');
    });

    test('should process magic link click successfully', async ({ page }) => {
      // Mock a magic link with proper tokens
      const magicLinkUrl = `${BASE_URL}/api/auth/callback/credentials?token=test_magic_token&type=magiclink`;
      
      await page.goto(magicLinkUrl);
      
      // This test will FAIL initially if magic link processing is broken
      await page.waitForURL(/.*\/(dashboard|auth\/success)/, { timeout: 10000 });
      
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(dashboard|auth\/success)/);
    });
  });

  test.describe('Authentication State Management', () => {
    test('should redirect unauthenticated users from protected routes', async ({ page }) => {
      // Try to access dashboard directly
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Should be redirected to sign-in page
      await page.waitForURL(/.*\/auth\/signin/);
      expect(page.url()).toContain('/auth/signin');
    });

    test('should redirect unauthenticated users from admin routes', async ({ page }) => {
      // Try to access admin directly
      await page.goto(`${BASE_URL}/admin`);
      
      // Should be redirected to sign-in page
      await page.waitForURL(/.*\/auth\/signin/);
      expect(page.url()).toContain('/auth/signin');
    });

    test('should maintain authentication state across page refreshes', async ({ page }) => {
      // This test would require a valid session - placeholder for when auth is working
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Add mock authentication cookie
      await page.context().addCookies([{
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: new URL(BASE_URL).hostname,
        path: '/'
      }]);
      
      await page.goto(`${BASE_URL}/dashboard`);
      
      // If authentication is working, should stay on dashboard
      await page.waitForTimeout(2000);
      
      // This assertion will depend on the auth implementation
      const currentUrl = page.url();
      expect(currentUrl).toContain('dashboard');
    });
  });

  test.describe('Error Page Handling', () => {
    test('should display authentication errors properly', async ({ page }) => {
      // Navigate to error page with OAuth error
      await page.goto(`${BASE_URL}/auth/error?error=OAuthCallbackError`);
      
      // Should display user-friendly error message
      const errorHeading = page.locator('h1');
      await expect(errorHeading).toBeVisible();
      
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      
      // Should provide link back to sign-in
      const signInLink = page.locator('a[href*="/auth/signin"]');
      await expect(signInLink).toBeVisible();
    });

    test('should handle configuration errors gracefully', async ({ page }) => {
      // Navigate to error page with configuration error
      await page.goto(`${BASE_URL}/auth/error?error=Configuration`);
      
      // Should display configuration error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      
      const messageText = await errorMessage.textContent();
      expect(messageText?.toLowerCase()).toContain('configuration');
    });
  });

  test.describe('Accessibility and Mobile Responsiveness', () => {
    test('should be accessible with keyboard navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Test keyboard navigation through auth buttons
      await page.keyboard.press('Tab');
      let focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(['google-auth-button', 'apple-auth-button', 'email-auth-button']).toContain(focused);
      
      await page.keyboard.press('Tab');
      focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(['google-auth-button', 'apple-auth-button', 'email-auth-button']).toContain(focused);
      
      // Should be able to activate with Enter or Space
      await page.keyboard.press('Enter');
      // Test that the button action is triggered
    });

    test('should work properly on mobile devices', async ({ page, browserName }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // All auth buttons should be visible and properly sized
      const googleButton = page.locator('[data-testid="google-auth-button"]').first();
      const appleButton = page.locator('[data-testid="apple-auth-button"]').first();
      const emailButton = page.locator('[data-testid="email-auth-button"]').first();
      
      await expect(googleButton).toBeVisible();
      await expect(appleButton).toBeVisible();
      await expect(emailButton).toBeVisible();
      
      // Buttons should be properly sized for mobile
      const googleButtonBox = await googleButton.boundingBox();
      expect(googleButtonBox?.height).toBeGreaterThan(40);
      expect(googleButtonBox?.width).toBeGreaterThan(200);
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Check that auth buttons have proper accessibility attributes
      const googleButton = page.locator('[data-testid="google-auth-button"]').first();
      const appleButton = page.locator('[data-testid="apple-auth-button"]').first();
      const emailButton = page.locator('[data-testid="email-auth-button"]').first();
      
      await expect(googleButton).toHaveAttribute('role', 'button');
      await expect(appleButton).toHaveAttribute('role', 'button');
      await expect(emailButton).toHaveAttribute('role', 'button');
      
      // Check for proper button text/labels
      await expect(googleButton).toContainText('Google');
      await expect(appleButton).toContainText('Apple');
      await expect(emailButton).toContainText('Email');
    });
  });

  test.describe('Production Environment Tests', () => {
    test.skip(BASE_URL === LOCAL_URL, 'Production-only test');
    
    test('should use HTTPS in production', async ({ page }) => {
      await page.goto(BASE_URL);
      expect(page.url()).toMatch(/^https:/);
    });

    test('should have proper security headers in production', async ({ page }) => {
      const response = await page.goto(BASE_URL);
      
      expect(response?.headers()['strict-transport-security']).toBeDefined();
      expect(response?.headers()['x-frame-options']).toBeDefined();
      expect(response?.headers()['x-content-type-options']).toBeDefined();
    });

    test('should load authentication assets properly in production', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`);
      
      // Check that all critical resources load successfully
      const responses = [];
      page.on('response', response => responses.push(response));
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should not have any failed resource loads
      const failedResponses = responses.filter(r => r.status() >= 400);
      expect(failedResponses.length).toBe(0);
    });
  });
});