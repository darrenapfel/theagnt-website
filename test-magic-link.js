#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testMagicLink() {
  try {
    console.log('🧪 Testing magic link API...');
    
    const response = await fetch('http://localhost:3001/api/auth/magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        redirectTo: '/dashboard',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Magic link API test successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (data.magicLink) {
        console.log('\n🔗 Magic Link:', data.magicLink);
        console.log('\nYou can test this link in your browser!');
      }
    } else {
      console.log('❌ Magic link API test failed');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the development server is running with: npm run dev');
    }
  }
}

testMagicLink();