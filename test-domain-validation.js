// Test domain validation logic directly in production
// Copy and paste this into the browser console

console.log('Testing domain validation logic...\n');

// Test the canAccessInternal logic directly
function testCanAccessInternal(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  const domain = trimmedEmail.split('@')[1];
  
  // Check if it's theagnt.ai domain or admin
  const isInternal = domain === 'theagnt.ai' || trimmedEmail === 'darrenapfel@gmail.com';
  
  console.log(`Email: ${email}`);
  console.log(`  Trimmed: ${trimmedEmail}`);
  console.log(`  Domain: ${domain}`);
  console.log(`  Is Internal: ${isInternal}`);
  console.log('');
  
  return isInternal;
}

// Test with the session email
fetch('/api/auth/session')
  .then(res => res.json())
  .then(session => {
    console.log('Your session email:', session?.user?.email);
    console.log('Should redirect to internal?', testCanAccessInternal(session?.user?.email));
    console.log('');
    
    // Test various emails
    console.log('Testing various emails:');
    testCanAccessInternal('info@theagnt.ai');
    testCanAccessInternal('test@theagnt.ai');
    testCanAccessInternal('darrenapfel@gmail.com');
    testCanAccessInternal('external@gmail.com');
  });

// Check if DashboardRedirect component exists
console.log('\nChecking for DashboardRedirect component...');
const redirectText = document.body.innerText.includes('Redirecting to internal dashboard');
console.log('Is redirect message visible?', redirectText);

// Check current React props (requires React DevTools)
console.log('\nTo check React props:');
console.log('1. Install React Developer Tools extension');
console.log('2. Open React DevTools');
console.log('3. Search for "DashboardRedirect" component');
console.log('4. Check the userEmail prop value');