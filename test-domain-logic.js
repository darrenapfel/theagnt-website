// Quick test to verify domain logic is working
// Run with: node test-domain-logic.js

// Simulate the domain checking functions
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isTheAgntDomain(email) {
  if (!isValidEmail(email)) return false;
  const domain = email.trim().toLowerCase().split('@')[1];
  return domain === 'theagnt.ai';
}

function getUserRole(email) {
  if (email === 'darrenapfel@gmail.com') return 'admin';
  if (isTheAgntDomain(email)) return 'internal';
  return 'external';
}

function canAccessInternal(email) {
  const role = getUserRole(email);
  return role === 'admin' || role === 'internal';
}

// Test cases
const testEmails = [
  'user@theagnt.ai',
  'test@theagnt.ai', 
  'admin@theagnt.ai',
  'darrenapfel@gmail.com',
  'external@gmail.com',
  'someone@yahoo.com',
  null,
  undefined,
  ''
];

console.log('🧪 Domain Logic Test Results:');
console.log('================================');

testEmails.forEach(email => {
  console.log(`\nEmail: ${email}`);
  console.log(`  - Valid: ${isValidEmail(email)}`);
  console.log(`  - theAGNT domain: ${isTheAgntDomain(email)}`);
  console.log(`  - Role: ${getUserRole(email)}`);
  console.log(`  - Can access internal: ${canAccessInternal(email)}`);
});

console.log('\n✅ Test complete - domain logic should work correctly');
console.log('If theagnt.ai emails show "Can access internal: true" then the logic is working');