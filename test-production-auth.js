// Simple test to check production authentication
// Run this in the browser console after signing in with a @theagnt.ai email

async function testProductionAuth() {
  console.log('Testing production authentication...\n');
  
  // Check current page
  console.log('Current URL:', window.location.href);
  
  // Check if we're on dashboard
  if (window.location.pathname === '/dashboard') {
    console.log('✅ You are on the dashboard');
    
    // Check if redirecting
    const redirectingText = document.body.innerText.includes('Redirecting to internal dashboard');
    if (redirectingText) {
      console.log('⏳ Redirect in progress...');
    } else {
      console.log('❌ No redirect happening - this is the issue!');
      console.log('\nTo debug further:');
      console.log('1. Check browser console for "DashboardRedirect Debug" logs');
      console.log('2. Look for the userEmail value being passed');
      console.log('3. Check if canAccessInternal is returning true');
    }
  } else if (window.location.pathname === '/internal') {
    console.log('✅ SUCCESS! You reached the internal page');
  } else {
    console.log('❓ You are on:', window.location.pathname);
  }
  
  // Try to fetch session info
  try {
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    console.log('\nSession data:', session);
    console.log('Email:', session?.user?.email);
  } catch (error) {
    console.log('Could not fetch session:', error);
  }
}

// Instructions
console.log('To test production auth:');
console.log('1. Sign in with a @theagnt.ai email');
console.log('2. Run: testProductionAuth()');
console.log('3. Share the console output');

// Make function available globally
window.testProductionAuth = testProductionAuth;