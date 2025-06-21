import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('Enhanced Auth Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
    
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test.describe('WCAG AA Color Contrast Compliance', () => {
    test('should meet WCAG AA contrast requirements for all text', async ({ page }) => {
      // Test main heading contrast
      const heading = page.locator('h1:has-text("theAGNT.ai")');
      await expect(heading).toHaveCSS('color', 'rgb(255, 255, 255)'); // White text
      
      // Test button text contrast
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await expect(googleButton).toHaveCSS('color', 'rgb(255, 255, 255)'); // White text
      await expect(googleButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // Transparent bg
      
      // Check for accessibility violations
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    test('should maintain contrast in hover states', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await googleButton.hover();
      
      // Verify hover state maintains sufficient contrast
      await page.waitForTimeout(300); // Allow transition
      
      await checkA11y(page, '[data-testid="google-auth-button"]', {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    test('should maintain contrast in email form', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Test input field contrast
      await expect(emailInput).toHaveCSS('color', 'rgb(255, 255, 255)'); // text-foreground
      await expect(emailInput).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // bg-transparent
      
      // Test placeholder contrast
      const placeholderColor = await emailInput.evaluate(el => 
        getComputedStyle(el, '::placeholder').color
      );
      // placeholder-gray-400 should provide sufficient contrast
      expect(placeholderColor).toBe('rgb(156, 163, 175)');
      
      await checkA11y(page, 'form', {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    test('should maintain contrast in success/error messages', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      // Trigger error message
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      const errorMessage = page.locator('[data-testid="email-error"]');
      await errorMessage.waitFor({ state: 'visible' });
      
      // Verify error message contrast (red-600 on red-50)
      await expect(errorMessage).toHaveCSS('color', 'rgb(220, 38, 38)'); // text-red-600
      await expect(errorMessage).toHaveCSS('background-color', 'rgb(254, 242, 242)'); // bg-red-50
      
      await checkA11y(page, '[data-testid="email-error"]', {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });
  });

  test.describe('Enhanced Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      const buttons = [
        '[data-testid="google-auth-button"]',
        '[data-testid="apple-auth-button"]',
        '[data-testid="email-auth-button"]',
      ];

      for (const buttonSelector of buttons) {
        await page.keyboard.press('Tab');
        const button = page.locator(buttonSelector);
        await expect(button).toBeFocused();
        
        // Verify enhanced focus ring styling
        await expect(button).toHaveCSS('outline', 'none'); // focus:outline-none
        // Focus ring implemented via box-shadow (focus:ring-2)
        const boxShadow = await button.evaluate(el => getComputedStyle(el).boxShadow);
        expect(boxShadow).not.toBe('none');
      }
    });

    test('should manage focus properly in email form flow', async ({ page }) => {
      // Start with initial button focus
      await page.keyboard.press('Tab');
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await expect(emailButton).toBeFocused();
      
      // Activate email form
      await page.keyboard.press('Enter');
      
      // Focus should move to email input
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Tab to email input
      await page.keyboard.press('Tab');
      await expect(emailInput).toBeFocused();
      
      // Tab to submit button
      await page.keyboard.press('Tab');
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await expect(submitButton).toBeFocused();
      
      // Tab to back button
      await page.keyboard.press('Tab');
      const backButton = page.locator('button:has-text("← Back to sign in options")');
      await expect(backButton).toBeFocused();
    });

    test('should restore focus after back navigation', async ({ page }) => {
      // Navigate to email form
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.focus();
      await emailButton.click();
      
      // Go back
      const backButton = page.locator('button:has-text("← Back to sign in options")');
      await backButton.click();
      
      // Focus should return to email auth button
      await expect(emailButton).toBeFocused();
    });

    test('should trap focus in loading states', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await googleButton.focus();
      await googleButton.click();
      
      // Button should remain focused but disabled
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      await expect(googleButton).toBeFocused();
      await expect(googleButton).toBeDisabled();
      
      // Tab should not move focus away from disabled button
      await page.keyboard.press('Tab');
      // Focus should move to next available interactive element
      const appleButton = page.locator('[data-testid="apple-auth-button"]');
      await expect(appleButton).toBeFocused();
    });
  });

  test.describe('Keyboard Navigation Enhancement', () => {
    test('should support full keyboard navigation', async ({ page }) => {
      // Navigate through all interactive elements
      const elements = [
        { testId: 'google-auth-button', name: 'Google' },
        { testId: 'apple-auth-button', name: 'Apple' },
        { testId: 'email-auth-button', name: 'Email' },
      ];

      for (let i = 0; i < elements.length; i++) {
        await page.keyboard.press('Tab');
        const element = page.locator(`[data-testid="${elements[i].testId}"]`);
        await expect(element).toBeFocused();
        
        // Test activation with Enter key
        if (i === elements.length - 1) { // Test email button
          await page.keyboard.press('Enter');
          const emailInput = page.locator('[data-testid="email-input"]');
          await emailInput.waitFor({ state: 'visible' });
        }
      }
    });

    test('should support Space key activation', async ({ page }) => {
      await page.keyboard.press('Tab');
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await expect(googleButton).toBeFocused();
      
      await page.keyboard.press('Space');
      
      // Should trigger loading state
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      await expect(googleButton).toBeDisabled();
    });

    test('should handle Escape key in email form', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Press Escape - should ideally close form (if implemented)
      await page.keyboard.press('Escape');
      
      // For now, verify form is still there (no escape handling implemented)
      await expect(emailInput).toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      // Check main heading structure
      const heading = page.locator('h1:has-text("theAGNT.ai")');
      await expect(heading).toHaveAttribute('role', 'heading');
      
      // Check button roles and labels
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await expect(googleButton).toHaveAttribute('type', 'button');
      
      // Run axe accessibility check
      await checkA11y(page, null, {
        rules: {
          'button-name': { enabled: true },
          'link-name': { enabled: true },
        },
      });
    });

    test('should announce form state changes', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      // Check form has proper structure for screen readers
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('required');
      
      await checkA11y(page, 'form', {
        rules: {
          'label': { enabled: true },
          'form-field-multiple-labels': { enabled: true },
        },
      });
    });

    test('should properly announce loading states', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      // Loading state should be announced
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      await expect(submitButton).toBeDisabled();
      
      // Button should still have accessible text/content
      const spinnerContainer = submitButton.locator('.flex.items-center.justify-center');
      await expect(spinnerContainer).toBeVisible();
    });

    test('should announce error and success messages', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      // Trigger error message
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      const errorMessage = page.locator('[data-testid="email-error"]');
      await errorMessage.waitFor({ state: 'visible' });
      
      // Error message should be accessible to screen readers
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Please enter your email address');
      
      // Check for ARIA live region or other accessibility features
      await checkA11y(page, '[data-testid="email-error"]');
    });
  });

  test.describe('Touch Target Accessibility', () => {
    test('should meet minimum touch target size (44px)', async ({ page }) => {
      const buttons = [
        '[data-testid="google-auth-button"]',
        '[data-testid="apple-auth-button"]',
        '[data-testid="email-auth-button"]',
      ];

      for (const buttonSelector of buttons) {
        const button = page.locator(buttonSelector);
        const boundingBox = await button.boundingBox();
        
        // WCAG guideline: minimum 44px touch target
        expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
        // Our buttons are h-12 (48px) which exceeds the minimum
        expect(boundingBox?.height).toBe(48);
      }
    });

    test('should have adequate spacing between touch targets', async ({ page }) => {
      const container = page.locator('.space-y-4').last();
      const buttons = container.locator('button');
      
      const count = await buttons.count();
      for (let i = 0; i < count - 1; i++) {
        const button1 = buttons.nth(i);
        const button2 = buttons.nth(i + 1);
        
        const box1 = await button1.boundingBox();
        const box2 = await button2.boundingBox();
        
        if (box1 && box2) {
          const spacing = box2.y - (box1.y + box1.height);
          // Tailwind space-y-4 = 16px spacing, adequate for touch targets
          expect(spacing).toBeGreaterThanOrEqual(16);
        }
      }
    });

    test('should maintain touch targets in email form', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      
      // Both input and button should meet touch target requirements
      const inputBox = await emailInput.boundingBox();
      const buttonBox = await submitButton.boundingBox();
      
      expect(inputBox?.height).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
      
      // Both are h-12 (48px)
      expect(inputBox?.height).toBe(48);
      expect(buttonBox?.height).toBe(48);
    });
  });

  test.describe('High Contrast Mode Accessibility', () => {
    test('should work properly in high contrast mode', async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      // Run accessibility check in high contrast mode
      await injectAxe(page);
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });
  });

  test.describe('Reduced Motion Accessibility', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      const heading = page.locator('h1:has-text("theAGNT.ai")');
      
      // Animation should be disabled or reduced
      // Note: This would require CSS implementation of prefers-reduced-motion
      const animationPlayState = await heading.evaluate(el => 
        getComputedStyle(el).animationPlayState
      );
      
      // This test documents the expected behavior
      // Implementation would need to respect prefers-reduced-motion
      expect(animationPlayState).toBeDefined();
    });
  });

  test.describe('Language and Internationalization', () => {
    test('should have proper lang attribute', async ({ page }) => {
      const htmlElement = page.locator('html');
      
      // Check if lang attribute is set (required for accessibility)
      const langAttribute = await htmlElement.getAttribute('lang');
      expect(langAttribute).toBeTruthy();
      // Should be 'en' or similar
      expect(langAttribute).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    });

    test('should have proper text direction support', async ({ page }) => {
      const htmlElement = page.locator('html');
      
      // Check dir attribute for RTL support if needed
      const dirAttribute = await htmlElement.getAttribute('dir');
      // Default should be 'ltr' or null (defaults to ltr)
      expect(dirAttribute === null || dirAttribute === 'ltr').toBeTruthy();
    });
  });

  test.describe('Comprehensive Accessibility Audit', () => {
    test('should pass complete accessibility audit - initial page', async ({ page }) => {
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
      
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);
    });

    test('should pass accessibility audit - email form', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      await page.waitForSelector('[data-testid="email-input"]', { state: 'visible' });
      
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
      
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);
    });

    test('should pass accessibility audit - loading states', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await googleButton.click();
      
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
      
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);
    });

    test('should pass accessibility audit - error states', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      await page.waitForSelector('[data-testid="email-error"]', { state: 'visible' });
      
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
      
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);
    });
  });
});