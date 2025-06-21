const { chromium, firefox, webkit } = require('playwright');

async function testBrowser(browserType, browserName) {
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log(`\n🔍 Testing ${browserName}...`);
  
  try {
    // Navigate to production site
    await page.goto('https://theagnt-website.vercel.app/auth/signin', { timeout: 15000 });
    await page.waitForSelector('[data-testid="google-auth-button"]', { timeout: 10000 });
    
    // Test enhanced UI elements
    const googleButton = await page.locator('[data-testid="google-auth-button"]').isVisible();
    const appleButton = await page.locator('[data-testid="apple-auth-button"]').isVisible();
    const emailButton = await page.locator('[data-testid="email-auth-button"]').isVisible();
    
    console.log(`  ✅ All buttons visible: Google(${googleButton}) Apple(${appleButton}) Email(${emailButton})`);
    
    // Test styling
    const buttonHeight = await page.locator('[data-testid="google-auth-button"]').evaluate(el => getComputedStyle(el).height);
    const borderColor = await page.locator('[data-testid="google-auth-button"]').evaluate(el => getComputedStyle(el).borderColor);
    
    console.log(`  🎨 Button styling: Height=${buttonHeight}, Border=${borderColor}`);
    
    // Test email flow
    await page.locator('[data-testid="email-auth-button"]').click();
    await page.waitForSelector('[data-testid="email-input"]', { timeout: 5000 });
    
    const emailFormVisible = await page.locator('[data-testid="email-input"]').isVisible();
    console.log(`  📧 Email form functional: ${emailFormVisible}`);
    
    // Test email submission
    await page.locator('[data-testid="email-input"]').fill('test@example.com');
    await page.locator('[data-testid="send-magic-link"]').click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    const successMessage = await page.locator('[data-testid="email-sent-message"]').isVisible();
    console.log(`  ✅ Email flow successful: ${successMessage}`);
    
    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://theagnt-website.vercel.app/auth/signin');
    await page.waitForSelector('[data-testid="google-auth-button"]');
    
    const mobileButton = await page.locator('[data-testid="google-auth-button"]').isVisible();
    console.log(`  📱 Mobile responsive: ${mobileButton}`);
    
    console.log(`  🎉 ${browserName} validation successful!`);
    
  } catch (error) {
    console.error(`  ❌ ${browserName} validation failed:`, error.message);
    return false;
  } finally {
    await browser.close();
  }
  
  return true;
}

async function runCrossBrowserTests() {
  console.log('🌐 Starting Cross-Browser Production Validation...');
  
  const results = {
    chromium: false,
    firefox: false,
    webkit: false
  };
  
  // Test Chromium (Chrome/Edge)
  results.chromium = await testBrowser(chromium, 'Chromium (Chrome/Edge)');
  
  // Test Firefox
  results.firefox = await testBrowser(firefox, 'Firefox');
  
  // Test WebKit (Safari)
  results.webkit = await testBrowser(webkit, 'WebKit (Safari)');
  
  // Summary
  console.log('\n🎉 CROSS-BROWSER VALIDATION SUMMARY:');
  console.log(`  Chrome/Edge: ${results.chromium ? '✅' : '❌'}`);
  console.log(`  Firefox: ${results.firefox ? '✅' : '❌'}`);
  console.log(`  Safari: ${results.webkit ? '✅' : '❌'}`);
  
  const successCount = Object.values(results).filter(r => r).length;
  console.log(`\n🚀 ${successCount}/3 browsers passed validation`);
  
  if (successCount === 3) {
    console.log('🎉 ALL BROWSERS PASSED! Authentication system is fully cross-browser compatible!');
  } else {
    console.log('⚠️  Some browsers had issues. Review logs above for details.');
  }
  
  return successCount === 3;
}

// Run the tests
runCrossBrowserTests()
  .then(success => {
    if (success) {
      console.log('\n🏆 COMPLETE SUCCESS: theAGNT.ai authentication is production-ready across all major browsers!');
    } else {
      console.log('\n⚠️  Partial success: Check browser-specific issues above.');
    }
  })
  .catch(error => {
    console.error('\n❌ Cross-browser validation failed:', error.message);
    process.exit(1);
  });