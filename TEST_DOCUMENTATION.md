# Authentication Test Suite Documentation

This document describes the comprehensive test suite created for authentication system validation using Test-Driven Development (TDD) principles.

## Overview

The test suite validates all authentication provider functionality BEFORE fixes are implemented. These tests will initially **FAIL** to demonstrate the current authentication issues and serve as acceptance criteria for the software engineering fixes.

## Test Structure

### 1. Unit Tests - Auth Configuration
**Location**: `/src/lib/__tests__/auth-config.test.ts`

**Purpose**: Validates NextAuth configuration and provider setup

**Key Test Areas**:
- Configuration structure validation
- Provider configuration (Google, Apple, Email)
- Environment variable validation
- Callback function testing
- Production URL configuration

**Expected Initial Failures**:
- Google OAuth redirect URI mismatch
- Apple Sign-in configuration issues
- Missing environment variables

### 2. Integration Tests - Auth API Routes
**Location**: `/src/app/api/auth/__tests__/auth-integration.test.ts`

**Purpose**: Validates authentication API endpoints and responses

**Key Test Areas**:
- NextAuth API route handling
- Magic link API endpoint testing
- OAuth callback processing
- Error handling scenarios
- Production URL redirects

**Expected Initial Failures**:
- Magic link email sending failures
- OAuth provider configuration errors
- Callback processing issues

### 3. E2E Tests - Authentication Flows
**Location**: `/e2e/auth-providers.spec.ts`

**Purpose**: Validates complete authentication flows for all providers

**Key Test Areas**:
- Google OAuth flow testing
- Apple Sign-in flow testing
- Email magic link flow testing
- Authentication state management
- Error page handling
- Accessibility and mobile responsiveness

**Expected Initial Failures**:
- Google OAuth redirect errors
- Apple Sign-in completion failures
- Magic link email not sending
- Authentication state issues

### 4. Component Tests - Auth UI
**Location**: `/src/components/auth/__tests__/auth-providers.test.tsx`

**Purpose**: Validates authentication UI components and interactions

**Key Test Areas**:
- AuthButton component functionality
- EmailAuthButton component functionality
- Component integration testing
- Error handling in UI
- Accessibility attributes

**Expected Initial Failures**:
- Component interaction failures
- API integration issues
- Error state handling

## Production Configuration

The tests are configured to validate the actual production deployment:

**Production URL**: `https://theagnt-website-darrens-projects-0443eb48.vercel.app`

**Required OAuth Callback URLs**:
- Google: `https://theagnt-website-darrens-projects-0443eb48.vercel.app/api/auth/callback/google`
- Apple: `https://theagnt-website-darrens-projects-0443eb48.vercel.app/api/auth/callback/apple`

## Running the Tests

### Unit and Integration Tests (Jest)
```bash
# Run all unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test auth-config.test.ts
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (for debugging)
npm run test:e2e:headed

# Run E2E tests with UI
npm run test:e2e:ui

# Run tests against production
TEST_PRODUCTION=true npm run test:e2e
```

### Full Test Suite
```bash
# Run all tests (unit, integration, and E2E)
npm run test:all

# Validate entire project (includes linting and type checking)
npm run validate:full
```

## Test Environment Setup

### Environment Variables Required
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=com.theagnt.website
APPLE_CLIENT_SECRET=your_apple_client_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
NEXTAUTH_URL=https://theagnt-website-darrens-projects-0443eb48.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

### Test Data Attributes Added

The following test IDs have been added to components for reliable testing:

- `data-testid="google-auth-button"` - Google OAuth button
- `data-testid="apple-auth-button"` - Apple Sign-in button  
- `data-testid="email-auth-button"` - Email authentication button
- `data-testid="email-input"` - Email input field
- `data-testid="send-magic-link"` - Send magic link button
- `data-testid="email-sent-message"` - Success message display
- `data-testid="email-error"` - Error message display
- `data-testid="error-message"` - Auth error page message

## Expected Test Results

### Before Fixes (Current State)
❌ **ALL TESTS SHOULD FAIL** demonstrating:
- Google OAuth redirect URI mismatch
- Apple Sign-in configuration errors
- Magic link emails not sending
- Authentication flow failures

### After Fixes (Target State)
✅ **ALL TESTS SHOULD PASS** confirming:
- Proper OAuth provider configuration
- Working magic link email delivery
- Successful authentication flows
- Proper error handling

## Test Categories

### 🔴 Critical Tests (Must Pass for Production)
- OAuth provider redirects work correctly
- Magic link emails are delivered
- Authentication flows complete successfully
- Production callback URLs are configured

### 🟡 Important Tests (Should Pass for Quality)
- Error handling works properly
- UI components behave correctly
- Accessibility requirements are met
- Mobile responsiveness works

### 🟢 Enhancement Tests (Nice to Have)
- Loading states work properly
- Advanced error scenarios handled
- Performance requirements met
- Advanced accessibility features

## Debugging Failed Tests

### Unit Test Failures
1. Check environment variable configuration
2. Verify NextAuth provider setup
3. Review callback function implementation

### Integration Test Failures
1. Check API route implementations
2. Verify Supabase configuration
3. Test magic link functionality manually

### E2E Test Failures
1. Run tests in headed mode to see browser behavior
2. Check network requests in browser dev tools
3. Verify OAuth provider console configuration
4. Test authentication flows manually

### Component Test Failures
1. Check component prop handling
2. Verify mock implementations
3. Review component event handling

## Test Maintenance

### Adding New Tests
1. Follow existing naming conventions
2. Add proper test descriptions
3. Include both positive and negative test cases
4. Update test documentation

### Updating Tests
1. Update tests when authentication logic changes
2. Maintain test data consistency
3. Keep production URL configuration current
4. Update expected error messages as needed

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

- All tests must pass before deployment
- Tests validate both local and production configurations
- Failed tests block deployment to prevent authentication issues

## Support and Troubleshooting

### Common Issues
1. **Environment variables not set**: Check `.env.local` file
2. **OAuth provider not configured**: Verify Google/Apple Console settings
3. **Supabase connection issues**: Check Supabase project configuration
4. **Production URL mismatches**: Verify callback URL configuration

### Getting Help
- Review test failure output for specific error messages
- Check browser developer tools for network errors
- Verify OAuth provider console configuration
- Test authentication flows manually in different browsers

This test suite provides comprehensive coverage of authentication functionality and serves as both validation and documentation for the authentication system.