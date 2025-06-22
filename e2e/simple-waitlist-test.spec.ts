import { test, expect } from '@playwright/test';

/**
 * Simplified Waitlist Feature Tests using Development Authentication
 * 
 * This test focuses on the core functionality to validate that the 
 * waitlist feature works correctly with different user types.
 */

test.describe('Simple Waitlist Feature Tests', () => {
  
  test('theagnt.ai user should see internal page', async ({ page }) => {
    // Go to dev login
    await page.goto('/dev/login');
    await expect(page.getByRole('heading', { name: 'Development Login' })).toBeVisible();
    
    // Login as internal user
    await page.fill('input[type="email"]', 'test@theagnt.ai');
    await page.click('button[type="submit"]');
    
    // Should eventually reach internal page
    await expect(page).toHaveURL(/.*\/internal$/, { timeout: 15000 });
    
    // Should show the special message
    await expect(page.locator('text=this is a special page')).toBeVisible();
    
    // Should show the "View Waitlist Entries" button
    await expect(page.locator('text=View Waitlist Entries')).toBeVisible();
  });
  
  test('external user should see waitlist join button', async ({ page }) => {
    // Go to dev login
    await page.goto('/dev/login');
    
    // Login as external user
    await page.fill('input[type="email"]', 'external@gmail.com');
    await page.click('button[type="submit"]');
    
    // Should be on dashboard
    await page.waitForURL(/.*\/dashboard$/, { timeout: 10000 });
    
    // Navigate to dev dashboard to avoid NextAuth issues
    await page.goto('/dashboard-dev');
    
    // Should show waitlist join button
    await expect(page.locator('text=Join the Waitlist')).toBeVisible();
    
    // Should NOT show internal navigation
    await expect(page.locator('text=View Waitlist Entries')).not.toBeVisible();
  });
  
  test('admin user should have internal access', async ({ page }) => {
    // Go to dev login
    await page.goto('/dev/login');
    
    // Login as admin user
    await page.fill('input[type="email"]', 'darrenapfel@gmail.com');
    await page.click('button[type="submit"]');
    
    // Should eventually reach internal page
    await expect(page).toHaveURL(/.*\/internal$/, { timeout: 15000 });
    
    // Should show the special message
    await expect(page.locator('text=this is a special page')).toBeVisible();
    
    // Should show the "View Waitlist Entries" button
    await expect(page.locator('text=View Waitlist Entries')).toBeVisible();
  });
  
  test('waitlist navigation should work', async ({ page }) => {
    // Login as internal user
    await page.goto('/dev/login');
    await page.fill('input[type="email"]', 'test@theagnt.ai');
    await page.click('button[type="submit"]');
    
    // Wait for internal page
    await expect(page).toHaveURL(/.*\/internal$/, { timeout: 15000 });
    
    // Click the "View Waitlist Entries" button
    await page.click('text=View Waitlist Entries');
    
    // Should navigate to internal waitlist page
    await expect(page).toHaveURL(/.*\/internal\/waitlist$/);
    
    // Should show waitlist management interface
    await expect(page.getByRole('heading', { name: 'Waitlist Entries' })).toBeVisible();
    
    // Should show back button
    await expect(page.locator('text=← Back')).toBeVisible();
  });
  
  test('external user cannot access internal routes', async ({ page }) => {
    // Login as external user first
    await page.goto('/dev/login');
    await page.fill('input[type="email"]', 'blocked@gmail.com');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL(/.*\/dashboard$/, { timeout: 10000 });
    
    // Try to access internal page directly
    await page.goto('/internal');
    
    // Should be redirected back to dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Should NOT see internal content
    await expect(page.locator('text=this is a special page')).not.toBeVisible();
  });
  
});