const { chromium } = require('@playwright/test');

async function testPerformanceOptimizations() {
  console.log('🚀 Testing Authentication Performance Optimizations...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Page Load Performance
    console.log('📊 Test 1: Page Load Performance');
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/auth/signin', { 
      waitUntil: 'networkidle' 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ Page load time: ${loadTime}ms`);
    
    // Test 2: Button Response Time
    console.log('\n📊 Test 2: Button Response Time');
    const googleButton = page.locator('[data-testid="google-auth-button"]');
    
    const clickStartTime = Date.now();
    await googleButton.click();
    
    // Wait for loading state to appear (immediate feedback)
    await page.waitForSelector('[aria-label="Loading"]', { timeout: 2000 });
    const responseTime = Date.now() - clickStartTime;
    
    console.log(`✅ Button response time: ${responseTime}ms`);
    
    // Test 3: Animation Performance
    console.log('\n📊 Test 3: Animation Performance');
    await page.goto('http://localhost:3000/auth/signin');
    
    // Check for GPU acceleration styles
    const elements = await page.$$('[style*="will-change"]');
    console.log(`✅ Elements with GPU acceleration: ${elements.length}`);
    
    // Test 4: Service Worker Installation
    console.log('\n📊 Test 4: Service Worker Check');
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    console.log(`✅ Service Worker support: ${swRegistered ? 'Yes' : 'No'}`);
    
    // Test 5: Bundle Size Analysis
    console.log('\n📊 Test 5: Network Requests');
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('localhost:3000')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'] || 'unknown',
          status: response.status()
        });
      }
    });
    
    await page.goto('http://localhost:3000/auth/signin', { waitUntil: 'load' });
    await page.waitForTimeout(2000); // Allow for lazy loading
    
    console.log(`✅ Total requests: ${responses.length}`);
    
    // Test 6: Email Form Performance
    console.log('\n📊 Test 6: Email Form Performance');
    await page.goto('http://localhost:3000/auth/signin');
    
    const emailButton = page.locator('[data-testid="email-auth-button"]');
    const formStartTime = Date.now();
    
    await emailButton.click();
    await page.waitForSelector('[data-testid="email-input"]', { timeout: 2000 });
    
    const formLoadTime = Date.now() - formStartTime;
    console.log(`✅ Email form transition time: ${formLoadTime}ms`);
    
    // Summary
    console.log('\n🎯 Performance Summary:');
    console.log(`Page Load: ${loadTime}ms ${loadTime < 1000 ? '(Excellent)' : loadTime < 2000 ? '(Good)' : '(Needs Improvement)'}`);
    console.log(`Button Response: ${responseTime}ms ${responseTime < 500 ? '(Excellent)' : responseTime < 1000 ? '(Good)' : '(Needs Improvement)'}`);
    console.log(`Form Transition: ${formLoadTime}ms ${formLoadTime < 300 ? '(Excellent)' : formLoadTime < 500 ? '(Good)' : '(Needs Improvement)'}`);
    console.log(`GPU Acceleration: ${elements.length} elements optimized`);
    
    const overallScore = (
      (loadTime < 1000 ? 25 : loadTime < 2000 ? 15 : 5) +
      (responseTime < 500 ? 25 : responseTime < 1000 ? 15 : 5) +
      (formLoadTime < 300 ? 25 : formLoadTime < 500 ? 15 : 5) +
      (elements.length > 5 ? 25 : elements.length > 2 ? 15 : 5)
    );
    
    console.log(`\n🏆 Overall Performance Score: ${overallScore}/100`);
    
    if (overallScore >= 80) {
      console.log('🎉 Excellent performance! All optimizations working well.');
    } else if (overallScore >= 60) {
      console.log('👍 Good performance. Some optimizations could be improved.');
    } else {
      console.log('⚠️  Performance needs improvement. Review optimizations.');
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testPerformanceOptimizations().catch(console.error);
}

module.exports = { testPerformanceOptimizations };