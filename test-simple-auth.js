const { chromium } = require('playwright');

async function testSimpleAuth() {
  console.log('🔧 Testing simplified authentication...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console logs
  page.on('console', msg => {
    console.log(`🌐 Browser: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.error(`❌ Page error: ${err.message}`);
  });
  
  try {
    console.log('📍 Navigating to signin page...');
    await page.goto('http://localhost:3002/auth/signin');
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForSelector('button:has-text("Continue with Google")');
    
    console.log('✅ Signin page loaded');
    
    // Test what happens when we click Google
    console.log('🔧 Testing Google signin URL...');
    
    // Navigate directly to Google signin endpoint to see what happens
    await page.goto('http://localhost:3002/api/auth/signin/google');
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 Current URL after Google signin: ${currentUrl}`);
    
    if (currentUrl.includes('accounts.google.com')) {
      console.log('✅ Successfully redirected to Google OAuth!');
      console.log('🔑 This means the basic NextAuth flow is working');
    } else if (currentUrl.includes('error')) {
      console.log('❌ Redirected to error page');
      const bodyText = await page.textContent('body');
      console.log('Error page content:', bodyText.substring(0, 200));
    } else {
      console.log('⚠️  Unexpected redirect');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'simple-auth-test.png' });
    console.log('📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSimpleAuth();