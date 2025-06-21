#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Configuration - you'll need to fill these in from Apple Developer Console
const config = {
  teamId: 'FV35ZS352N',             // 10-character Team ID from Apple Developer
  clientId: 'ai.theagnt.wwwservice', // Service ID (reverse domain notation)
  keyId: '68QVVWLHQ4',            // 10-character Key ID from the downloaded key file
  privateKeyPath: '/Users/darrenapfel/DEVELOPER/CatalystWeb/catalyst-web/Docs/AuthKey_68QVVWLHQ4.p8'  // Path to your downloaded .p8 key file
};

function generateAppleClientSecret() {
  try {
    // Check if private key file exists
    if (!fs.existsSync(config.privateKeyPath)) {
      console.error(`❌ Private key file not found: ${config.privateKeyPath}`);
      console.log('\n📋 Steps to get your private key:');
      console.log('1. Go to https://developer.apple.com/account/resources/authkeys/list');
      console.log('2. Click "+" to create a new key');
      console.log('3. Check "Sign in with Apple" and configure it');
      console.log('4. Download the .p8 file and place it in this directory');
      console.log('5. Update the config in this script with your actual values');
      return;
    }

    // Read the private key
    const privateKey = fs.readFileSync(config.privateKeyPath, 'utf8');

    // Create JWT payload
    const payload = {
      iss: config.teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60), // 6 months
      aud: 'https://appleid.apple.com',
      sub: config.clientId
    };

    // Create JWT header
    const header = {
      alg: 'ES256',
      kid: config.keyId
    };

    // Generate the client secret
    const clientSecret = jwt.sign(payload, privateKey, { 
      algorithm: 'ES256',
      header: header
    });

    console.log('✅ Apple Client Secret Generated Successfully!');
    console.log('\n📝 Add these to your environment variables:');
    console.log(`APPLE_CLIENT_ID=${config.clientId}`);
    console.log(`APPLE_CLIENT_SECRET=${clientSecret}`);
    
    console.log('\n⚡ For Vercel deployment:');
    console.log(`vercel env add APPLE_CLIENT_ID production`);
    console.log(`# Enter: ${config.clientId}`);
    console.log(`vercel env add APPLE_CLIENT_SECRET production`);
    console.log(`# Enter: ${clientSecret}`);

    console.log('\n⏰ Note: This secret expires in 6 months. You\'ll need to regenerate it.');
    
    return clientSecret;

  } catch (error) {
    console.error('❌ Error generating Apple client secret:', error.message);
    
    if (error.message.includes('invalid key')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('- Make sure your .p8 file is valid');
      console.log('- Verify the Key ID matches your file name');
      console.log('- Check that the private key format is correct');
    }
  }
}

// Validation function
function validateConfig() {
  const issues = [];
  
  if (config.teamId === 'YOUR_TEAM_ID') issues.push('Team ID');
  if (config.clientId === 'YOUR_CLIENT_ID') issues.push('Client ID');
  if (config.keyId === 'YOUR_KEY_ID') issues.push('Key ID');
  if (config.privateKeyPath.includes('YOUR_KEY_ID')) issues.push('Private Key Path');
  
  if (issues.length > 0) {
    console.error('❌ Configuration incomplete. Please update:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('\n📖 See the comments in this script for guidance.');
    return false;
  }
  
  return true;
}

// Main execution
if (require.main === module) {
  console.log('🍎 Apple Sign In Client Secret Generator\n');
  
  if (validateConfig()) {
    generateAppleClientSecret();
  }
}

module.exports = { generateAppleClientSecret };