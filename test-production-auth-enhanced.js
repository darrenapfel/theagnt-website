/**
 * Enhanced Production Authentication Test Script
 * 
 * HOW TO USE:
 * 1. Sign in to the production website with your @theagnt.ai email
 * 2. Open browser console (Right-click → Inspect → Console)
 * 3. Copy and paste this ENTIRE file into the console
 * 4. Press Enter to load the script
 * 5. Type: testProductionAuth()
 * 6. Press Enter to run the test
 * 7. Share the console output with the development team
 * 
 * This script helps diagnose why @theagnt.ai users aren't being redirected
 */

async function testProductionAuth() {
  console.log('=== ENHANCED PRODUCTION AUTH TEST ===\n');
  
  // 1. Check current page
  console.log('1. CURRENT PAGE:');
  console.log('   URL:', window.location.href);
  console.log('   Path:', window.location.pathname);
  console.log('');
  
  // 2. Check for redirect elements
  console.log('2. PAGE CONTENT CHECK:');
  const pageText = document.body.innerText;
  
  if (window.location.pathname === '/dashboard') {
    console.log('   ✓ You are on the dashboard');
    
    // Check for redirect indicator
    if (pageText.includes('Redirecting to internal dashboard')) {
      console.log('   ⏳ Redirect in progress...');
    } else if (pageText.includes('Join the Waitlist')) {
      console.log('   ❌ ISSUE CONFIRMED: Showing waitlist button instead of redirecting');
    }
    
    // Check for dev mode indicator
    if (pageText.includes('DEV MODE')) {
      console.log('   ⚠️  Dev mode indicator present');
    }
  } else if (window.location.pathname === '/internal') {
    console.log('   ✅ SUCCESS! You reached the internal page');
    return;
  }
  console.log('');
  
  // 3. Fetch and analyze session
  console.log('3. SESSION ANALYSIS:');
  try {
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    
    console.log('   Raw session:', JSON.stringify(session, null, 2));
    console.log('   User email:', session?.user?.email);
    console.log('   Email domain:', session?.user?.email?.split('@')[1]);
    console.log('   Is @theagnt.ai?:', session?.user?.email?.endsWith('@theagnt.ai'));
    console.log('');
  } catch (error) {
    console.log('   ❌ Could not fetch session:', error);
    console.log('');
  }
  
  // 4. Check React DevTools for props
  console.log('4. COMPONENT DEBUGGING:');
  console.log('   Check React DevTools for DashboardRedirect component');
  console.log('   Look for userEmail prop value');
  console.log('');
  
  // 5. Test domain validation function
  console.log('5. DOMAIN VALIDATION TEST:');
  console.log('   Run this to test domain logic:');
  console.log('   - For @theagnt.ai: Should return true');
  console.log('   - For darrenapfel@gmail.com: Should return true');
  console.log('   - For other emails: Should return false');
  console.log('');
  
  // 6. Check cookies
  console.log('6. COOKIE ANALYSIS:');
  const cookies = document.cookie.split(';').map(c => c.trim());
  const relevantCookies = cookies.filter(c => 
    c.includes('next-auth') || 
    c.includes('email-session') || 
    c.includes('dev-session')
  );
  console.log('   Relevant cookies:', relevantCookies);
  console.log('');
  
  // 7. Diagnosis
  console.log('7. DIAGNOSIS:');
  console.log('   If you see the waitlist button with a @theagnt.ai email:');
  console.log('   - The session email might not be passed correctly to DashboardRedirect');
  console.log('   - The domain validation might be failing');
  console.log('   - There might be a hydration mismatch between server and client');
  console.log('');
  
  console.log('8. NEXT STEPS:');
  console.log('   1. Share this entire console output');
  console.log('   2. Check browser Network tab for any failed requests');
  console.log('   3. Look for any console errors on page load');
}

// Test the domain validation logic directly
function testDomainLogic(email) {
  const trimmed = email.trim().toLowerCase();
  const domain = trimmed.split('@')[1];
  const isInternal = domain === 'theagnt.ai' || trimmed === 'darrenapfel@gmail.com';
  
  console.log(`Testing: ${email}`);
  console.log(`  Trimmed: ${trimmed}`);
  console.log(`  Domain: ${domain}`);
  console.log(`  Is internal? ${isInternal}`);
  return isInternal;
}

// Make functions available globally
window.testProductionAuth = testProductionAuth;
window.testDomainLogic = testDomainLogic;

// Instructions
console.log('🔍 ENHANCED PRODUCTION AUTH TEST READY\n');
console.log('To test production auth:');
console.log('1. Sign in with a @theagnt.ai email');
console.log('2. Run: testProductionAuth()');
console.log('3. Share the complete console output\n');
console.log('To test domain logic:');
console.log('Run: testDomainLogic("your-email@theagnt.ai")');