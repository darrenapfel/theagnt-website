# Authentication Debugging Guide

## Issue: @theagnt.ai users not being redirected to /internal

### Problem Description
Users with @theagnt.ai email addresses are not being automatically redirected from `/dashboard` to `/internal` as expected. They still see the waitlist join button instead of being redirected.

### Debug Steps Implemented

1. **Added Debug Logging**
   - `/src/app/dashboard/page.tsx` - Server-side session extraction logging
   - `/src/components/dashboard/DashboardRedirect.tsx` - Client-side redirect logic logging

2. **Created Debug Pages**
   - `/debug/session` - Shows full session data, email extraction, and domain validation
   - `/dev/auth` - Development auth testing page to quickly switch between user types

3. **Created Test Infrastructure**
   - `/e2e/fixtures/auth.ts` - Playwright auth fixtures for mocked testing
   - `/e2e/auth-mocked.spec.ts` - Comprehensive auth tests without real OAuth
   - `/src/lib/auth-dev.ts` - Development session utilities
   - `/src/lib/test-utils.ts` - Test session injection helpers

### How to Debug

1. **Start the dev server**: `npm run dev`

2. **Check console logs** when accessing dashboard:
   ```
   🔍 Dashboard Debug Info:
     - NextAuth session: [session object]
     - Email session cookie: [cookie value]
     - Session user email: [extracted email]
     - Final user object: [user object]
   ```

3. **Visit debug pages**:
   - http://localhost:3000/debug/session - See full session data
   - http://localhost:3000/dev/auth - Test with different user types

4. **Run domain utils test**: `npx tsx scripts/test-auth.ts`

### Test Users

- **Admin**: darrenapfel@gmail.com (stays on dashboard, sees admin link)
- **Internal**: test@theagnt.ai (should redirect to /internal)
- **External**: test@example.com (stays on dashboard, no admin link)

### Expected Behavior

1. User signs in with @theagnt.ai email
2. Navigates to /dashboard
3. DashboardRedirect component checks email domain
4. If domain is theagnt.ai, redirects to /internal
5. Otherwise, shows dashboard with waitlist

### Troubleshooting Checklist

- [ ] Check if email is being extracted correctly from session
- [ ] Verify email format (no extra spaces, correct case)
- [ ] Confirm canAccessInternal() returns true for @theagnt.ai emails
- [ ] Check if redirect is firing in useEffect
- [ ] Verify /internal page exists and is accessible

### Running Tests

```bash
# Run mocked auth tests (headless)
npm run test:e2e -- auth-mocked.spec.ts

# Run with UI for debugging
npm run test:e2e:ui -- auth-mocked.spec.ts

# Run specific test
npm run test:e2e -- auth-mocked.spec.ts -g "internal user should be redirected"
```

### Playwright Configuration

Updated to use headless mode by default:
- `headless: true` in playwright.config.ts
- No `slowMo` delays
- Mocked authentication to avoid real OAuth flows