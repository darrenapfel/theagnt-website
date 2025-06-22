// Test middleware redirect behavior for external users
const fetch = require('node-fetch');

async function testMiddlewareRedirect() {
  console.log('Testing middleware redirect for external users...\n');
  
  try {
    // First, login as external user
    const loginResponse = await fetch('http://localhost:3000/api/dev/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'external@gmail.com' }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    // Get the cookie from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies set:', cookies);
    
    // Now try to access /internal with the external user cookie
    console.log('\nAttempting to access /internal as external user...');
    const internalResponse = await fetch('http://localhost:3000/internal', {
      headers: {
        'Cookie': cookies,
      },
      redirect: 'manual', // Don't follow redirects
    });
    
    console.log('Response status:', internalResponse.status);
    console.log('Response location:', internalResponse.headers.get('location'));
    
    if (internalResponse.status === 307 || internalResponse.status === 302) {
      console.log('✅ SUCCESS: External user was redirected');
      console.log('Redirect target:', internalResponse.headers.get('location'));
    } else {
      console.log('❌ FAILURE: External user was NOT redirected');
      console.log('Headers:', Object.fromEntries(internalResponse.headers));
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testMiddlewareRedirect();