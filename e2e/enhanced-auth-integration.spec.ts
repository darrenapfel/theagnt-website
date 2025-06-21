import { test, expect } from '@playwright/test';

test.describe('Enhanced Auth Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
    await page.waitForTimeout(1000); // Allow breathing animation to settle
  });

  test.describe('Complete Google OAuth Flow', () => {
    test('should initiate Google OAuth with enhanced UI feedback', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      
      // Verify initial state with enhanced styling
      await expect(googleButton).toHaveText('Continue with Google');
      await expect(googleButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(googleButton).toHaveCSS('border-color', 'rgb(26, 26, 26)');
      
      // Click should trigger loading state immediately
      await googleButton.click();
      
      // Verify enhanced loading state
      await page.waitForSelector('.animate-spin', { state: 'visible', timeout: 1000 });
      
      const loadingSpinner = page.locator('.animate-spin');
      await expect(loadingSpinner).toHaveCSS('width', '16px');
      await expect(loadingSpinner).toHaveCSS('height', '16px');
      await expect(loadingSpinner).toHaveCSS('border-width', '2px');
      await expect(loadingSpinner).toHaveCSS('border-color', 'rgb(255, 255, 255) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)');
      
      // Button should be disabled with enhanced disabled styling
      await expect(googleButton).toBeDisabled();
      await expect(googleButton).toHaveCSS('opacity', '0.5');
      await expect(googleButton).toHaveCSS('cursor', 'not-allowed');
      
      // Should eventually redirect (mocked in tests)
      // In real scenario, this would redirect to Google OAuth
    });

    test('should show enhanced hover states before click', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      
      // Test hover styling
      await googleButton.hover();
      await page.waitForTimeout(300); // Allow transition
      
      // Hover should trigger background color change
      // Note: Testing actual computed styles for hover can be tricky
      // This test verifies the hover class is applied
      await expect(googleButton).toHaveClass(/hover:bg-charcoal/);
      
      // Focus should show enhanced focus ring
      await googleButton.focus();
      await expect(googleButton).toHaveClass(/focus:ring-2/);
      await expect(googleButton).toHaveClass(/focus:ring-charcoal/);
    });
  });

  test.describe('Complete Apple OAuth Flow', () => {
    test('should initiate Apple OAuth with consistent enhanced UI', async ({ page }) => {
      const appleButton = page.locator('[data-testid="apple-auth-button"]');
      
      // Verify enhanced Apple button styling matches Google
      await expect(appleButton).toHaveText('Continue with Apple');
      await expect(appleButton).toHaveCSS('height', '48px');
      await expect(appleButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      
      // Click and verify loading state
      await appleButton.click();
      
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      await expect(appleButton).toBeDisabled();
      
      // Loading spinner should be identical to Google button
      const spinner = page.locator('.animate-spin');
      await expect(spinner).toHaveCSS('animation-name', 'spin');
    });

    test('should maintain consistent focus management', async ({ page }) => {
      // Tab to Apple button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const appleButton = page.locator('[data-testid="apple-auth-button"]');
      await expect(appleButton).toBeFocused();
      
      // Verify enhanced focus styling
      await expect(appleButton).toHaveClass(/focus:outline-none/);
      await expect(appleButton).toHaveClass(/focus:ring-2/);
    });
  });

  test.describe('Complete Email Magic Link Flow', () => {
    test('should complete full email authentication flow with enhanced UI', async ({ page }) => {
      // Start with email button
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await expect(emailButton).toHaveText('Continue with Email');
      
      // Click to show enhanced email form
      await emailButton.click();
      
      // Verify enhanced form appearance
      const emailInput = page.locator('[data-testid="email-input"]');
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      
      await emailInput.waitFor({ state: 'visible' });
      
      // Test enhanced form styling
      await expect(emailInput).toHaveCSS('height', '48px');
      await expect(emailInput).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(emailInput).toHaveCSS('border-color', 'rgb(26, 26, 26)');
      
      await expect(submitButton).toHaveCSS('height', '48px');
      await expect(submitButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      
      // Test enhanced placeholder styling
      await expect(emailInput).toHaveAttribute('placeholder', 'Enter your email address');
      
      // Enter email with enhanced interaction
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
      
      // Test enhanced focus states
      await emailInput.focus();
      await expect(emailInput).toHaveClass(/focus:ring-2/);
      
      // Submit and verify enhanced loading state
      await submitButton.click();
      
      // Should show enhanced loading spinner
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      await expect(submitButton).toBeDisabled();
      
      // Input should also be disabled during loading
      await expect(emailInput).toBeDisabled();
      
      // Should show enhanced success message
      const successMessage = page.locator('[data-testid="email-sent-message"]');
      await successMessage.waitFor({ state: 'visible' });
      
      await expect(successMessage).toHaveText('Magic link sent! Check your email and click the link to sign in.');
      await expect(successMessage).toHaveCSS('background-color', 'rgb(240, 253, 244)');
      await expect(successMessage).toHaveCSS('color', 'rgb(22, 163, 74)');
      await expect(successMessage).toHaveCSS('border-color', 'rgb(187, 247, 208)');
    });

    test('should handle email validation with enhanced error styling', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      // Submit without email
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      // Should show enhanced validation error
      const errorMessage = page.locator('[data-testid="email-error"]');
      await errorMessage.waitFor({ state: 'visible' });
      
      await expect(errorMessage).toHaveText('Please enter your email address');
      await expect(errorMessage).toHaveCSS('background-color', 'rgb(254, 242, 242)');
      await expect(errorMessage).toHaveCSS('color', 'rgb(220, 38, 38)');
      await expect(errorMessage).toHaveCSS('border-color', 'rgb(254, 202, 202)');
      
      // Error should clear when entering valid email
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');
      await submitButton.click();
      
      await page.waitForTimeout(100); // Brief wait for state change
      await expect(errorMessage).not.toBeVisible();
    });

    test('should handle back navigation with enhanced state management', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      // Fill form
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');
      
      // Navigate back with enhanced back button
      const backButton = page.locator('button:has-text("← Back to sign in options")');
      await expect(backButton).toHaveCSS('color', 'rgb(107, 114, 128)');
      await expect(backButton).toHaveClass(/hover:text-foreground/);
      
      await backButton.click();
      
      // Should return to main auth screen
      await expect(emailButton).toBeVisible();
      await expect(emailButton).toHaveText('Continue with Email');
      
      // Form should be hidden
      await expect(emailInput).not.toBeVisible();
      
      // But email should be preserved when returning
      await emailButton.click();
      const emailInputReturned = page.locator('[data-testid="email-input"]');
      await emailInputReturned.waitFor({ state: 'visible' });
      await expect(emailInputReturned).toHaveValue('test@example.com');
    });
  });

  test.describe('Cross-Component Integration', () => {
    test('should maintain consistent styling across all auth methods', async ({ page }) => {
      const buttons = [
        { testId: 'google-auth-button', text: 'Continue with Google' },
        { testId: 'apple-auth-button', text: 'Continue with Apple' },
        { testId: 'email-auth-button', text: 'Continue with Email' },
      ];

      // Test all buttons have identical enhanced styling
      for (const button of buttons) {
        const element = page.locator(`[data-testid="${button.testId}"]`);
        
        await expect(element).toHaveText(button.text);
        await expect(element).toHaveCSS('height', '48px');
        await expect(element).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await expect(element).toHaveCSS('border-color', 'rgb(26, 26, 26)');
        await expect(element).toHaveCSS('color', 'rgb(255, 255, 255)');
        await expect(element).toHaveCSS('font-weight', '500');
        await expect(element).toHaveCSS('font-size', '16px');
      }
    });

    test('should handle rapid switching between auth methods', async ({ page }) => {
      // Quick switch between methods
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      const appleButton = page.locator('[data-testid="apple-auth-button"]');
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      
      // Hover effects should work properly
      await googleButton.hover();
      await appleButton.hover();
      await emailButton.hover();
      
      // Click email, then back, then try Google
      await emailButton.click();
      
      const backButton = page.locator('button:has-text("← Back to sign in options")');
      await backButton.waitFor({ state: 'visible' });
      await backButton.click();
      
      // Google button should still be functional
      await googleButton.click();
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      await expect(googleButton).toBeDisabled();
    });

    test('should maintain enhanced theme consistency across interactions', async ({ page }) => {
      // Test dark theme variables are consistent
      const rootStyles = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        return {
          background: styles.getPropertyValue('--background'),
          foreground: styles.getPropertyValue('--foreground'),
          charcoal: styles.getPropertyValue('--charcoal'),
          darkGray: styles.getPropertyValue('--dark-gray'),
        };
      });
      
      expect(rootStyles.background.trim()).toBe('#000000');
      expect(rootStyles.foreground.trim()).toBe('#ffffff');
      expect(rootStyles.charcoal.trim()).toBe('#1a1a1a');
      expect(rootStyles.darkGray.trim()).toBe('#2a2a2a');
      
      // Test that all interactive elements use theme colors
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const isVisible = await button.isVisible();
        
        if (isVisible) {
          // All buttons should use theme colors
          const color = await button.evaluate(el => getComputedStyle(el).color);
          const borderColor = await button.evaluate(el => getComputedStyle(el).borderColor);
          
          // Should use foreground color (white) for text
          expect(color).toBe('rgb(255, 255, 255)');
          
          // Should use charcoal for borders (where applicable)
          if (borderColor !== 'rgba(0, 0, 0, 0)') {
            expect(borderColor).toBe('rgb(26, 26, 26)');
          }
        }
      }
    });
  });

  test.describe('Enhanced Error Handling Integration', () => {
    test('should handle network errors with enhanced UI feedback', async ({ page }) => {
      // Intercept API calls to simulate network errors
      await page.route('/api/auth/magic-link', route => {
        route.abort('failed');
      });
      
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      // Should show enhanced error message
      const errorMessage = page.locator('[data-testid="email-error"]');
      await errorMessage.waitFor({ state: 'visible' });
      
      // Error styling should be enhanced
      await expect(errorMessage).toHaveCSS('background-color', 'rgb(254, 242, 242)');
      await expect(errorMessage).toHaveCSS('color', 'rgb(220, 38, 38)');
      await expect(errorMessage).toHaveCSS('padding', '12px');
      await expect(errorMessage).toHaveCSS('border-radius', '4px');
      
      // Form should remain functional after error
      await expect(submitButton).not.toBeDisabled();
      await expect(emailInput).not.toBeDisabled();
    });

    test('should handle server errors with enhanced feedback', async ({ page }) => {
      // Intercept API calls to simulate server errors
      await page.route('/api/auth/magic-link', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid email address format' }),
        });
      });
      
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('invalid-email');
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      // Should show server error with enhanced styling
      const errorMessage = page.locator('[data-testid="email-error"]');
      await errorMessage.waitFor({ state: 'visible' });
      
      await expect(errorMessage).toHaveText('Invalid email address format');
      await expect(errorMessage).toHaveCSS('background-color', 'rgb(254, 242, 242)');
    });
  });

  test.describe('Enhanced Accessibility Integration', () => {
    test('should maintain accessibility throughout complete auth flow', async ({ page }) => {
      // Test keyboard navigation through entire flow
      await page.keyboard.press('Tab');
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await expect(googleButton).toBeFocused();
      
      await page.keyboard.press('Tab');
      const appleButton = page.locator('[data-testid="apple-auth-button"]');
      await expect(appleButton).toBeFocused();
      
      await page.keyboard.press('Tab');
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await expect(emailButton).toBeFocused();
      
      // Activate email form with keyboard
      await page.keyboard.press('Enter');
      
      // Focus should move to form elements
      await page.keyboard.press('Tab');
      const emailInput = page.locator('[data-testid="email-input"]');
      await expect(emailInput).toBeFocused();
      
      // Continue through form
      await emailInput.type('test@example.com');
      await page.keyboard.press('Tab');
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await expect(submitButton).toBeFocused();
      
      // Submit with keyboard
      await page.keyboard.press('Enter');
      
      // Loading state should be accessible
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      await expect(submitButton).toBeDisabled();
      
      // Success message should be accessible
      const successMessage = page.locator('[data-testid="email-sent-message"]');
      await successMessage.waitFor({ state: 'visible' });
      await expect(successMessage).toBeVisible();
    });

    test('should announce state changes appropriately', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      
      // Trigger validation error
      await submitButton.click();
      
      const errorMessage = page.locator('[data-testid="email-error"]');
      await errorMessage.waitFor({ state: 'visible' });
      
      // Error should be visible and accessible
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Please enter your email address');
      
      // Fix error and submit
      await emailInput.fill('test@example.com');
      await submitButton.click();
      
      // Success should replace error
      await expect(errorMessage).not.toBeVisible();
      
      const successMessage = page.locator('[data-testid="email-sent-message"]');
      await successMessage.waitFor({ state: 'visible' });
      await expect(successMessage).toBeVisible();
    });
  });

  test.describe('Enhanced Performance Integration', () => {
    test('should maintain smooth animations during interactions', async ({ page }) => {
      // Test breathing animation continues during interactions
      const heading = page.locator('h1:has-text("theAGNT.ai")');
      
      const animationBefore = await heading.evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          animationName: styles.animationName,
          animationPlayState: styles.animationPlayState,
        };
      });
      
      expect(animationBefore.animationName).toContain('breathe');
      expect(animationBefore.animationPlayState).toBe('running');
      
      // Click button to trigger interaction
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await googleButton.click();
      
      // Animation should continue
      const animationAfter = await heading.evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          animationName: styles.animationName,
          animationPlayState: styles.animationPlayState,
        };
      });
      
      expect(animationAfter.animationName).toContain('breathe');
      expect(animationAfter.animationPlayState).toBe('running');
    });

    test('should handle rapid interactions smoothly', async ({ page }) => {
      // Rapid clicking should be handled gracefully
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      
      // Multiple rapid clicks
      await googleButton.click();
      await googleButton.click();
      await googleButton.click();
      
      // Should only show one loading state
      const spinners = page.locator('.animate-spin');
      const spinnerCount = await spinners.count();
      expect(spinnerCount).toBe(1);
      
      // Button should remain disabled
      await expect(googleButton).toBeDisabled();
    });
  });

  test.describe('Enhanced Mobile Integration', () => {
    test('should work seamlessly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      // Test touch interactions
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.tap();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Mobile keyboard should work
      await emailInput.tap();
      await emailInput.fill('test@example.com');
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.tap();
      
      // Loading state should work on mobile
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      await expect(submitButton).toBeDisabled();
      
      // Success message should be visible on mobile
      const successMessage = page.locator('[data-testid="email-sent-message"]');
      await successMessage.waitFor({ state: 'visible' });
      await expect(successMessage).toBeVisible();
    });
  });
});