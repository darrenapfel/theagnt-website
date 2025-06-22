# 🐛 Authentication Debug Guide

## Quick Diagnosis Steps

### 1. **Check Console Logs (Most Important)**
When you sign in with a @theagnt.ai email, open browser DevTools console and look for:

```
🔍 Dashboard Debug - Session:
🔍 Dashboard Debug - Email Session:
🔍 Dashboard Debug - User Object:
🔍 Dashboard Debug - Final Email:
🔍 DashboardRedirect - Email received:
🔍 DashboardRedirect - canAccessInternal result:
```

**Look for these specific issues:**
- Is `Final Email` showing your @theagnt.ai address?
- Is `canAccessInternal result` showing `true` or `false`?
- Are there any undefined/null values?

### 2. **Visit Debug Pages**
After signing in, visit these URLs:

**Session Inspector:**
```
http://localhost:3000/debug/session
```
This shows your complete session data and domain validation results.

**Development Auth Tester:**
```
http://localhost:3000/dev/auth
```
This lets you quickly switch between user types for testing.

### 3. **Manual Domain Testing**
Open browser console on any page and run:
```javascript
// Test domain checking function
const { canAccessInternal } = await import('/src/lib/domain-utils.ts');
console.log('Your email domain check:', canAccessInternal('youremail@theagnt.ai'));
```

## Common Issues & Solutions

### **Issue 1: Email Extraction Problem**
**Symptoms:** Console shows `undefined` or `null` for email
**Solution:** Check session structure - NextAuth vs email session format mismatch

### **Issue 2: Domain Check Failing**
**Symptoms:** Email shows correctly but `canAccessInternal` returns `false`
**Solution:** Verify email format and domain extraction logic

### **Issue 3: Redirect Not Triggering**
**Symptoms:** Domain check passes but no redirect happens
**Solution:** Check React useEffect dependencies and router state

### **Issue 4: Session Cookie Issues**
**Symptoms:** No session data at all
**Solution:** Check browser cookies and NextAuth configuration

## Quick Test Commands

### Test Domain Utils Directly:
```bash
cd /Users/darrenapfel/DEVELOPER/CatalystWeb/catalyst-web/theagnt-website
npx ts-node scripts/test-auth.ts
```

### Run Mocked Auth Tests:
```bash
npm run test:e2e -- auth-mocked.spec.ts --headed
```

## Development Auth Override

For immediate testing, visit `/dev/auth` and click:
- **"Sign in as Internal User"** - Simulates @theagnt.ai email
- **"Sign in as External User"** - Simulates @gmail.com email  
- **"Sign in as Admin"** - Simulates darrenapfel@gmail.com

This bypasses real auth and sets development cookies.

## Expected Behavior

### ✅ Correct Flow for @theagnt.ai User:
1. Sign in → Console shows your email
2. `canAccessInternal` returns `true`
3. Redirect component shows "Redirecting to internal dashboard..."
4. Navigate to `/internal` page
5. See "this is a special page" message

### ❌ Current Bug:
1. Sign in → Email shows correctly(?)
2. `canAccessInternal` returns `false`(?) 
3. No redirect happens
4. See waitlist join button instead

## Data to Collect

Please share the console output showing:
1. What email value is being passed to DashboardRedirect
2. What `canAccessInternal(email)` returns
3. The complete session object from `/debug/session`

This will help identify exactly where the logic is failing.