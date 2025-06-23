# Safari Session Testing Guide - Complete Reproduction Steps

## Prerequisites
- Safari browser (preferably latest version)
- A non-@theagnt.ai email account (e.g., Gmail, personal domain)

## Complete Reproduction Steps

### Step 1: Clear Safari Data
1. Open Safari
2. Go to Safari menu → Settings (or Preferences)
3. Click "Privacy" tab
4. Click "Manage Website Data..."
5. Search for "theagnt" or your domain
6. Select and click "Remove"
7. Click "Done"
8. Close and reopen Safari

### Step 2: Sign In to the Website
1. Navigate to: https://theagnt-production.vercel.app
2. Click "Sign In"
3. Choose your authentication method:
   - **Google Sign-In**: Use a non-@theagnt.ai Google account
   - **Email Magic Link**: Enter your email and check inbox
4. Complete the sign-in process
5. You should land on the dashboard page

### Step 3: Verify You're Signed In
You should see:
- Your email displayed at the top
- A "Join the Waitlist" button in the center
- "Sign Out" option in the header

### Step 4: Open Safari Developer Console
1. Right-click anywhere on the page
2. Select "Inspect Element"
3. Click on the "Console" tab

### Step 5: Load the Debug Script
1. In a new browser tab, go to the GitHub repository
2. Navigate to the file: `test-safari-session.js`
3. Click the "Raw" button
4. Select all (Cmd+A) and copy (Cmd+C)
5. Go back to your signed-in tab
6. Click in the console
7. Paste the script (Cmd+V)
8. Press Enter to load it

### Step 6: Run the Debug Test
1. In the console, type: `testSafariSession()`
2. Press Enter
3. Wait for all tests to complete

### Step 7: Capture the Output
The output will show:
```
=== SAFARI SESSION DEBUG ===

1. Testing NextAuth session...
   Session response: 200
   Session data: {...}

2. Testing debug session...
   Debug response: 200
   Debug data: {...}

3. Document cookies:
   Total cookies: X
   Auth-related cookies: [...]

4. Testing waitlist API...
   Waitlist response: 401
   Waitlist data: {error: "Unauthorized"}

=== END DEBUG ===
```

### Step 8: Test the Waitlist Button
1. After running the debug script
2. Click the "Join the Waitlist" button
3. Note any errors that appear
4. Check the console for additional error messages

### Step 9: Share Results
Please share:
1. The complete output from `testSafariSession()`
2. Any errors when clicking "Join the Waitlist"
3. Safari version (Safari → About Safari)
4. Whether you're using:
   - Private browsing mode?
   - Any content blockers?
   - Cross-site tracking prevention enabled?

## Expected vs Actual Results

**Expected:**
- Session data should show your email
- Cookies should include next-auth session cookies
- Waitlist API should return 200 OK
- Clicking "Join Waitlist" should show success message

**Actual (Current Issue):**
- Session might be missing on server side
- Waitlist API returns 401 Unauthorized
- Join button shows "Unauthorized" error

## Additional Tests (If Needed)

### Test A: Check Cookie Settings
1. Safari → Settings → Privacy
2. Note if "Prevent cross-site tracking" is enabled
3. Note if "Block all cookies" is enabled

### Test B: Try Another Browser
1. Sign in using Chrome or Firefox
2. Run the same test script
3. Compare results

### Test C: Network Tab Analysis
1. Open Network tab in Developer Tools
2. Click "Join the Waitlist"
3. Find the `/api/waitlist` request
4. Check Request Headers for cookies
5. Screenshot the headers

This complete reproduction will help us identify exactly why Safari is having session issues!