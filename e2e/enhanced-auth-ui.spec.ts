import { test, expect, type Page } from '@playwright/test';

test.describe('Enhanced Auth UI - Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Wait for page to fully load including animations
    await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
    await page.waitForTimeout(1000); // Allow breathing animation to settle
  });

  test.describe('Initial Page Design', () => {
    test('should match Vercel-style sign-in page design', async ({ page }) => {
      // Take full page screenshot for visual regression
      await expect(page).toHaveScreenshot('enhanced-signin-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should render enhanced button designs correctly', async ({ page }) => {
      const authContainer = page.locator('.space-y-4').last();
      
      await expect(authContainer).toHaveScreenshot('enhanced-auth-buttons.png', {
        animations: 'disabled',
      });
    });

    test('should display proper typography and branding', async ({ page }) => {
      const heading = page.locator('h1:has-text("theAGNT.ai")');
      
      // Verify enhanced typography
      await expect(heading).toHaveCSS('font-size', '60px'); // text-6xl
      await expect(heading).toHaveCSS('font-weight', '200'); // font-thin
      await expect(heading).toHaveCSS('margin-bottom', '48px'); // mb-12
      
      await expect(heading).toHaveScreenshot('enhanced-branding.png');
    });
  });

  test.describe('Button Visual States', () => {
    test('should show correct default button styling', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      
      // Verify Vercel-style button appearance
      await expect(googleButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // bg-transparent
      await expect(googleButton).toHaveCSS('border-color', 'rgb(26, 26, 26)'); // border-charcoal
      await expect(googleButton).toHaveCSS('color', 'rgb(255, 255, 255)'); // text-foreground
      await expect(googleButton).toHaveCSS('height', '48px'); // h-12
      
      await expect(googleButton).toHaveScreenshot('enhanced-button-default.png');
    });

    test('should show enhanced hover states', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      
      // Test hover state
      await googleButton.hover();
      await page.waitForTimeout(300); // Allow transition
      
      await expect(googleButton).toHaveScreenshot('enhanced-button-hover.png');
    });

    test('should show enhanced focus states for keyboard navigation', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      
      // Focus with keyboard
      await page.keyboard.press('Tab');
      await expect(googleButton).toBeFocused();
      
      // Verify enhanced focus ring
      await expect(googleButton).toHaveCSS('outline', 'none'); // focus:outline-none
      
      await expect(googleButton).toHaveScreenshot('enhanced-button-focus.png');
    });

    test('should show enhanced loading states', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      
      // Click to trigger loading state
      await googleButton.click();
      
      // Wait for loading spinner to appear
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      
      const loadingButton = page.locator('[data-testid="google-auth-button"]');
      await expect(loadingButton).toHaveScreenshot('enhanced-button-loading.png');
    });
  });

  test.describe('Email Form Enhanced UI', () => {
    test('should show enhanced email form design', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      // Wait for form animation to complete
      await page.waitForSelector('[data-testid="email-input"]', { state: 'visible' });
      await page.waitForTimeout(300);
      
      const emailForm = page.locator('.space-y-4').first();
      await expect(emailForm).toHaveScreenshot('enhanced-email-form.png');
    });

    test('should show enhanced input field styling', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Verify enhanced input styling
      await expect(emailInput).toHaveCSS('height', '48px'); // h-12
      await expect(emailInput).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // bg-transparent
      await expect(emailInput).toHaveCSS('border-color', 'rgb(26, 26, 26)'); // border-charcoal
      
      await expect(emailInput).toHaveScreenshot('enhanced-email-input.png');
    });

    test('should show enhanced input focus state', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.click();
      await page.waitForTimeout(200); // Allow focus transition
      
      await expect(emailInput).toHaveScreenshot('enhanced-email-input-focus.png');
    });

    test('should show enhanced submit button in email form', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.waitFor({ state: 'visible' });
      
      // Verify matching button styling with main auth buttons
      await expect(submitButton).toHaveCSS('height', '48px'); // h-12
      await expect(submitButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // bg-transparent
      
      await expect(submitButton).toHaveScreenshot('enhanced-submit-button.png');
    });

    test('should show enhanced loading state in email form', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      // Wait for loading spinner
      await page.waitForSelector('.animate-spin', { state: 'visible' });
      
      await expect(submitButton).toHaveScreenshot('enhanced-email-submit-loading.png');
    });
  });

  test.describe('Message Styling', () => {
    test('should show enhanced success message styling', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');
      
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      // Wait for success message
      const successMessage = page.locator('[data-testid="email-sent-message"]');
      await successMessage.waitFor({ state: 'visible' });
      
      // Verify enhanced success styling
      await expect(successMessage).toHaveCSS('background-color', 'rgb(240, 253, 244)'); // bg-green-50
      await expect(successMessage).toHaveCSS('border-color', 'rgb(187, 247, 208)'); // border-green-200
      await expect(successMessage).toHaveCSS('color', 'rgb(22, 163, 74)'); // text-green-600
      
      await expect(successMessage).toHaveScreenshot('enhanced-success-message.png');
    });

    test('should show enhanced error message styling', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      // Submit without email to trigger validation error
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      const errorMessage = page.locator('[data-testid="email-error"]');
      await errorMessage.waitFor({ state: 'visible' });
      
      // Verify enhanced error styling
      await expect(errorMessage).toHaveCSS('background-color', 'rgb(254, 242, 242)'); // bg-red-50
      await expect(errorMessage).toHaveCSS('border-color', 'rgb(254, 202, 202)'); // border-red-200
      await expect(errorMessage).toHaveCSS('color', 'rgb(220, 38, 38)'); // text-red-600
      
      await expect(errorMessage).toHaveScreenshot('enhanced-error-message.png');
    });
  });

  test.describe('Responsive Design', () => {
    test('should render correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      await expect(page).toHaveScreenshot('enhanced-signin-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should render correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      await expect(page).toHaveScreenshot('enhanced-signin-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should render correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      await expect(page).toHaveScreenshot('enhanced-signin-desktop.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should maintain button proportions across devices', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/auth/signin');
        await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
        
        const googleButton = page.locator('[data-testid="google-auth-button"]');
        
        // Verify consistent height across devices
        const boundingBox = await googleButton.boundingBox();
        expect(boundingBox?.height).toBe(48); // h-12 = 48px
        
        await expect(googleButton).toHaveScreenshot(`enhanced-button-${viewport.name}.png`);
      }
    });
  });

  test.describe('Animation & Micro-interactions', () => {
    test('should show proper breathing animation on logo', async ({ page }) => {
      const logo = page.locator('h1:has-text("theAGNT.ai")');
      
      // Verify animation is applied
      const animationName = await logo.evaluate(el => 
        getComputedStyle(el).animationName
      );
      expect(animationName).toContain('breathe');
      
      // Test animation duration
      const animationDuration = await logo.evaluate(el => 
        getComputedStyle(el).animationDuration
      );
      expect(animationDuration).toBe('4s');
    });

    test('should show smooth button transitions', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      
      // Verify transition properties
      const transition = await googleButton.evaluate(el => 
        getComputedStyle(el).transition
      );
      expect(transition).toContain('200ms'); // duration-200
      expect(transition).toContain('ease-out');
    });

    test('should show enhanced spinner animation', async ({ page }) => {
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await googleButton.click();
      
      const spinner = page.locator('.animate-spin');
      await spinner.waitFor({ state: 'visible' });
      
      // Verify spinner styling
      await expect(spinner).toHaveCSS('width', '16px'); // w-4
      await expect(spinner).toHaveCSS('height', '16px'); // h-4
      await expect(spinner).toHaveCSS('border-width', '2px'); // border-2
      
      // Test animation
      const animationName = await spinner.evaluate(el => 
        getComputedStyle(el).animationName
      );
      expect(animationName).toContain('spin');
    });
  });

  test.describe('Dark Theme Consistency', () => {
    test('should maintain dark theme across all UI elements', async ({ page }) => {
      // Verify root color variables
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
    });

    test('should show consistent dark theme in email form', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Verify dark theme consistency
      await expect(emailInput).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // bg-transparent
      await expect(emailInput).toHaveCSS('color', 'rgb(255, 255, 255)'); // text-foreground
      
      const form = page.locator('form');
      await expect(form).toHaveScreenshot('enhanced-dark-theme-form.png');
    });
  });

  test.describe('Provider Button Consistency', () => {
    test('should show identical styling across all provider buttons', async ({ page }) => {
      const buttons = {
        google: page.locator('[data-testid="google-auth-button"]'),
        apple: page.locator('[data-testid="apple-auth-button"]'),  
        email: page.locator('[data-testid="email-auth-button"]'),
      };

      const buttonContainer = page.locator('.space-y-4').last();
      
      // Take screenshot of all buttons together
      await expect(buttonContainer).toHaveScreenshot('enhanced-all-provider-buttons.png');
      
      // Verify each button has identical styling classes
      for (const [provider, button] of Object.entries(buttons)) {
        await expect(button).toHaveCSS('height', '48px');
        await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await expect(button).toHaveCSS('border-color', 'rgb(26, 26, 26)');
        await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
        
        await expect(button).toHaveScreenshot(`enhanced-${provider}-button.png`);
      }
    });
  });

  test.describe('Back Button Enhancement', () => {
    test('should show enhanced back button design', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const backButton = page.locator('button:has-text("← Back to sign in options")');
      await backButton.waitFor({ state: 'visible' });
      
      // Verify enhanced styling
      await expect(backButton).toHaveCSS('color', 'rgb(107, 114, 128)'); // text-gray-500
      await expect(backButton).toHaveCSS('font-size', '14px'); // text-sm
      
      await expect(backButton).toHaveScreenshot('enhanced-back-button.png');
    });

    test('should show back button hover state', async ({ page }) => {
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const backButton = page.locator('button:has-text("← Back to sign in options")');
      await backButton.hover();
      await page.waitForTimeout(200); // Allow transition
      
      await expect(backButton).toHaveScreenshot('enhanced-back-button-hover.png');
    });
  });

  test.describe('High Contrast Mode Support', () => {
    test('should work in forced-colors mode', async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      await expect(page).toHaveScreenshot('enhanced-signin-high-contrast.png', {
        fullPage: true,
      });
    });
  });
});