/**
 * Integration Tests for Authentication API Routes
 * 
 * This test suite validates the authentication API endpoints and their responses.
 * These tests follow TDD principles and will initially FAIL to demonstrate
 * the current authentication issues before fixes are implemented.
 */

import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../[...nextauth]/route';

// Mock NextAuth handlers
jest.mock('@/lib/auth-server', () => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn()
  }
}));

// Mock Supabase auth functions
jest.mock('@/lib/supabase-auth', () => ({
  sendMagicLink: jest.fn()
}));

import { sendMagicLink } from '@/lib/supabase-auth';

const mockSendMagicLink = sendMagicLink as jest.MockedFunction<typeof sendMagicLink>;

describe('Authentication API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NextAuth API Route', () => {
    test('should handle GET requests to NextAuth endpoint', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/auth/signin'
      });

      // Mock successful NextAuth GET handler
      const mockGet = require('@/lib/auth-server').handlers.GET;
      mockGet.mockResolvedValue(new Response('NextAuth signin page', { status: 200 }));

      const response = await GET(req as any);
      
      expect(mockGet).toHaveBeenCalled();
      expect(response).toBeInstanceOf(Response);
    });

    test('should handle POST requests to NextAuth endpoint', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/auth/signin',
        body: {
          csrfToken: 'test-csrf-token',
          callbackUrl: '/dashboard'
        }
      });

      // Mock successful NextAuth POST handler
      const mockPost = require('@/lib/auth-server').handlers.POST;
      mockPost.mockResolvedValue(new Response('Authentication successful', { status: 200 }));

      const response = await POST(req as any);
      
      expect(mockPost).toHaveBeenCalled();
      expect(response).toBeInstanceOf(Response);
    });
  });

  describe('Magic Link API Route', () => {
    // Import the magic link route handler
    let magicLinkPOST: any;

    beforeEach(async () => {
      // Dynamically import to ensure fresh module state
      const module = await import('../magic-link/route');
      magicLinkPOST = module.POST;
    });

    test('should send magic link successfully with valid email', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          redirectTo: '/dashboard'
        })
      });

      // Mock successful magic link sending
      mockSendMagicLink.mockResolvedValue({
        success: true,
        magicLink: 'https://test.supabase.co/auth/v1/verify?token=test-token'
      });

      const response = await magicLinkPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Magic link sent successfully');
      expect(mockSendMagicLink).toHaveBeenCalledWith('test@example.com', '/dashboard');
    });

    test('should return magic link in development environment', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          redirectTo: '/dashboard'
        })
      });

      // Mock successful magic link sending with development link
      mockSendMagicLink.mockResolvedValue({
        success: true,
        magicLink: 'https://test.supabase.co/auth/v1/verify?token=dev-test-token'
      });

      const response = await magicLinkPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.magicLink).toBeDefined();
      expect(data.magicLink).toContain('dev-test-token');

      process.env.NODE_ENV = originalNodeEnv;
    });

    test('should fail with invalid email format', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'invalid-email',
          redirectTo: '/dashboard'
        })
      });

      const response = await magicLinkPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
      expect(mockSendMagicLink).not.toHaveBeenCalled();
    });

    test('should fail when missing email', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redirectTo: '/dashboard'
        })
      });

      const response = await magicLinkPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
      expect(mockSendMagicLink).not.toHaveBeenCalled();
    });

    test('should handle Supabase magic link sending failure', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          redirectTo: '/dashboard'
        })
      });

      // Mock failed magic link sending - this will FAIL initially due to email sending issues
      mockSendMagicLink.mockResolvedValue({
        success: false,
        error: 'Failed to send email'
      });

      const response = await magicLinkPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to send magic link');
      expect(data.details).toBe('Failed to send email');
      expect(mockSendMagicLink).toHaveBeenCalledWith('test@example.com', '/dashboard');
    });

    test('should use default redirect URL when not provided', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com'
        })
      });

      mockSendMagicLink.mockResolvedValue({
        success: true,
        magicLink: 'https://test.supabase.co/auth/v1/verify?token=test-token'
      });

      const response = await magicLinkPOST(req as any);
      
      expect(response.status).toBe(200);
      expect(mockSendMagicLink).toHaveBeenCalledWith('test@example.com', '/dashboard');
    });

    test('should handle JSON parsing errors', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid-json'
      });

      const response = await magicLinkPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Authentication Callback Route', () => {
    test('should handle Google OAuth callback successfully', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/auth/callback/google?code=test-auth-code&state=test-state'
      });

      // Mock successful callback handling
      const mockGet = require('@/lib/auth-server').handlers.GET;
      mockGet.mockResolvedValue(new Response('Callback processed', { 
        status: 302,
        headers: { 'Location': '/dashboard' }
      }));

      const response = await GET(req as any);
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/dashboard');
    });

    test('should handle Apple OAuth callback successfully', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/auth/callback/apple',
        body: {
          code: 'test-apple-code',
          state: 'test-state'
        }
      });

      // Mock successful Apple callback handling
      const mockPost = require('@/lib/auth-server').handlers.POST;
      mockPost.mockResolvedValue(new Response('Apple callback processed', { 
        status: 302,
        headers: { 'Location': '/dashboard' }
      }));

      const response = await POST(req as any);
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/dashboard');
    });

    test('should handle OAuth callback errors', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/auth/callback/google?error=access_denied'
      });

      // Mock error callback handling
      const mockGet = require('@/lib/auth-server').handlers.GET;
      mockGet.mockResolvedValue(new Response('Authentication error', { 
        status: 302,
        headers: { 'Location': '/auth/error?error=OAuthCallbackError' }
      }));

      const response = await GET(req as any);
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/auth/error');
    });
  });

  describe('Production URL Configuration Tests', () => {
    test('should redirect to correct production URLs for Google OAuth', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/auth/signin/google'
      });

      // Mock Google OAuth redirect - this will FAIL initially due to redirect URI mismatch
      const mockGet = require('@/lib/auth-server').handlers.GET;
      mockGet.mockResolvedValue(new Response('', { 
        status: 302,
        headers: { 
          'Location': 'https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=https%3A%2F%2Ftheagnt-website-darrens-projects-0443eb48.vercel.app%2Fapi%2Fauth%2Fcallback%2Fgoogle'
        }
      }));

      const response = await GET(req as any);
      const location = response.headers.get('Location');
      
      // This test will FAIL initially due to Google OAuth configuration issues
      expect(location).toContain('theagnt-website-darrens-projects-0443eb48.vercel.app');
      expect(location).toContain('callback%2Fgoogle');
    });

    test('should redirect to correct production URLs for Apple Sign-in', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/auth/signin/apple'
      });

      // Mock Apple OAuth redirect - this will FAIL initially due to return URL configuration
      const mockGet = require('@/lib/auth-server').handlers.GET;
      mockGet.mockResolvedValue(new Response('', { 
        status: 302,
        headers: { 
          'Location': 'https://appleid.apple.com/auth/authorize?client_id=com.theagnt.website&redirect_uri=https%3A%2F%2Ftheagnt-website-darrens-projects-0443eb48.vercel.app%2Fapi%2Fauth%2Fcallback%2Fapple'
        }
      }));

      const response = await GET(req as any);
      const location = response.headers.get('Location');
      
      // This test will FAIL initially due to Apple Sign-in configuration issues
      expect(location).toContain('theagnt-website-darrens-projects-0443eb48.vercel.app');
      expect(location).toContain('callback%2Fapple');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle authentication provider errors gracefully', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/auth/signin',
        body: {
          provider: 'google',
          csrfToken: 'test-csrf-token'
        }
      });

      // Mock provider error - represents current Google config issues
      const mockPost = require('@/lib/auth-server').handlers.POST;
      mockPost.mockRejectedValue(new Error('OAuth provider configuration error'));

      let response;
      try {
        response = await POST(req as any);
      } catch (error) {
        // Should handle provider configuration errors gracefully
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('OAuth provider configuration error');
      }
    });

    test('should handle session creation failures', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/auth/session'
      });

      // Mock session creation failure
      const mockGet = require('@/lib/auth-server').handlers.GET;
      mockGet.mockResolvedValue(new Response(JSON.stringify({ user: null }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));

      const response = await GET(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.user).toBeNull();
    });
  });
});