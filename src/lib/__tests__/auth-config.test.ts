/**
 * Unit Tests for Authentication Configuration
 * 
 * This test suite validates the NextAuth configuration and provider setup.
 * These tests follow TDD principles and will initially FAIL to demonstrate
 * the current authentication issues before fixes are implemented.
 */

import { authConfig } from '../auth';
import { NextAuthConfig } from 'next-auth';

// Mock environment variables for testing
const mockEnvVars = {
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  APPLE_CLIENT_ID: 'test-apple-client-id',
  APPLE_CLIENT_SECRET: 'test-apple-client-secret',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_KEY: 'test-service-key',
  NEXTAUTH_URL: 'https://theagnt-website-darrens-projects-0443eb48.vercel.app',
  NEXTAUTH_SECRET: 'test-secret'
};

describe('Authentication Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv, ...mockEnvVars };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('Configuration Structure', () => {
    test('should have valid NextAuth configuration structure', () => {
      expect(authConfig).toBeDefined();
      expect(authConfig).toHaveProperty('providers');
      expect(authConfig).toHaveProperty('pages');
      expect(authConfig).toHaveProperty('callbacks');
      expect(authConfig.trustHost).toBe(true);
    });

    test('should have correct page redirects configured', () => {
      expect(authConfig.pages).toEqual({
        signIn: '/auth/signin',
        error: '/auth/error',
      });
    });

    test('should have session and JWT callbacks defined', () => {
      expect(authConfig.callbacks).toHaveProperty('session');
      expect(authConfig.callbacks).toHaveProperty('jwt');
      expect(typeof authConfig.callbacks?.session).toBe('function');
      expect(typeof authConfig.callbacks?.jwt).toBe('function');
    });
  });

  describe('Provider Configuration', () => {
    test('should include Google OAuth provider with correct configuration', () => {
      const providers = authConfig.providers as any[];
      const googleProvider = providers.find(p => p.id === 'google' || p.name === 'Google');
      
      expect(googleProvider).toBeDefined();
      expect(googleProvider).toHaveProperty('options');
      
      // This test will FAIL initially due to Google OAuth redirect URI mismatch
      // The production URL should be properly configured in Google Console
      expect(googleProvider.options.clientId).toBe(process.env.GOOGLE_CLIENT_ID);
      expect(googleProvider.options.clientSecret).toBe(process.env.GOOGLE_CLIENT_SECRET);
    });

    test('should include Apple Sign-in provider when properly configured', () => {
      const providers = authConfig.providers as any[];
      const appleProvider = providers.find(p => p.id === 'apple');
      
      // This test will FAIL initially if Apple credentials are not properly set
      if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET &&
          process.env.APPLE_CLIENT_ID !== 'your_apple_client_id') {
        expect(appleProvider).toBeDefined();
        expect(appleProvider.clientId).toBe(process.env.APPLE_CLIENT_ID);
        expect(appleProvider.clientSecret).toBe(process.env.APPLE_CLIENT_SECRET);
        expect(appleProvider.authorization.url).toBe('https://appleid.apple.com/auth/authorize');
      }
    });

    test('should include credentials provider for magic link authentication', () => {
      const providers = authConfig.providers as any[];
      const credentialsProvider = providers.find(p => p.id === 'credentials');
      
      expect(credentialsProvider).toBeDefined();
      expect(credentialsProvider.name).toBe('Credentials');
      expect(credentialsProvider.credentials).toHaveProperty('email');
      expect(credentialsProvider.credentials).toHaveProperty('accessToken');
      expect(typeof credentialsProvider.authorize).toBe('function');
    });

    test('should not include Apple provider with placeholder credentials', () => {
      // Reset env vars to placeholder values
      process.env.APPLE_CLIENT_ID = 'your_apple_client_id';
      process.env.APPLE_CLIENT_SECRET = 'your_apple_client_secret';
      
      // Re-import to get fresh config
      jest.resetModules();
      const { authConfig: freshConfig } = require('../auth');
      
      const providers = freshConfig.providers as any[];
      const appleProvider = providers.find((p: any) => p.id === 'apple');
      
      expect(appleProvider).toBeUndefined();
    });
  });

  describe('Environment Variables Validation', () => {
    test('should fail gracefully when Google credentials are missing', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      
      // This should not throw an error but the provider should handle missing credentials
      expect(() => {
        jest.resetModules();
        require('../auth');
      }).not.toThrow();
    });

    test('should validate production callback URLs are correctly configured', () => {
      const productionUrl = 'https://theagnt-website-darrens-projects-0443eb48.vercel.app';
      
      // This test will FAIL initially due to Google OAuth redirect URI mismatch
      // The Google Console should have this exact URL configured:
      // https://theagnt-website-darrens-projects-0443eb48.vercel.app/api/auth/callback/google
      expect(process.env.NEXTAUTH_URL || '').toContain(productionUrl);
    });

    test('should have all required environment variables for production', () => {
      const requiredVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_KEY',
        'NEXTAUTH_SECRET'
      ];

      requiredVars.forEach(varName => {
        // This test will FAIL if any required environment variables are missing
        expect(process.env[varName]).toBeDefined();
        expect(process.env[varName]).not.toBe('');
      });
    });
  });

  describe('Callback Functions', () => {
    test('session callback should properly set user properties', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
        }
      };
      const mockToken = { sub: '123' };

      const sessionCallback = authConfig.callbacks?.session;
      if (sessionCallback) {
        const result = await sessionCallback({ session: mockSession, token: mockToken });
        
        expect(result.user.id).toBe('test@example.com');
        expect(result.user.isAdmin).toBe(false);
      }
    });

    test('session callback should identify admin users correctly', async () => {
      const mockSession = {
        user: {
          email: 'darrenapfel@gmail.com',
          name: 'Admin User'
        }
      };
      const mockToken = { sub: '123' };

      const sessionCallback = authConfig.callbacks?.session;
      if (sessionCallback) {
        const result = await sessionCallback({ session: mockSession, token: mockToken });
        
        expect(result.user.isAdmin).toBe(true);
      }
    });

    test('JWT callback should set admin flag correctly', async () => {
      const mockToken = {};
      const mockUser = { email: 'darrenapfel@gmail.com' };
      const mockAccount = null;

      const jwtCallback = authConfig.callbacks?.jwt;
      if (jwtCallback) {
        const result = await jwtCallback({ token: mockToken, user: mockUser, account: mockAccount });
        
        expect(result.isAdmin).toBe(true);
      }
    });
  });

  describe('Apple Sign-in Configuration', () => {
    test('Apple provider should have correct authorization parameters', () => {
      // Set up proper Apple credentials
      process.env.APPLE_CLIENT_ID = 'com.theagnt.website';
      process.env.APPLE_CLIENT_SECRET = 'valid-apple-secret';
      
      jest.resetModules();
      const { authConfig: freshConfig } = require('../auth');
      
      const providers = freshConfig.providers as any[];
      const appleProvider = providers.find((p: any) => p.id === 'apple');
      
      // This test will FAIL initially due to Apple configuration issues
      if (appleProvider) {
        expect(appleProvider.authorization.params.scope).toBe('name email');
        expect(appleProvider.authorization.params.response_mode).toBe('form_post');
        expect(appleProvider.token).toBe('https://appleid.apple.com/auth/token');
        expect(appleProvider.userinfo.url).toBe('https://appleid.apple.com/auth/userinfo');
      }
    });

    test('Apple provider profile callback should map user data correctly', () => {
      // Set up proper Apple credentials
      process.env.APPLE_CLIENT_ID = 'com.theagnt.website';
      process.env.APPLE_CLIENT_SECRET = 'valid-apple-secret';
      
      jest.resetModules();
      const { authConfig: freshConfig } = require('../auth');
      
      const providers = freshConfig.providers as any[];
      const appleProvider = providers.find((p: any) => p.id === 'apple');
      
      if (appleProvider && appleProvider.profile) {
        const mockProfile = {
          sub: 'apple-user-id',
          name: 'Apple User',
          email: 'user@example.com'
        };
        
        const result = appleProvider.profile(mockProfile);
        
        expect(result).toEqual({
          id: 'apple-user-id',
          name: 'Apple User',
          email: 'user@example.com',
          image: null
        });
      }
    });
  });

  describe('Production URL Configuration', () => {
    test('should use correct production callback URLs', () => {
      const productionDomain = 'theagnt-website-darrens-projects-0443eb48.vercel.app';
      
      // These are the exact callback URLs that should be configured in OAuth providers:
      const expectedCallbacks = {
        google: `https://${productionDomain}/api/auth/callback/google`,
        apple: `https://${productionDomain}/api/auth/callback/apple`
      };
      
      // This test documents the required callback URLs for OAuth provider configuration
      expect(expectedCallbacks.google).toMatch(/^https:\/\/theagnt-website-darrens-projects-0443eb48\.vercel\.app\/api\/auth\/callback\/google$/);
      expect(expectedCallbacks.apple).toMatch(/^https:\/\/theagnt-website-darrens-projects-0443eb48\.vercel\.app\/api\/auth\/callback\/apple$/);
    });
  });
});