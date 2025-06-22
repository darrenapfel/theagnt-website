#!/usr/bin/env node

/**
 * Quick test script to verify authentication behavior
 * Run with: node scripts/test-auth.js
 */

const { canAccessInternal, validateEmailDomain, getUserAccess } = require('../src/lib/domain-utils');

const testEmails = [
  'test@theagnt.ai',
  'admin@theagnt.ai',
  'user@theagnt.ai',
  'Test@TheAGNT.ai', // Test case sensitivity
  'darrenapfel@gmail.com',
  'external@example.com',
  'invalid-email',
  '',
  null,
  undefined
];

console.log('🧪 Testing Domain Utils\n');
console.log('=' .repeat(80));

testEmails.forEach(email => {
  console.log(`\nTesting: "${email}"`);
  console.log('-'.repeat(40));
  
  try {
    const validation = validateEmailDomain(email);
    const access = getUserAccess(email);
    const canInternal = canAccessInternal(email);
    
    console.log('Validation:', JSON.stringify(validation, null, 2));
    console.log('Access:', JSON.stringify(access, null, 2));
    console.log('Can Access Internal:', canInternal);
  } catch (error) {
    console.log('Error:', error.message);
  }
});

console.log('\n' + '='.repeat(80));
console.log('✅ Test complete');

// Test specific scenario
console.log('\n🎯 Specific Test: @theagnt.ai domain');
console.log('=' .repeat(80));

const theagntEmail = 'test@theagnt.ai';
const trimmed = theagntEmail.trim().toLowerCase();
const domain = trimmed.split('@')[1];

console.log(`Email: ${theagntEmail}`);
console.log(`Trimmed: ${trimmed}`);
console.log(`Domain: ${domain}`);
console.log(`Domain === 'theagnt.ai': ${domain === 'theagnt.ai'}`);
console.log(`canAccessInternal: ${canAccessInternal(theagntEmail)}`);