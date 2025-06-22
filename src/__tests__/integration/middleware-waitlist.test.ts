import { NextRequest } from 'next/server';
import { middleware } from '../../../middleware';
import { getToken } from 'next-auth/jwt';

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

describe('Middleware Integration - Waitlist Feature Routes', () => {
  const mockGetToken = getToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Internal Route Protection', () => {
    it('should allow access to /internal for @theagnt.ai users', async () => {
      mockGetToken.mockResolvedValue({
        email: 'team@theagnt.ai',
        name: 'Team Member',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should allow access (return undefined or continue)
      expect(response).toBeUndefined();
    });

    it('should allow access to /internal/waitlist for @theagnt.ai users', async () => {
      mockGetToken.mockResolvedValue({
        email: 'internal@theagnt.ai',
        name: 'Internal User',
      });

      const request = new NextRequest('https://example.com/internal/waitlist');
      const response = await middleware(request);

      expect(response).toBeUndefined();
    });

    it('should allow access to /internal for admin users', async () => {
      mockGetToken.mockResolvedValue({
        email: 'darrenapfel@gmail.com',
        name: 'Admin User',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      expect(response).toBeUndefined();
    });

    it('should allow access to /internal/waitlist for admin users', async () => {
      mockGetToken.mockResolvedValue({
        email: 'darrenapfel@gmail.com',
        name: 'Admin User',
      });

      const request = new NextRequest('https://example.com/internal/waitlist');
      const response = await middleware(request);

      expect(response).toBeUndefined();
    });

    it('should redirect external users from /internal', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should redirect
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toBe('/dashboard');
      }
    });

    it('should redirect external users from /internal/waitlist', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const request = new NextRequest('https://example.com/internal/waitlist');
      const response = await middleware(request);

      // Should redirect
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toBe('/dashboard');
      }
    });

    it('should redirect unauthenticated users from /internal', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should redirect to sign in
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toContain('/auth/signin');
      }
    });

    it('should redirect unauthenticated users from /internal/waitlist', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('https://example.com/internal/waitlist');
      const response = await middleware(request);

      // Should redirect to sign in
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toContain('/auth/signin');
      }
    });
  });

  describe('Public Route Access', () => {
    it('should allow external users to access /dashboard', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const request = new NextRequest('https://example.com/dashboard');
      const response = await middleware(request);

      // Should allow access
      expect(response).toBeUndefined();
    });

    it('should allow internal users to access /dashboard', async () => {
      mockGetToken.mockResolvedValue({
        email: 'internal@theagnt.ai',
        name: 'Internal User',
      });

      const request = new NextRequest('https://example.com/dashboard');
      const response = await middleware(request);

      // Should allow access
      expect(response).toBeUndefined();
    });

    it('should redirect unauthenticated users from /dashboard to signin', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('https://example.com/dashboard');
      const response = await middleware(request);

      // Should redirect to sign in
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toContain('/auth/signin');
      }
    });
  });

  describe('API Route Protection', () => {
    it('should allow all authenticated users to access /api/waitlist', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const request = new NextRequest('https://example.com/api/waitlist');
      const response = await middleware(request);

      // Should allow access (API handles its own auth)
      expect(response).toBeUndefined();
    });

    it('should allow internal users to access /api/admin', async () => {
      mockGetToken.mockResolvedValue({
        email: 'internal@theagnt.ai',
        name: 'Internal User',
      });

      const request = new NextRequest('https://example.com/api/admin');
      const response = await middleware(request);

      // Should allow access
      expect(response).toBeUndefined();
    });

    it('should allow admin users to access /api/admin', async () => {
      mockGetToken.mockResolvedValue({
        email: 'darrenapfel@gmail.com',
        name: 'Admin User',
      });

      const request = new NextRequest('https://example.com/api/admin');
      const response = await middleware(request);

      // Should allow access
      expect(response).toBeUndefined();
    });

    it('should redirect external users from /api/admin', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const request = new NextRequest('https://example.com/api/admin');
      const response = await middleware(request);

      // Should redirect or return 403
      expect(response).toBeDefined();
      if (response) {
        expect([302, 403]).toContain(response.status);
      }
    });
  });

  describe('Domain Validation', () => {
    it('should correctly identify @theagnt.ai domain variations', async () => {
      const testEmails = [
        'user@theagnt.ai',
        'test.user@theagnt.ai',
        'user+tag@theagnt.ai',
        'user_name@theagnt.ai',
      ];

      for (const email of testEmails) {
        mockGetToken.mockResolvedValue({
          email,
          name: 'Test User',
        });

        const request = new NextRequest('https://example.com/internal');
        const response = await middleware(request);

        // Should allow access for all valid @theagnt.ai variations
        expect(response).toBeUndefined();
      }
    });

    it('should reject similar but invalid domains', async () => {
      const testEmails = [
        'user@theagnt.ai.fake.com',
        'user@fake-theagnt.ai',
        'user@theagnt-ai.com',
        'user@theagnts.ai',
      ];

      for (const email of testEmails) {
        mockGetToken.mockResolvedValue({
          email,
          name: 'Test User',
        });

        const request = new NextRequest('https://example.com/internal');
        const response = await middleware(request);

        // Should redirect for invalid domains
        expect(response).toBeDefined();
        if (response) {
          expect(response.status).toBe(302);
        }
      }
    });

    it('should handle admin email specifically', async () => {
      mockGetToken.mockResolvedValue({
        email: 'darrenapfel@gmail.com',
        name: 'Admin User',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should allow access for admin
      expect(response).toBeUndefined();
    });

    it('should reject other gmail addresses', async () => {
      mockGetToken.mockResolvedValue({
        email: 'other@gmail.com',
        name: 'Other User',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should redirect for non-admin gmail addresses
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
      }
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle malformed email addresses', async () => {
      mockGetToken.mockResolvedValue({
        email: 'invalid-email',
        name: 'Test User',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should redirect for malformed emails
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
      }
    });

    it('should handle missing email in token', async () => {
      mockGetToken.mockResolvedValue({
        name: 'Test User',
        // email missing
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should redirect when email is missing
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
      }
    });

    it('should handle null/undefined token', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should redirect unauthenticated users
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toContain('/auth/signin');
      }
    });

    it('should handle case sensitivity in email domains', async () => {
      mockGetToken.mockResolvedValue({
        email: 'user@THEAGNT.AI',
        name: 'Test User',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should handle case-insensitive domain matching
      expect(response).toBeUndefined();
    });

    it('should handle email with extra whitespace', async () => {
      mockGetToken.mockResolvedValue({
        email: '  user@theagnt.ai  ',
        name: 'Test User',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should handle emails with whitespace
      expect(response).toBeUndefined();
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(50) + '@theagnt.ai';
      mockGetToken.mockResolvedValue({
        email: longEmail,
        name: 'Test User',
      });

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should handle long emails if domain is correct
      expect(response).toBeUndefined();
    });
  });

  describe('Route Pattern Matching', () => {
    it('should protect nested internal routes', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const protectedRoutes = [
        '/internal',
        '/internal/',
        '/internal/waitlist',
        '/internal/waitlist/',
        '/internal/settings',
        '/internal/analytics',
      ];

      for (const route of protectedRoutes) {
        const request = new NextRequest(`https://example.com${route}`);
        const response = await middleware(request);

        // All internal routes should be protected
        expect(response).toBeDefined();
        if (response) {
          expect(response.status).toBe(302);
        }
      }
    });

    it('should not interfere with similar but different routes', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const allowedRoutes = [
        '/dashboard',
        '/profile',
        '/settings',
        '/internal-docs', // Note: different from /internal
        '/public-internal',
      ];

      for (const route of allowedRoutes) {
        const request = new NextRequest(`https://example.com${route}`);
        const response = await middleware(request);

        // These routes should not be affected by internal route protection
        // (they may have their own protection, but not the internal-specific logic)
        if (route === '/dashboard') {
          // Dashboard requires auth but allows all authenticated users
          expect(response).toBeUndefined();
        }
      }
    });

    it('should handle query parameters and fragments', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const routesWithParams = [
        '/internal?tab=users',
        '/internal/waitlist?page=2',
        '/internal/waitlist#top',
        '/internal?debug=true&env=dev',
      ];

      for (const route of routesWithParams) {
        const request = new NextRequest(`https://example.com${route}`);
        const response = await middleware(request);

        // Should still protect routes with query params/fragments
        expect(response).toBeDefined();
        if (response) {
          expect(response.status).toBe(302);
        }
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle token verification failures gracefully', async () => {
      mockGetToken.mockRejectedValue(new Error('Token verification failed'));

      const request = new NextRequest('https://example.com/internal');
      const response = await middleware(request);

      // Should treat as unauthenticated and redirect
      expect(response).toBeDefined();
      if (response) {
        expect(response.status).toBe(302);
      }
    });

    it('should handle multiple concurrent requests', async () => {
      mockGetToken.mockResolvedValue({
        email: 'user@theagnt.ai',
        name: 'Test User',
      });

      const requests = Array.from({ length: 10 }, () => 
        new NextRequest('https://example.com/internal')
      );

      const responses = await Promise.all(
        requests.map(request => middleware(request))
      );

      // All requests should be handled consistently
      responses.forEach(response => {
        expect(response).toBeUndefined(); // Should allow access
      });
    });

    it('should not leak sensitive information in redirects', async () => {
      mockGetToken.mockResolvedValue({
        email: 'external@example.com',
        name: 'External User',
      });

      const request = new NextRequest('https://example.com/internal?secret=value');
      const response = await middleware(request);

      expect(response).toBeDefined();
      if (response) {
        const location = response.headers.get('location');
        expect(location).not.toContain('secret=value');
      }
    });
  });
});