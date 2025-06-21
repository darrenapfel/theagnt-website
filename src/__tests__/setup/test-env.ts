/**
 * Test Environment Configuration
 * 
 * This file sets up the test environment with proper mocks and configuration
 * for testing authentication functionality.
 */

// Mock environment variables for testing
export const mockEnvironmentVariables = {
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  APPLE_CLIENT_ID: 'com.theagnt.website',
  APPLE_CLIENT_SECRET: 'test-apple-client-secret',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_KEY: 'test-service-key',
  NEXTAUTH_URL: 'https://theagnt-website-darrens-projects-0443eb48.vercel.app',
  NEXTAUTH_SECRET: 'test-nextauth-secret',
  NODE_ENV: 'test'
};

// Mock NextAuth configuration
export const mockNextAuthConfig = {
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth'
    },
    {
      id: 'apple',
      name: 'Apple',
      type: 'oauth'
    },
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials'
    }
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    session: jest.fn(),
    jwt: jest.fn()
  }
};

// Mock session data
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    isAdmin: false
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

export const mockAdminSession = {
  user: {
    id: 'admin-user-id',
    email: 'darrenapfel@gmail.com',
    name: 'Admin User',
    image: null,
    isAdmin: true
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// Mock Supabase responses
export const mockSupabaseResponses = {
  magicLinkSuccess: {
    success: true,
    magicLink: 'https://test.supabase.co/auth/v1/verify?token=test-token'
  },
  magicLinkError: {
    success: false,
    error: 'Failed to send magic link'
  },
  userData: {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      avatar_url: null
    }
  }
};

// Mock OAuth redirect URLs
export const mockOAuthUrls = {
  google: 'https://accounts.google.com/oauth/authorize?client_id=test-google-client-id&redirect_uri=https%3A%2F%2Ftheagnt-website-darrens-projects-0443eb48.vercel.app%2Fapi%2Fauth%2Fcallback%2Fgoogle',
  apple: 'https://appleid.apple.com/auth/authorize?client_id=com.theagnt.website&redirect_uri=https%3A%2F%2Ftheagnt-website-darrens-projects-0443eb48.vercel.app%2Fapi%2Fauth%2Fcallback%2Fapple'
};

// Expected callback URLs for production
export const expectedCallbackUrls = {
  google: 'https://theagnt-website-darrens-projects-0443eb48.vercel.app/api/auth/callback/google',
  apple: 'https://theagnt-website-darrens-projects-0443eb48.vercel.app/api/auth/callback/apple'
};

// Test utilities
export const setupTestEnvironment = () => {
  // Set up environment variables
  Object.entries(mockEnvironmentVariables).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

export const cleanupTestEnvironment = () => {
  // Clean up environment variables
  Object.keys(mockEnvironmentVariables).forEach(key => {
    delete process.env[key];
  });
};

// Mock fetch responses
export const createMockFetchResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    url: 'http://localhost:3000/api/auth/magic-link'
  } as Response);
};

// Production URL configuration
export const PRODUCTION_URL = 'https://theagnt-website-darrens-projects-0443eb48.vercel.app';
export const LOCAL_URL = 'http://localhost:3000';

// Test data
export const testEmails = {
  valid: 'test@example.com',
  invalid: 'invalid-email',
  admin: 'darrenapfel@gmail.com'
};

// Error messages for testing
export const expectedErrorMessages = {
  invalidEmail: 'Please enter your email address',
  magicLinkFailed: 'Failed to send magic link',
  googleConfigError: 'OAuth provider configuration error',
  appleSignInError: 'sign-in couldn\'t be completed',
  networkError: 'Network error'
};

// Test selectors
export const testSelectors = {
  googleButton: '[data-testid="google-auth-button"]',
  appleButton: '[data-testid="apple-auth-button"]',
  emailButton: '[data-testid="email-auth-button"]',
  emailInput: '[data-testid="email-input"]',
  sendButton: '[data-testid="send-magic-link"]',
  successMessage: '[data-testid="email-sent-message"]',
  errorMessage: '[data-testid="email-error"]',
  authErrorMessage: '[data-testid="error-message"]'
};

export default {
  mockEnvironmentVariables,
  mockNextAuthConfig,
  mockSession,
  mockAdminSession,
  mockSupabaseResponses,
  mockOAuthUrls,
  expectedCallbackUrls,
  setupTestEnvironment,
  cleanupTestEnvironment,
  createMockFetchResponse,
  PRODUCTION_URL,
  LOCAL_URL,
  testEmails,
  expectedErrorMessages,
  testSelectors
};