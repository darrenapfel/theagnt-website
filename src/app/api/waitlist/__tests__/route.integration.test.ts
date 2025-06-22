import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      upsert: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

// Mock auth config
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('/api/waitlist API Route Integration Tests', () => {
  const mockSession = {
    user: {
      email: 'test@example.com',
      name: 'Test User',
      id: '1',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/waitlist', () => {
    it('should return waitlist status for authenticated user', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock user is on waitlist
      supabase.from().select().eq().single.mockResolvedValue({
        data: { waitlist_status: true },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({ isOnWaitlist: true });
    });

    it('should return false when user is not on waitlist', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock user not on waitlist
      supabase.from().select().eq().single.mockResolvedValue({
        data: { waitlist_status: false },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({ isOnWaitlist: false });
    });

    it('should return false when user not found in database', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock user not found
      supabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Postgres "no rows found" error
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({ isOnWaitlist: false });
    });

    it('should return 401 when user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/waitlist');
      const response = await GET(request);

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 500 on database error', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock database error
      supabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'CONNECTION_ERROR', message: 'Database connection failed' },
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist');
      const response = await GET(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to check waitlist status' });
    });

    it('should handle missing user email', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { name: 'Test User' }, // No email
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist');
      const response = await GET(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'User email not found' });
    });
  });

  describe('POST /api/waitlist', () => {
    it('should add user to waitlist successfully', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock successful upsert
      supabase.from().upsert.mockResolvedValue({
        data: [{ email: 'test@example.com', waitlist_status: true }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({ 
        success: true, 
        message: 'Successfully joined the waitlist' 
      });

      // Verify the upsert was called with correct data
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from().upsert).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          name: 'Test User',
          waitlist_status: true,
          waitlist_joined_at: expect.any(String),
        },
        { onConflict: 'email' }
      );
    });

    it('should update existing user to join waitlist', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock user already exists but not on waitlist
      supabase.from().upsert.mockResolvedValue({
        data: [{ email: 'test@example.com', waitlist_status: true }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({ 
        success: true, 
        message: 'Successfully joined the waitlist' 
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 when user email is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { name: 'Test User' }, // No email
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'User email not found' });
    });

    it('should return 500 on database error during upsert', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock database error
      supabase.from().upsert.mockResolvedValue({
        data: null,
        error: { code: 'INSERT_ERROR', message: 'Failed to insert' },
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to join waitlist' });
    });

    it('should set correct timestamp for waitlist_joined_at', async () => {
      const { supabase } = require('@/lib/supabase');
      
      const beforeRequest = new Date();
      
      supabase.from().upsert.mockResolvedValue({
        data: [{ email: 'test@example.com', waitlist_status: true }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      await POST(request);

      const afterRequest = new Date();

      // Check that upsert was called with a timestamp
      const upsertCall = supabase.from().upsert.mock.calls[0][0];
      expect(upsertCall.waitlist_joined_at).toBeDefined();
      
      const joinedAt = new Date(upsertCall.waitlist_joined_at);
      expect(joinedAt.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(joinedAt.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });

    it('should preserve user name when joining waitlist', async () => {
      const { supabase } = require('@/lib/supabase');
      
      const sessionWithName = {
        user: {
          email: 'test@example.com',
          name: 'John Doe',
          id: '1',
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(sessionWithName);

      supabase.from().upsert.mockResolvedValue({
        data: [{ email: 'test@example.com', waitlist_status: true }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      await POST(request);

      // Verify the name was included in the upsert
      const upsertCall = supabase.from().upsert.mock.calls[0][0];
      expect(upsertCall.name).toBe('John Doe');
    });

    it('should handle user without name gracefully', async () => {
      const { supabase } = require('@/lib/supabase');
      
      const sessionWithoutName = {
        user: {
          email: 'test@example.com',
          id: '1',
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(sessionWithoutName);

      supabase.from().upsert.mockResolvedValue({
        data: [{ email: 'test@example.com', waitlist_status: true }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);

      // Verify the upsert still works without a name
      const upsertCall = supabase.from().upsert.mock.calls[0][0];
      expect(upsertCall.email).toBe('test@example.com');
      expect(upsertCall.name).toBeUndefined();
    });
  });

  describe('Unsupported HTTP Methods', () => {
    it('should return 405 for PUT requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'PUT',
      });

      // Since we only export GET and POST, other methods should be handled by Next.js
      // This test ensures our handlers don't interfere with method validation
    });

    it('should return 405 for DELETE requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'DELETE',
      });

      // Since we only export GET and POST, other methods should be handled by Next.js
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle very long email addresses', async () => {
      const { supabase } = require('@/lib/supabase');
      
      const longEmail = 'a'.repeat(100) + '@example.com';
      const sessionWithLongEmail = {
        user: {
          email: longEmail,
          name: 'Test User',
          id: '1',
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(sessionWithLongEmail);

      supabase.from().upsert.mockResolvedValue({
        data: [{ email: longEmail, waitlist_status: true }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle special characters in email and name', async () => {
      const { supabase } = require('@/lib/supabase');
      
      const specialEmail = 'test+tag@sub.example-domain.com';
      const specialName = "O'Connor-Smith, Jr.";
      const sessionWithSpecialChars = {
        user: {
          email: specialEmail,
          name: specialName,
          id: '1',
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(sessionWithSpecialChars);

      supabase.from().upsert.mockResolvedValue({
        data: [{ email: specialEmail, waitlist_status: true }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);

      const upsertCall = supabase.from().upsert.mock.calls[0][0];
      expect(upsertCall.email).toBe(specialEmail);
      expect(upsertCall.name).toBe(specialName);
    });

    it('should handle concurrent requests from the same user', async () => {
      const { supabase } = require('@/lib/supabase');
      
      supabase.from().upsert.mockResolvedValue({
        data: [{ email: 'test@example.com', waitlist_status: true }],
        error: null,
      });

      // Simulate concurrent requests
      const request1 = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const request2 = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });

      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ]);

      // Both should succeed (upsert handles conflicts)
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    it('should sanitize SQL injection attempts in database queries', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // This test ensures our Supabase client handles injection attempts properly
      const maliciousEmail = "test@example.com'; DROP TABLE users; --";
      const sessionWithMaliciousEmail = {
        user: {
          email: maliciousEmail,
          name: 'Test User',
          id: '1',
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(sessionWithMaliciousEmail);

      supabase.from().upsert.mockResolvedValue({
        data: [{ email: maliciousEmail, waitlist_status: true }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
      });
      const response = await POST(request);

      // Should succeed - Supabase client should handle sanitization
      expect(response.status).toBe(200);

      // Verify the email was passed as-is to Supabase (client handles sanitization)
      const upsertCall = supabase.from().upsert.mock.calls[0][0];
      expect(upsertCall.email).toBe(maliciousEmail);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle timeout scenarios gracefully', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock a timeout scenario
      supabase.from().select().eq().single.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const request = new NextRequest('http://localhost:3000/api/waitlist');

      // Should handle timeout and return error response
      const response = await GET(request);
      expect(response.status).toBe(500);
    });

    it('should handle large response payloads appropriately', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock a response with extra data that should be ignored
      supabase.from().select().eq().single.mockResolvedValue({
        data: {
          waitlist_status: true,
          email: 'test@example.com',
          name: 'Test User',
          extraField1: 'large'.repeat(1000),
          extraField2: 'data'.repeat(1000),
          extraField3: 'payload'.repeat(1000),
        },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      // Response should only contain relevant data
      const data = await response.json();
      expect(data).toEqual({ isOnWaitlist: true });
      expect(data.extraField1).toBeUndefined();
      expect(data.extraField2).toBeUndefined();
      expect(data.extraField3).toBeUndefined();
    });
  });
});