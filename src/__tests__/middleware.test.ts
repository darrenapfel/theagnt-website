/**
 * Middleware Route Protection Tests
 * 
 * Tests the security middleware for route protection, specifically:
 * - Internal route protection for @theagnt.ai domain users
 * - Admin route protection for admin users
 * - Authentication requirements for protected routes
 * - Proper redirect behavior for unauthorized access
 * 
 * @jest-environment node
 */

// Mock the auth function
jest.mock('@/lib/auth-server', () => ({
  auth: jest.fn(),
}));

// Mock the domain utils
jest.mock('@/lib/domain-utils', () => ({
  canAccessInternal: jest.fn(),
  canAccessAdmin: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { middleware } from '../../middleware';
import { auth } from '@/lib/auth-server';
import { canAccessInternal, canAccessAdmin } from '@/lib/domain-utils';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCanAccessInternal = canAccessInternal as jest.MockedFunction<typeof canAccessInternal>;
const mockCanAccessAdmin = canAccessAdmin as jest.MockedFunction<typeof canAccessAdmin>;

// Test helper to create NextRequest objects
function createRequest(pathname: string, search?: string): NextRequest {
  const url = `https://theagnt.ai${pathname}${search || ''}`;
  return new NextRequest(url);
}

// Test helper to create mock session
function createMockSession(email: string) {
  return {
    user: {
      email,
      id: 'test-id',
      name: 'Test User',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

describe('Middleware Route Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    it('should allow access to public routes without authentication', async () => {
      mockAuth.mockResolvedValue(null);
      const request = createRequest('/');
      
      const response = await middleware(request);
      
      expect(response).toBeNull();
    });

    it('should allow access to API routes', async () => {
      mockAuth.mockResolvedValue(null);
      const request = createRequest('/api/health');
      
      const response = await middleware(request);
      
      expect(response).toBeNull();
    });
  });

  describe('Auth Routes (/auth/*)', () => {
    it('should allow unauthenticated users to access auth pages', async () => {
      mockAuth.mockResolvedValue(null);
      const request = createRequest('/auth/signin');
      
      const response = await middleware(request);
      
      expect(response).toBeNull();
    });

    it('should redirect authenticated users away from auth pages', async () => {
      const session = createMockSession('user@theagnt.ai');
      mockAuth.mockResolvedValue(session);
      const request = createRequest('/auth/signin');
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/dashboard');
    });
  });

  describe('Internal Routes (/internal/*)', () => {
    it('should redirect unauthenticated users to signin', async () => {
      mockAuth.mockResolvedValue(null);
      const request = createRequest('/internal');
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/auth/signin?from=%2Finternal');
    });

    it('should redirect unauthenticated users to signin with query params preserved', async () => {
      mockAuth.mockResolvedValue(null);
      const request = createRequest('/internal/waitlist', '?tab=active');
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/auth/signin?from=%2Finternal%2Fwaitlist%3Ftab%3Dactive');
    });

    it('should allow theAGNT.ai domain users to access internal routes', async () => {
      const session = createMockSession('user@theagnt.ai');
      mockAuth.mockResolvedValue(session);
      mockCanAccessInternal.mockReturnValue(true);
      const request = createRequest('/internal');
      
      const response = await middleware(request);
      
      expect(mockCanAccessInternal).toHaveBeenCalledWith('user@theagnt.ai');
      expect(response).toBeNull();
    });

    it('should allow admin users to access internal routes', async () => {
      const session = createMockSession('darrenapfel@gmail.com');
      mockAuth.mockResolvedValue(session);
      mockCanAccessInternal.mockReturnValue(true);
      const request = createRequest('/internal/waitlist');
      
      const response = await middleware(request);
      
      expect(mockCanAccessInternal).toHaveBeenCalledWith('darrenapfel@gmail.com');
      expect(response).toBeNull();
    });

    it('should redirect external users to dashboard', async () => {
      const session = createMockSession('external@gmail.com');
      mockAuth.mockResolvedValue(session);
      mockCanAccessInternal.mockReturnValue(false);
      const request = createRequest('/internal');
      
      const response = await middleware(request);
      
      expect(mockCanAccessInternal).toHaveBeenCalledWith('external@gmail.com');
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/dashboard');
    });
  });

  describe('Admin Routes (/admin/*)', () => {
    it('should redirect unauthenticated users to signin', async () => {
      mockAuth.mockResolvedValue(null);
      const request = createRequest('/admin');
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/auth/signin?from=%2Fadmin');
    });

    it('should allow admin users to access admin routes', async () => {
      const session = createMockSession('darrenapfel@gmail.com');
      mockAuth.mockResolvedValue(session);
      mockCanAccessAdmin.mockReturnValue(true);
      const request = createRequest('/admin');
      
      const response = await middleware(request);
      
      expect(mockCanAccessAdmin).toHaveBeenCalledWith('darrenapfel@gmail.com');
      expect(response).toBeNull();
    });

    it('should redirect non-admin users to dashboard', async () => {
      const session = createMockSession('user@theagnt.ai');
      mockAuth.mockResolvedValue(session);
      mockCanAccessAdmin.mockReturnValue(false);
      const request = createRequest('/admin');
      
      const response = await middleware(request);
      
      expect(mockCanAccessAdmin).toHaveBeenCalledWith('user@theagnt.ai');
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/dashboard');
    });
  });

  describe('Dashboard Routes (/dashboard/*)', () => {
    it('should redirect unauthenticated users to signin', async () => {
      mockAuth.mockResolvedValue(null);
      const request = createRequest('/dashboard');
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/auth/signin?from=%2Fdashboard');
    });

    it('should allow authenticated users to access dashboard', async () => {
      const session = createMockSession('user@gmail.com');
      mockAuth.mockResolvedValue(session);
      const request = createRequest('/dashboard');
      
      const response = await middleware(request);
      
      expect(response).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle sessions without email', async () => {
      const session = { user: { id: 'test-id' }, expires: new Date().toISOString() };
      mockAuth.mockResolvedValue(session as any);
      mockCanAccessInternal.mockReturnValue(false);
      const request = createRequest('/internal');
      
      const response = await middleware(request);
      
      expect(mockCanAccessInternal).toHaveBeenCalledWith(undefined);
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/dashboard');
    });

    it('should handle null session user', async () => {
      const session = { user: null, expires: new Date().toISOString() };
      mockAuth.mockResolvedValue(session as any);
      const request = createRequest('/internal');
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/auth/signin?from=%2Finternal');
    });

    it('should preserve complex query parameters in redirects', async () => {
      mockAuth.mockResolvedValue(null);
      const request = createRequest('/internal/waitlist', '?filter=active&sort=date&page=2');
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/auth/signin?from=%2Finternal%2Fwaitlist%3Ffilter%3Dactive%26sort%3Ddate%26page%3D2');
    });
  });

  describe('Route Priority and Logic Flow', () => {
    it('should check internal routes before dashboard routes', async () => {
      const session = createMockSession('external@gmail.com');
      mockAuth.mockResolvedValue(session);
      mockCanAccessInternal.mockReturnValue(false);
      const request = createRequest('/internal/dashboard');
      
      const response = await middleware(request);
      
      // Should be redirected by internal route logic, not dashboard logic
      expect(mockCanAccessInternal).toHaveBeenCalledWith('external@gmail.com');
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('https://theagnt.ai/dashboard');
    });

    it('should handle nested internal routes correctly', async () => {
      const session = createMockSession('user@theagnt.ai');
      mockAuth.mockResolvedValue(session);
      mockCanAccessInternal.mockReturnValue(true);
      const request = createRequest('/internal/waitlist/details');
      
      const response = await middleware(request);
      
      expect(mockCanAccessInternal).toHaveBeenCalledWith('user@theagnt.ai');
      expect(response).toBeNull();
    });
  });
});

/**
 * Integration Test Scenarios
 * 
 * These scenarios should be tested manually or with E2E tests:
 * 
 * 1. User Flow: External User Attempts Internal Access
 *    - External user logs in successfully
 *    - Attempts to access /internal
 *    - Gets redirected to /dashboard
 *    - Cannot access internal features
 * 
 * 2. User Flow: Internal User Access
 *    - theAGNT.ai user logs in
 *    - Can access /internal routes
 *    - Can access /dashboard routes
 *    - Cannot access /admin routes (unless admin)
 * 
 * 3. User Flow: Admin User Access
 *    - Admin user logs in
 *    - Can access all routes (/internal, /admin, /dashboard)
 *    - Has full system access
 * 
 * 4. User Flow: Direct URL Access
 *    - Unauthenticated user visits /internal/waitlist directly
 *    - Gets redirected to /auth/signin?from=%2Finternal%2Fwaitlist
 *    - After login, gets redirected back to original URL (if authorized)
 * 
 * 5. Security Test: URL Manipulation
 *    - External user tries various /internal/* URLs
 *    - All should redirect to /dashboard
 *    - No internal data should be accessible
 */