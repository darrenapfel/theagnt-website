const { chromium } = require('playwright');

async function testAuth() {
  console.log('🧪 Testing authentication flows...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000 // Add delay to see what's happening
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console logs from the page
  page.on('console', msg => {
    console.log(`📱 Browser console: ${msg.text()}`);
  });
  
  // Listen for errors
  page.on('pageerror', err => {
    console.error(`❌ Page error: ${err.message}`);
  });
  
  try {
    console.log('📍 Navigating to signin page...');
    await page.goto('http://localhost:3001/auth/signin');
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForSelector('button:has-text("Continue with Email")');
    
    console.log('✅ Signin page loaded successfully');
    
    // Test Google authentication
    console.log('🔧 Testing Google authentication...');
    await page.click('button:has-text("Continue with Google")');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL after Google click: ${currentUrl}`);
    
    // Check if we're still on signin page or redirected
    if (currentUrl.includes('/auth/signin')) {
      console.log('⚠️  Still on signin page - email auth may have failed');
      
      // Check for any error messages
      const errorElements = await page.$$eval('*', (elements) => {
        return elements
          .filter(el => el.textContent && el.textContent.toLowerCase().includes('error'))
          .map(el => el.textContent);
      });
      
      if (errorElements.length > 0) {
        console.log('❌ Found error messages:', errorElements);
      }
    } else {
      console.log('✅ Redirected after email click');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'auth-test-screenshot.png' });
    console.log('📸 Screenshot saved as auth-test-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Also test the API directly
async function testAuthAPI() {
  console.log('🔍 Testing NextAuth API endpoints...');
  
  try {
    // Test if NextAuth providers endpoint works
    const response = await fetch('http://localhost:3001/api/auth/providers');
    const providers = await response.json();
    
    console.log('🔧 Available providers:', Object.keys(providers));
    
    // Check if email provider is available
    if (providers.resend) {
      console.log('✅ Resend email provider is configured');
    } else {
      console.log('❌ Resend email provider NOT found');
    }
    
    if (providers.google) {
      console.log('✅ Google provider is configured');
    } else {
      console.log('❌ Google provider NOT found');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

async function runTests() {
  await testAuthAPI();
  await testAuth();
}

runTests();