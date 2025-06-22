import { test, expect } from '@playwright/test';

/**
 * Comprehensive Waitlist Feature Tests using Development Authentication
 * 
 * This test suite uses the /dev/login endpoint to bypass OAuth/magic links
 * and test the complete waitlist functionality with different user types.
 */

// Test helper to login with different user types
async function devLogin(page: any, email: string) {
  await page.goto('/dev/login');
  await expect(page.locator('h1')).toContainText('Development Login');
  
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete - use dashboard-dev to avoid NextAuth issues
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Navigate to dev dashboard to avoid NextAuth headers sync issues
  await page.goto('/dashboard-dev');
}

test.describe('Waitlist Feature - Development Authentication Tests', () => {
  
  test.describe('theAGNT.ai Domain Users (@theagnt.ai)', () => {
    
    test('should redirect to internal dashboard and show special message', async ({ page }) => {
      // Login as internal user
      await devLogin(page, 'test@theagnt.ai');
      
      // Should be redirected to /internal automatically
      await expect(page).toHaveURL('**/internal');
      
      // Should show the special message
      await expect(page.locator('text=this is a special page')).toBeVisible();
      
      // Should show the "View Waitlist Entries" button
      await expect(page.locator('text=View Waitlist Entries')).toBeVisible();
      
      // Should show development mode indicator
      await expect(page.locator('text=Development Mode - Logged in as: test@theagnt.ai')).toBeVisible();
    });
    
    test('should navigate to waitlist viewer from internal dashboard', async ({ page }) => {
      await devLogin(page, 'internal@theagnt.ai');
      
      // Wait for redirect to internal page
      await expect(page).toHaveURL('**/internal');
      
      // Click the "View Waitlist Entries" button
      await page.click('text=View Waitlist Entries');
      
      // Should navigate to internal waitlist page
      await expect(page).toHaveURL('**/internal/waitlist');
      
      // Should show waitlist management interface
      await expect(page.locator('h1')).toContainText('Waitlist Management');
      
      // Should show back button
      await expect(page.locator('text=← Back to Internal Dashboard')).toBeVisible();
    });
    
    test('should access waitlist viewer directly with proper URL', async ({ page }) => {
      await devLogin(page, 'admin@theagnt.ai');
      
      // Navigate directly to internal waitlist
      await page.goto('/internal/waitlist');
      
      // Should have access (no redirect)
      await expect(page).toHaveURL('**/internal/waitlist');
      await expect(page.locator('h1')).toContainText('Waitlist Management');
    });
    
    test('should show waitlist data and export functionality', async ({ page }) => {
      await devLogin(page, 'manager@theagnt.ai');
      
      await page.goto('/internal/waitlist');
      
      // Should show metrics section
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=Waitlist Members')).toBeVisible();
      
      // Should show export button
      await expect(page.locator('text=Export CSV')).toBeVisible();
      
      // Test export functionality
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Export CSV');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('waitlist-entries.csv');
    });
    
  });
  
  test.describe('External Domain Users (non-theagnt.ai)', () => {
    
    test('should stay on dashboard and show waitlist join interface', async ({ page }) => {
      // Login as external user
      await devLogin(page, 'external@gmail.com');
      
      // Should stay on dashboard-dev (no redirect to internal)
      await expect(page).toHaveURL('**/dashboard-dev');
      
      // Should show waitlist join button
      await expect(page.locator('text=Join the Waitlist')).toBeVisible();
      
      // Should NOT show internal navigation
      await expect(page.locator('text=View Waitlist Entries')).not.toBeVisible();
      
      // Should show development mode indicator
      await expect(page.locator('text=Development Mode - Logged in as: external@gmail.com')).toBeVisible();
    });
    
    test('should allow external user to join waitlist', async ({ page }) => {
      await devLogin(page, 'newuser@gmail.com');
      
      // Should see join button
      await expect(page.locator('text=Join the Waitlist')).toBeVisible();
      
      // Click join button
      await page.click('text=Join the Waitlist');
      
      // Should show confirmation message
      await expect(page.locator('text=You\'re on the waitlist.')).toBeVisible({ timeout: 10000 });
      
      // Join button should be replaced with confirmation
      await expect(page.locator('text=Join the Waitlist')).not.toBeVisible();
    });
    
    test('should show already joined status for repeat users', async ({ page }) => {
      // Login and join first
      await devLogin(page, 'repeat@yahoo.com');
      await page.click('text=Join the Waitlist');
      await expect(page.locator('text=You\'re on the waitlist.')).toBeVisible();
      
      // Refresh page and check status
      await page.reload();
      await expect(page.locator('text=You\'re on the waitlist.')).toBeVisible();
      await expect(page.locator('text=Join the Waitlist')).not.toBeVisible();
    });
    
    test('should be blocked from accessing internal routes', async ({ page }) => {
      await devLogin(page, 'blocked@hotmail.com');
      
      // Try to access internal page directly
      await page.goto('/internal');
      
      // Should be redirected to dashboard (middleware redirects to /dashboard, then dev dashboard)
      await expect(page).toHaveURL(/\/(dashboard|dashboard-dev)/);
      
      // Try to access internal waitlist directly
      await page.goto('/internal/waitlist');
      
      // Should be redirected to dashboard (middleware redirects to /dashboard, then dev dashboard)
      await expect(page).toHaveURL(/\/(dashboard|dashboard-dev)/);
    });
    
  });
  
  test.describe('Admin User (darrenapfel@gmail.com)', () => {
    
    test('should have internal access like theagnt.ai users', async ({ page }) => {
      await devLogin(page, 'darrenapfel@gmail.com');
      
      // Should be redirected to internal page
      await expect(page).toHaveURL('**/internal');
      
      // Should show special message and waitlist button
      await expect(page.locator('text=this is a special page')).toBeVisible();
      await expect(page.locator('text=View Waitlist Entries')).toBeVisible();
      
      // Should also show admin link
      await expect(page.locator('a[href="/admin"]')).toBeVisible();
    });
    
    test('should access admin dashboard and waitlist management', async ({ page }) => {
      await devLogin(page, 'darrenapfel@gmail.com');
      
      // Should be able to access admin page
      await page.click('a[href="/admin"]');
      await expect(page).toHaveURL('**/admin');
      
      // Navigate to internal waitlist
      await page.goto('/internal/waitlist');
      await expect(page).toHaveURL('**/internal/waitlist');
      await expect(page.locator('h1')).toContainText('Waitlist Management');
    });
    
  });
  
  test.describe('User Experience and Navigation', () => {
    
    test('should allow switching between user types in dev mode', async ({ page }) => {
      // Start as external user
      await devLogin(page, 'switcher@gmail.com');
      await expect(page).toHaveURL('**/dashboard-dev');
      
      // Click switch user button
      await page.click('text=Switch User');
      await expect(page).toHaveURL('**/dev/login');
      
      // Login as internal user
      await page.fill('input[type="email"]', 'switcher@theagnt.ai');
      await page.click('button[type="submit"]');
      
      // Should now be on internal page (via redirect)
      await expect(page).toHaveURL('**/internal');
      await expect(page.locator('text=this is a special page')).toBeVisible();
    });
    
    test('should handle navigation between internal pages correctly', async ({ page }) => {
      await devLogin(page, 'navigator@theagnt.ai');
      
      // Start on internal dashboard
      await expect(page).toHaveURL('**/internal');
      
      // Navigate to waitlist
      await page.click('text=View Waitlist Entries');
      await expect(page).toHaveURL('**/internal/waitlist');
      
      // Navigate back
      await page.click('text=← Back to Internal Dashboard');
      await expect(page).toHaveURL('**/internal');
    });
    
    test('should show proper loading states and animations', async ({ page }) => {
      await page.goto('/dev/login');
      
      // Fill email and submit
      await page.fill('input[type="email"]', 'loading@theagnt.ai');
      
      // Click submit and check loading state
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Button should show loading text briefly
      await expect(submitButton).toContainText('Signing in...');
      
      // Should eventually navigate to internal page
      await expect(page).toHaveURL('**/internal', { timeout: 10000 });
    });
    
  });
  
  test.describe('Error Handling and Edge Cases', () => {
    
    test('should handle invalid email formats in dev login', async ({ page }) => {
      await page.goto('/dev/login');
      
      // Try invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      // Should show validation error (HTML5 validation)
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });
    
    test('should handle empty email submission', async ({ page }) => {
      await page.goto('/dev/login');
      
      // Try to submit without email
      await page.click('button[type="submit"]');
      
      // Should show required field validation
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toContain('fill');
    });
    
    test('should handle network errors gracefully', async ({ page }) => {
      await devLogin(page, 'network@theagnt.ai');
      
      // Go to waitlist page
      await page.goto('/internal/waitlist');
      
      // Intercept API calls to simulate network errors
      await page.route('**/api/admin', route => route.abort());
      
      // Reload page to trigger API call
      await page.reload();
      
      // Should show error state (implementation dependent)
      // This tests that the page doesn't crash with network errors
      await expect(page.locator('h1')).toContainText('Waitlist Management');
    });
    
  });
  
  test.describe('Domain Validation Logic', () => {
    
    test('should correctly identify different email domains', async ({ page }) => {
      const testCases = [
        { email: 'user@theagnt.ai', shouldRedirect: true, description: 'theagnt.ai domain' },
        { email: 'admin@theagnt.ai', shouldRedirect: true, description: 'theagnt.ai subdomain user' },
        { email: 'darrenapfel@gmail.com', shouldRedirect: true, description: 'admin user' },
        { email: 'external@gmail.com', shouldRedirect: false, description: 'gmail external user' },
        { email: 'user@yahoo.com', shouldRedirect: false, description: 'yahoo external user' },
        { email: 'test@company.com', shouldRedirect: false, description: 'company domain external user' },
      ];
      
      for (const testCase of testCases) {
        await devLogin(page, testCase.email);
        
        if (testCase.shouldRedirect) {
          await expect(page).toHaveURL('**/internal', { timeout: 5000 });
          await expect(page.locator('text=this is a special page')).toBeVisible();
        } else {
          await expect(page).toHaveURL('**/dashboard-dev', { timeout: 5000 });
          await expect(page.locator('text=Join the Waitlist')).toBeVisible();
        }
        
        // Clear session for next test
        await page.click('text=Switch User');
      }
    });
    
  });
  
  test.describe('Responsive Design and Accessibility', () => {
    
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await devLogin(page, 'mobile@theagnt.ai');
      
      // Should still redirect to internal page
      await expect(page).toHaveURL('**/internal');
      
      // Elements should be visible and accessible on mobile
      await expect(page.locator('text=this is a special page')).toBeVisible();
      await expect(page.locator('text=View Waitlist Entries')).toBeVisible();
      
      // Button should be properly sized for touch
      const button = page.locator('text=View Waitlist Entries');
      const boundingBox = await button.boundingBox();
      expect(boundingBox?.height).toBeGreaterThan(40); // Minimum touch target
    });
    
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/dev/login');
      
      // Should be able to navigate with keyboard
      await page.keyboard.press('Tab'); // Focus email input
      await page.keyboard.type('keyboard@theagnt.ai');
      await page.keyboard.press('Tab'); // Focus submit button
      await page.keyboard.press('Enter'); // Submit
      
      // Should navigate to internal page
      await expect(page).toHaveURL('**/internal');
    });
    
  });
  
});