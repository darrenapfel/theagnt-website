const { chromium } = require('playwright');

async function testEmailAuth() {
  console.log('📧 Testing email authentication...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console logs
  page.on('console', msg => {
    console.log(`🌐 Browser: ${msg.text()}`);
  });
  
  try {
    console.log('📍 Navigating to signin page...');
    await page.goto('http://localhost:3002/auth/signin');
    
    console.log('⏳ Waiting for email button...');
    await page.waitForSelector('button:has-text("Continue with Email")');
    
    console.log('✅ Email button found');
    
    // Click email button
    console.log('🔧 Clicking email button...');
    await page.click('button:has-text("Continue with Email")');
    
    // Wait for form or redirect
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Check if we got an email input form
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('✅ Email input form appeared');
      
      // Enter test email
      console.log('📝 Entering test email...');
      await emailInput.fill('test@example.com');
      
      // Look for submit button
      const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Send"), button:has-text("Continue")');
      if (submitButton) {
        console.log('🔧 Clicking submit button...');
        await submitButton.click();
        
        // Wait for response
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        console.log(`📍 Final URL: ${finalUrl}`);
        
        console.log('✅ Email authentication flow completed - check server console for magic link');
      } else {
        console.log('❌ No submit button found');
      }
    } else {
      console.log('❌ No email input form found');
      
      // Check for error messages
      const bodyText = await page.textContent('body');
      if (bodyText.toLowerCase().includes('error')) {
        console.log('❌ Error detected on page');
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'email-auth-test.png' });
    console.log('📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testEmailAuth();