// Test script for Safari session debugging
// Copy and paste into browser console

async function testSafariSession() {
  console.log('=== SAFARI SESSION DEBUG ===\n');
  
  // 1. Test NextAuth session endpoint
  console.log('1. Testing NextAuth session...');
  try {
    const sessionResponse = await fetch('/api/auth/session');
    const sessionData = await sessionResponse.json();
    console.log('   Session response:', sessionResponse.status);
    console.log('   Session data:', sessionData);
  } catch (error) {
    console.log('   Session error:', error);
  }
  
  // 2. Test our debug endpoint
  console.log('\n2. Testing debug session...');
  try {
    const debugResponse = await fetch('/api/debug-session');
    const debugData = await debugResponse.json();
    console.log('   Debug response:', debugResponse.status);
    console.log('   Debug data:', debugData);
  } catch (error) {
    console.log('   Debug error:', error);
  }
  
  // 3. Check document cookies
  console.log('\n3. Document cookies:');
  const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
  console.log('   Total cookies:', cookies.length);
  const authCookies = cookies.filter(c => 
    c.includes('next-auth') || 
    c.includes('session') ||
    c.includes('auth')
  );
  console.log('   Auth-related cookies:', authCookies);
  
  // 4. Test waitlist API directly
  console.log('\n4. Testing waitlist API...');
  try {
    const waitlistResponse = await fetch('/api/waitlist');
    const waitlistData = await waitlistResponse.json();
    console.log('   Waitlist response:', waitlistResponse.status);
    console.log('   Waitlist data:', waitlistData);
  } catch (error) {
    console.log('   Waitlist error:', error);
  }
  
  console.log('\n=== END DEBUG ===');
}

// Make it available globally
window.testSafariSession = testSafariSession;

console.log('Safari session test loaded. Run: testSafariSession()');