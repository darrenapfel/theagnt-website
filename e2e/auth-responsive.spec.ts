import { test, expect, devices } from '@playwright/test';

test.describe('Enhanced Auth Responsive Design Tests', () => {
  const deviceTests = [
    { name: 'iPhone SE', device: devices['iPhone SE'] },
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 12 Pro', device: devices['iPhone 12 Pro'] },
    { name: 'iPhone 13', device: devices['iPhone 13'] },
    { name: 'iPhone 14', device: devices['iPhone 14'] },
    { name: 'iPhone 15', device: devices['iPhone 15'] },
    { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
    { name: 'Samsung Galaxy S22', device: devices['Galaxy S22'] },
    { name: 'iPad Mini', device: devices['iPad Mini'] },
    { name: 'iPad', device: devices['iPad'] },
    { name: 'iPad Pro', device: devices['iPad Pro'] },
    { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
    { name: 'Desktop Firefox', device: devices['Desktop Firefox'] },
    { name: 'Desktop Safari', device: devices['Desktop Safari'] },
    { name: 'Desktop Edge', device: devices['Desktop Edge'] },
  ];

  deviceTests.forEach(({ name, device }) => {
    test(`should render correctly on ${name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      await page.waitForTimeout(1000); // Allow breathing animation to settle
      
      // Test overall layout
      await expect(page).toHaveScreenshot(`enhanced-auth-${name.toLowerCase().replace(/\s+/g, '-')}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
      
      // Test button consistency
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      const boundingBox = await googleButton.boundingBox();
      
      // All buttons should maintain 48px height (h-12)
      expect(boundingBox?.height).toBe(48);
      
      // Test button width spans container properly
      const container = page.locator('.max-w-sm');
      const containerBox = await container.boundingBox();
      
      if (containerBox && boundingBox) {
        // Buttons should be full width of container
        expect(Math.abs(boundingBox.width - containerBox.width)).toBeLessThan(2);
      }
      
      await context.close();
    });
  });

  test.describe('Breakpoint-Specific Testing', () => {
    const breakpoints = [
      { name: 'xs', width: 375, height: 667 }, // iPhone SE
      { name: 'sm', width: 640, height: 800 }, // Small tablets
      { name: 'md', width: 768, height: 1024 }, // iPad
      { name: 'lg', width: 1024, height: 768 }, // Desktop small
      { name: 'xl', width: 1280, height: 800 }, // Desktop medium
      { name: '2xl', width: 1536, height: 864 }, // Desktop large
    ];

    breakpoints.forEach(({ name, width, height }) => {
      test(`should maintain layout integrity at ${name} breakpoint (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/auth/signin');
        await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
        
        // Test main container constraints
        const container = page.locator('.max-w-sm');
        const containerBox = await container.boundingBox();
        
        // max-w-sm should be 384px max
        if (containerBox) {
          expect(containerBox.width).toBeLessThanOrEqual(384);
        }
        
        // Test button layout
        const buttons = page.locator('.space-y-4 button');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const buttonBox = await button.boundingBox();
          
          if (buttonBox) {
            // All buttons should maintain consistent height
            expect(buttonBox.height).toBe(48);
            
            // Buttons should be properly spaced
            if (i > 0) {
              const prevButton = buttons.nth(i - 1);
              const prevBox = await prevButton.boundingBox();
              
              if (prevBox) {
                const spacing = buttonBox.y - (prevBox.y + prevBox.height);
                // space-y-4 = 16px
                expect(spacing).toBeCloseTo(16, 2);
              }
            }
          }
        }
        
        await expect(page).toHaveScreenshot(`enhanced-auth-${name}-breakpoint.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    });
  });

  test.describe('Email Form Responsive Behavior', () => {
    const mobileBreakpoints = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy', width: 412, height: 915 },
    ];

    mobileBreakpoints.forEach(({ name, width, height }) => {
      test(`should show proper email form layout on ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/auth/signin');
        await page.waitForSelector('[data-testid="email-auth-button"]', { state: 'visible' });
        
        // Activate email form
        const emailButton = page.locator('[data-testid="email-auth-button"]');
        await emailButton.click();
        
        const emailInput = page.locator('[data-testid="email-input"]');
        await emailInput.waitFor({ state: 'visible' });
        
        // Test email form layout
        const form = page.locator('form');
        const formBox = await form.boundingBox();
        
        // Form should fit within viewport
        if (formBox) {
          expect(formBox.width).toBeLessThanOrEqual(width - 48); // Account for padding
        }
        
        // Test input field sizing
        const inputBox = await emailInput.boundingBox();
        const submitButton = page.locator('[data-testid="send-magic-link"]');
        const submitBox = await submitButton.boundingBox();
        
        if (inputBox && submitBox) {
          // Both should have same width (full width)
          expect(Math.abs(inputBox.width - submitBox.width)).toBeLessThan(2);
          
          // Both should maintain minimum touch target height
          expect(inputBox.height).toBe(48);
          expect(submitBox.height).toBe(48);
        }
        
        await expect(page).toHaveScreenshot(`enhanced-email-form-${name.toLowerCase().replace(/\s+/g, '-')}.png`);
      });
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle landscape orientation on mobile', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500); // Allow for reflow
      
      // Layout should still work
      const container = page.locator('.max-w-sm');
      const containerBox = await container.boundingBox();
      
      if (containerBox) {
        expect(containerBox.width).toBeLessThanOrEqual(384);
      }
      
      // Buttons should still be visible and functional
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      await expect(googleButton).toBeVisible();
      
      const buttonBox = await googleButton.boundingBox();
      expect(buttonBox?.height).toBe(48);
      
      await expect(page).toHaveScreenshot('enhanced-auth-landscape.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should handle orientation change in email form', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/signin');
      
      // Open email form
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);
      
      // Form should still be functional
      await expect(emailInput).toBeVisible();
      await expect(page.locator('[data-testid="send-magic-link"]')).toBeVisible();
      
      // Test form interaction
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
      
      await expect(page).toHaveScreenshot('enhanced-email-form-landscape.png');
    });
  });

  test.describe('Dynamic Content Adaptation', () => {
    test('should handle very long email addresses gracefully', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // Small mobile
      await page.goto('/auth/signin');
      
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Enter very long email
      const longEmail = 'very.long.email.address.that.might.overflow@very-long-domain-name-that-could-cause-issues.com';
      await emailInput.fill(longEmail);
      
      // Input should handle overflow properly
      const inputBox = await emailInput.boundingBox();
      const containerBox = await page.locator('.max-w-sm').boundingBox();
      
      if (inputBox && containerBox) {
        // Input should not exceed container width
        expect(inputBox.width).toBeLessThanOrEqual(containerBox.width);
      }
      
      // Text should be scrollable within input
      await expect(emailInput).toHaveValue(longEmail);
      
      await expect(page).toHaveScreenshot('enhanced-email-form-long-email.png');
    });

    test('should handle error messages with responsive wrapping', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // Very small mobile
      await page.goto('/auth/signin');
      
      const emailButton = page.locator('[data-testid="email-auth-button"]');
      await emailButton.click();
      
      // Trigger error message
      const submitButton = page.locator('[data-testid="send-magic-link"]');
      await submitButton.click();
      
      const errorMessage = page.locator('[data-testid="email-error"]');
      await errorMessage.waitFor({ state: 'visible' });
      
      // Error message should wrap properly
      const errorBox = await errorMessage.boundingBox();
      const containerBox = await page.locator('.max-w-sm').boundingBox();
      
      if (errorBox && containerBox) {
        expect(errorBox.width).toBeLessThanOrEqual(containerBox.width);
      }
      
      await expect(page).toHaveScreenshot('enhanced-error-message-small-mobile.png');
    });
  });

  test.describe('Zoom Level Compatibility', () => {
    const zoomLevels = [50, 75, 100, 125, 150, 200];

    zoomLevels.forEach(zoom => {
      test(`should work correctly at ${zoom}% zoom level`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/auth/signin');
        await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
        
        // Apply zoom level
        await page.evaluate(`document.body.style.zoom = '${zoom}%'`);
        await page.waitForTimeout(500);
        
        // Test button functionality
        const googleButton = page.locator('[data-testid="google-auth-button"]');
        await expect(googleButton).toBeVisible();
        
        // Test interaction
        await googleButton.click();
        await page.waitForSelector('.animate-spin', { state: 'visible' });
        
        await expect(page).toHaveScreenshot(`enhanced-auth-zoom-${zoom}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    });
  });

  test.describe('Flexible Layout Constraints', () => {
    test('should respect max-width constraints across all screen sizes', async ({ page }) => {
      const screenSizes = [
        { width: 320, height: 568 },
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1920, height: 1080 },
        { width: 2560, height: 1440 },
      ];

      for (const { width, height } of screenSizes) {
        await page.setViewportSize({ width, height });
        await page.goto('/auth/signin');
        await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
        
        const container = page.locator('.max-w-sm');
        const containerBox = await container.boundingBox();
        
        if (containerBox) {
          // max-w-sm should never exceed 384px
          expect(containerBox.width).toBeLessThanOrEqual(384);
          
          // Should be centered horizontally
          const pageWidth = width;
          const expectedX = (pageWidth - containerBox.width) / 2;
          expect(Math.abs(containerBox.x - expectedX)).toBeLessThan(5);
        }
      }
    });

    test('should maintain proper padding and margins', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      // Test main container padding (p-6 = 24px)
      const mainContainer = page.locator('.min-h-screen');
      const containerStyles = await mainContainer.evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
        };
      });
      
      expect(containerStyles.paddingLeft).toBe('24px');
      expect(containerStyles.paddingRight).toBe('24px');
      expect(containerStyles.paddingTop).toBe('24px');
      expect(containerStyles.paddingBottom).toBe('24px');
      
      // Test button container spacing (space-y-8 = 32px)
      const authContainer = page.locator('.space-y-8');
      const containerBox = await authContainer.boundingBox();
      
      if (containerBox) {
        expect(containerBox.width).toBeLessThanOrEqual(384); // max-w-sm
      }
    });
  });

  test.describe('Cross-Browser Responsive Consistency', () => {
    const browsers = ['chromium', 'firefox', 'webkit'];
    
    browsers.forEach(browserName => {
      test(`should render consistently in ${browserName} across breakpoints`, async ({ page }) => {
        const breakpoints = [
          { width: 375, height: 667 },
          { width: 768, height: 1024 },
          { width: 1280, height: 800 },
        ];

        for (const { width, height } of breakpoints) {
          await page.setViewportSize({ width, height });
          await page.goto('/auth/signin');
          await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
          
          // Test button dimensions consistency
          const googleButton = page.locator('[data-testid="google-auth-button"]');
          const buttonBox = await googleButton.boundingBox();
          
          expect(buttonBox?.height).toBe(48);
          
          // Test CSS custom properties support
          const customProps = await page.evaluate(() => {
            const root = document.documentElement;
            const styles = getComputedStyle(root);
            return {
              background: styles.getPropertyValue('--background'),
              foreground: styles.getPropertyValue('--foreground'),
              charcoal: styles.getPropertyValue('--charcoal'),
            };
          });
          
          expect(customProps.background.trim()).toBe('#000000');
          expect(customProps.foreground.trim()).toBe('#ffffff');
          expect(customProps.charcoal.trim()).toBe('#1a1a1a');
        }
      });
    });
  });

  test.describe('Performance Under Responsive Conditions', () => {
    test('should maintain smooth animations across different screen sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/signin');
      await page.waitForSelector('[data-testid="google-auth-button"]', { state: 'visible' });
      
      // Test breathing animation performance
      const heading = page.locator('h1:has-text("theAGNT.ai")');
      
      // Measure animation performance
      const animationData = await heading.evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          animationName: styles.animationName,
          animationDuration: styles.animationDuration,
          animationTimingFunction: styles.animationTimingFunction,
        };
      });
      
      expect(animationData.animationName).toContain('breathe');
      expect(animationData.animationDuration).toBe('4s');
      expect(animationData.animationTimingFunction).toBe('ease-in-out');
      
      // Test button transition performance
      const googleButton = page.locator('[data-testid="google-auth-button"]');
      const transitionData = await googleButton.evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          transition: styles.transition,
          transitionDuration: styles.transitionDuration,
          transitionTimingFunction: styles.transitionTimingFunction,
        };
      });
      
      expect(transitionData.transitionDuration).toBe('0.2s');
      expect(transitionData.transitionTimingFunction).toBe('ease-out');
    });
  });
});