# Production Authentication Testing Guide

## Overview
This guide provides step-by-step instructions for testing the authentication issue where @theagnt.ai email users are not being redirected to the internal page after signing in.

## Prerequisites
- A @theagnt.ai email address
- Access to the production website
- A web browser (Chrome, Firefox, or Safari recommended)

## Method 1: Browser Console Testing (Recommended)

### Step 1: Sign In to Production
1. Open your web browser
2. Navigate to the production website
3. Click "Sign In" 
4. Use your @theagnt.ai email address to sign in (via Google OAuth or Magic Link)
5. Wait for the sign-in process to complete

### Step 2: Access Browser Console
**Chrome/Edge:**
- Right-click anywhere on the page
- Select "Inspect" or "Inspect Element"
- Click on the "Console" tab

**Firefox:**
- Right-click anywhere on the page
- Select "Inspect Element"
- Click on the "Console" tab

**Safari:**
- First enable Developer menu: Safari → Preferences → Advanced → Show Develop menu
- Right-click anywhere on the page
- Select "Inspect Element"
- Click on the "Console" tab

### Step 3: Download and Run Test Script
1. In a new browser tab, go to the GitHub repository
2. Navigate to: `test-production-auth-enhanced.js`
3. Click "Raw" button to view the raw file
4. Select all text (Ctrl+A or Cmd+A)
5. Copy the text (Ctrl+C or Cmd+C)
6. Go back to your production site tab with console open
7. Paste the entire script into the console (Ctrl+V or Cmd+V)
8. Press Enter to load the script
9. Type `testProductionAuth()` and press Enter
10. Wait for the test to complete

### Step 4: Save the Results
1. The console will display detailed diagnostic information
2. Right-click in the console area
3. Select "Save as..." to save the console log
4. OR take screenshots of the entire output
5. Share the results with the development team

### What You Should See
After running `testProductionAuth()`, you'll see:
```
=== ENHANCED PRODUCTION AUTH TEST ===

1. CURRENT PAGE:
   URL: https://yoursite.com/dashboard
   Path: /dashboard

2. PAGE CONTENT CHECK:
   ✓ You are on the dashboard
   ❌ ISSUE CONFIRMED: Showing waitlist button instead of redirecting

3. SESSION ANALYSIS:
   Raw session: {...}
   User email: your-email@theagnt.ai
   Email domain: theagnt.ai
   Is @theagnt.ai?: true

[Additional diagnostic information...]
```

## Method 2: Debug URL Parameter

### Step 1: Sign In (same as Method 1)

### Step 2: Add Debug Parameter
1. After signing in, look at your browser's address bar
2. Add `?debug=true` to the end of the URL
   - If URL is: `https://yoursite.com/dashboard`
   - Change to: `https://yoursite.com/dashboard?debug=true`
3. Press Enter to reload with debug mode

### Step 3: Check Debug Panel
1. Look for a small debug panel in the bottom-right corner of the page
2. The panel shows:
   - Your email address from props and session
   - Whether you should have internal access
   - Current page path
3. Take a screenshot of this debug panel

## Method 3: Debug Page

### Step 1: Sign In (same as Method 1)

### Step 2: Navigate to Debug Page
1. In the address bar, change the URL to: `https://yoursite.com/debug/auth`
2. Press Enter to load the debug page

### Step 3: Review Debug Information
The page will show:
- Complete NextAuth session data
- Email session cookie information
- Domain validation results
- Test results for various email addresses

### Step 4: Save the Information
1. Take screenshots of the entire page
2. Pay special attention to:
   - The "NextAuth Session" section
   - The "Domain Validation" section
   - Any error messages

## What We're Testing

### Expected Behavior
When you sign in with a @theagnt.ai email:
1. You should be automatically redirected from `/dashboard` to `/internal`
2. You should see a page that says "this is a special page"
3. There should be a button to view the waitlist

### Current Issue
When you sign in with a @theagnt.ai email:
1. You remain on `/dashboard`
2. You see the regular waitlist join button
3. No redirect occurs

## Troubleshooting

### Console Errors
If you see errors when running the test script:
- Make sure you copied the entire script
- Try refreshing the page and running again
- Check if pop-up blockers are interfering

### Can't Access Console
If your browser doesn't allow console access:
- Try Method 2 (Debug URL) instead
- Use a different browser
- Check if browser extensions are blocking developer tools

### Script Won't Run
If the script doesn't execute:
1. Make sure you're on the production site
2. Ensure you're signed in
3. Try pasting smaller portions of the script
4. Check for any security policies blocking scripts

## Quick Test Commands

You can also run these individual commands in the console:

```javascript
// Test if your email is recognized as internal
testDomainLogic("your-email@theagnt.ai")

// Check your current session
fetch('/api/auth/session').then(r => r.json()).then(console.log)

// Check page location
console.log("Current URL:", window.location.href)
```

## Sharing Results

Please share:
1. The complete console output from `testProductionAuth()`
2. Screenshots of any debug panels or pages
3. Any error messages you encounter
4. Which sign-in method you used (Google OAuth or Magic Link)
5. The exact email address you used (you can partially redact if needed)

## Security Note

The test scripts only read information and don't modify any data. They're safe to run and don't expose any sensitive information beyond what's already available to your browser session.

## Need Help?

If you encounter any issues with testing:
1. Try a different method (there are 3 options)
2. Clear your browser cache and try again
3. Try a different browser
4. Contact the development team with any error messages

---

Thank you for helping debug this authentication issue!