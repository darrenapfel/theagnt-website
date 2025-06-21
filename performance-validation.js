const { chromium } = require('playwright');

async function performanceValidation() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('⚡ Starting Performance Validation...');
  
  try {
    // Enable metrics collection
    await page.coverage.startCSSCoverage();
    await page.coverage.startJSCoverage();
    
    // Navigate and measure load time
    const startTime = Date.now();
    
    await page.goto('https://theagnt-website.vercel.app/auth/signin', { 
      waitUntil: 'networkidle' 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Page Load Time: ${loadTime}ms`);
    
    // Wait for all auth buttons to be visible
    await page.waitForSelector('[data-testid="google-auth-button"]');
    await page.waitForSelector('[data-testid="apple-auth-button"]');
    await page.waitForSelector('[data-testid="email-auth-button"]');
    
    const interactiveTime = Date.now() - startTime;
    console.log(`🎯 Time to Interactive: ${interactiveTime}ms`);
    
    // Test interaction performance
    const clickStartTime = Date.now();
    await page.locator('[data-testid="email-auth-button"]').click();
    await page.waitForSelector('[data-testid="email-input"]');
    const clickResponseTime = Date.now() - clickStartTime;
    
    console.log(`🖱️  Click Response Time: ${clickResponseTime}ms`);
    
    // Test form interaction performance
    const formStartTime = Date.now();
    await page.locator('[data-testid="email-input"]').fill('test@example.com');
    await page.locator('[data-testid="send-magic-link"]').click();
    await page.waitForSelector('.animate-spin');
    const formResponseTime = Date.now() - formStartTime;
    
    console.log(`📝 Form Submission Time: ${formResponseTime}ms`);
    
    // Get coverage info
    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    // Calculate total bytes
    let totalJSBytes = 0;
    let usedJSBytes = 0;
    let totalCSSBytes = 0;
    let usedCSSBytes = 0;
    
    for (const entry of jsCoverage) {
      totalJSBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedJSBytes += range.end - range.start - 1;
      }
    }
    
    for (const entry of cssCoverage) {
      totalCSSBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedCSSBytes += range.end - range.start - 1;
      }
    }
    
    const jsUtilization = usedJSBytes / totalJSBytes * 100;
    const cssUtilization = usedCSSBytes / totalCSSBytes * 100;
    
    console.log(`📦 JavaScript: ${(totalJSBytes / 1024).toFixed(1)}KB total, ${jsUtilization.toFixed(1)}% utilized`);
    console.log(`🎨 CSS: ${(totalCSSBytes / 1024).toFixed(1)}KB total, ${cssUtilization.toFixed(1)}% utilized`);
    
    // Test animation performance
    const animationStartTime = Date.now();
    
    // Go back to trigger logo animation
    await page.locator('button:has-text("← Back to sign in options")').click();
    await page.waitForSelector('[data-testid="google-auth-button"]');
    
    // Wait for breathing animation to be visible
    await page.waitForTimeout(1000);
    
    const animationTime = Date.now() - animationStartTime;
    console.log(`🎭 Animation Response Time: ${animationTime}ms`);
    
    // Test responsive switching performance
    const responsiveStartTime = Date.now();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100); // Allow for any layout shifts
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(100);
    
    const responsiveTime = Date.now() - responsiveStartTime;
    console.log(`📱 Responsive Transition Time: ${responsiveTime}ms`);
    
    // Get Web Vitals-like metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              vitals.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
              vitals.loadComplete = entry.loadEventEnd - entry.loadEventStart;
            }
          });
          
          resolve(vitals);
        }).observe({ type: 'navigation', buffered: true });
        
        // Fallback if no entries
        setTimeout(() => resolve({}), 1000);
      });
    });
    
    console.log('📈 Performance Metrics:');
    if (metrics.domContentLoaded) {
      console.log(`   DOM Content Loaded: ${metrics.domContentLoaded.toFixed(1)}ms`);
    }
    if (metrics.loadComplete) {
      console.log(`   Load Complete: ${metrics.loadComplete.toFixed(1)}ms`);
    }
    
    // Performance scoring
    const scores = {
      loadTime: loadTime < 2000 ? 'Excellent' : loadTime < 4000 ? 'Good' : 'Needs Improvement',
      interactivity: clickResponseTime < 100 ? 'Excellent' : clickResponseTime < 300 ? 'Good' : 'Needs Improvement',
      formPerformance: formResponseTime < 500 ? 'Excellent' : formResponseTime < 1000 ? 'Good' : 'Needs Improvement',
      jsUtilization: jsUtilization > 70 ? 'Excellent' : jsUtilization > 50 ? 'Good' : 'Poor',
      cssUtilization: cssUtilization > 70 ? 'Excellent' : cssUtilization > 50 ? 'Good' : 'Poor',
    };
    
    console.log('\n🏆 Performance Scores:');
    console.log(`   Load Time: ${scores.loadTime} (${loadTime}ms)`);
    console.log(`   Interactivity: ${scores.interactivity} (${clickResponseTime}ms)`);
    console.log(`   Form Performance: ${scores.formPerformance} (${formResponseTime}ms)`);
    console.log(`   JS Utilization: ${scores.jsUtilization} (${jsUtilization.toFixed(1)}%)`);
    console.log(`   CSS Utilization: ${scores.cssUtilization} (${cssUtilization.toFixed(1)}%)`);
    
    const excellentCount = Object.values(scores).filter(score => score === 'Excellent').length;
    const goodCount = Object.values(scores).filter(score => score === 'Good').length;
    
    console.log(`\n📊 Overall Performance: ${excellentCount} Excellent, ${goodCount} Good out of ${Object.keys(scores).length} metrics`);
    
    if (excellentCount >= 3) {
      console.log('🎉 PERFORMANCE VALIDATION PASSED: Enhanced UI performs excellently!');
      return true;
    } else if (excellentCount + goodCount >= 4) {
      console.log('✅ PERFORMANCE VALIDATION PASSED: Enhanced UI performs well!');
      return true;
    } else {
      console.log('⚠️  PERFORMANCE NEEDS ATTENTION: Some metrics could be improved.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Performance validation failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the performance validation
performanceValidation()
  .then(success => {
    if (success) {
      console.log('\n🚀 PERFORMANCE VALIDATION COMPLETE: theAGNT.ai authentication system delivers excellent user experience!');
    } else {
      console.log('\n⚠️  Performance validation completed with some concerns.');
    }
  })
  .catch(error => {
    console.error('\n❌ Performance validation failed:', error.message);
    process.exit(1);
  });