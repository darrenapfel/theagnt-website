import { AdminDashboardData } from '@/types';

/**
 * Test utilities and mock data for waitlist feature testing
 */

// Mock user types for different test scenarios
export const mockUsers = {
  external: {
    email: 'external@example.com',
    name: 'External User',
    id: '1',
    isAdmin: false,
  },
  internal: {
    email: 'internal@theagnt.ai',
    name: 'Internal User',
    id: '2',
    isAdmin: false,
  },
  admin: {
    email: 'darrenapfel@gmail.com',
    name: 'Admin User',
    id: '3',
    isAdmin: true,
  },
  withoutName: {
    email: 'noname@example.com',
    id: '4',
    isAdmin: false,
  },
  withLongEmail: {
    email: 'very.long.email.address.for.testing.purposes@example.com',
    name: 'Long Email User',
    id: '5',
    isAdmin: false,
  },
  withSpecialChars: {
    email: 'test+tag@sub.example-domain.com',
    name: "O'Connor-Smith, Jr.",
    id: '6',
    isAdmin: false,
  },
};

// Mock waitlist data for different scenarios
export const mockWaitlistData: AdminDashboardData = {
  totalUsers: 150,
  waitlistUsers: 45,
  conversionRate: 30,
  users: [
    {
      id: '1',
      email: 'waitlist1@example.com',
      name: 'Waitlist User 1',
      waitlist_status: true,
      waitlist_joined_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-10T10:00:00Z',
      auth_provider: 'google',
      last_login: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      email: 'waitlist2@example.com',
      name: 'Waitlist User 2',
      waitlist_status: true,
      waitlist_joined_at: '2024-01-16T10:00:00Z',
      created_at: '2024-01-11T10:00:00Z',
      auth_provider: 'email',
      last_login: null,
    },
    {
      id: '3',
      email: 'regular@example.com',
      name: 'Regular User',
      waitlist_status: false,
      waitlist_joined_at: null,
      created_at: '2024-01-12T10:00:00Z',
      auth_provider: 'apple',
      last_login: '2024-01-18T10:00:00Z',
    },
  ],
};

// Empty waitlist data
export const mockEmptyWaitlistData: AdminDashboardData = {
  totalUsers: 100,
  waitlistUsers: 0,
  conversionRate: 0,
  users: [],
};

// Large dataset for performance testing
export const mockLargeWaitlistData: AdminDashboardData = {
  totalUsers: 1000,
  waitlistUsers: 250,
  conversionRate: 25,
  users: Array.from({ length: 250 }, (_, index) => ({
    id: `user-${index + 1}`,
    email: `user${index + 1}@example.com`,
    name: `User ${index + 1}`,
    waitlist_status: true,
    waitlist_joined_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    auth_provider: ['google', 'email', 'apple'][index % 3] as 'google' | 'email' | 'apple',
    last_login: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
  })),
};

// Helper functions for test setup
export class WaitlistTestHelpers {
  /**
   * Creates a mock fetch function for waitlist API responses
   */
  static mockWaitlistAPI(scenarios: {
    getResponse?: { isOnWaitlist: boolean; error?: string };
    postResponse?: { success: boolean; error?: string };
    delay?: number;
  } = {}) {
    return jest.fn().mockImplementation(async (url: string, options?: any) => {
      // Simulate network delay if specified
      if (scenarios.delay) {
        await new Promise(resolve => setTimeout(resolve, scenarios.delay));
      }

      if (url.includes('/api/waitlist')) {
        if (!options || options.method === 'GET') {
          // Handle GET request
          if (scenarios.getResponse?.error) {
            return {
              ok: false,
              status: 500,
              text: async () => scenarios.getResponse!.error,
            };
          }
          return {
            ok: true,
            status: 200,
            json: async () => scenarios.getResponse || { isOnWaitlist: false },
          };
        } else if (options.method === 'POST') {
          // Handle POST request
          if (scenarios.postResponse?.error) {
            return {
              ok: false,
              status: 500,
              text: async () => scenarios.postResponse!.error,
            };
          }
          return {
            ok: true,
            status: 200,
            json: async () => scenarios.postResponse || { success: true },
          };
        }
      }

      // Default response for other URLs
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    });
  }

  /**
   * Creates a mock fetch function for admin API responses
   */
  static mockAdminAPI(data: AdminDashboardData | null = null, error?: string, delay?: number) {
    return jest.fn().mockImplementation(async (url: string) => {
      if (delay) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      if (url.includes('/api/admin')) {
        if (error) {
          return {
            ok: false,
            status: 500,
            text: async () => error,
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => data || mockWaitlistData,
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    });
  }

  /**
   * Creates mock session data for NextAuth
   */
  static mockSession(userType: keyof typeof mockUsers) {
    const user = mockUsers[userType];
    return {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Creates mock Supabase client responses
   */
  static mockSupabaseClient(responses: {
    select?: any;
    upsert?: any;
    error?: any;
  } = {}) {
    const mockSelect = jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn().mockResolvedValue(responses.select || { data: null, error: null }),
      })),
    }));

    const mockUpsert = jest.fn().mockResolvedValue(responses.upsert || { data: [], error: null });

    return {
      from: jest.fn(() => ({
        select: mockSelect,
        upsert: mockUpsert,
      })),
    };
  }

  /**
   * Filters waitlist users from admin data (matches component logic)
   */
  static getWaitlistUsers(data: AdminDashboardData) {
    return data.users.filter(user => user.waitlist_status);
  }

  /**
   * Creates formatted export data (matches component logic)
   */
  static createExportData(data: AdminDashboardData) {
    const waitlistUsers = this.getWaitlistUsers(data);
    return waitlistUsers.map((user) => ({
      email: user.email,
      name: user.name || '',
      waitlist_joined: user.waitlist_joined_at
        ? new Date(user.waitlist_joined_at).toLocaleDateString()
        : '',
      signup_date: new Date(user.created_at).toLocaleDateString(),
      auth_provider: user.auth_provider,
      last_login: user.last_login
        ? new Date(user.last_login).toLocaleDateString()
        : 'Never',
    }));
  }

  /**
   * Validates that data matches expected waitlist format
   */
  static validateWaitlistData(data: any): data is AdminDashboardData {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.totalUsers === 'number' &&
      typeof data.waitlistUsers === 'number' &&
      typeof data.conversionRate === 'number' &&
      Array.isArray(data.users) &&
      data.users.every((user: any) => 
        typeof user.id === 'string' &&
        typeof user.email === 'string' &&
        typeof user.waitlist_status === 'boolean' &&
        typeof user.created_at === 'string'
      )
    );
  }

  /**
   * Creates a promise that resolves after specified delay
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates random test data for stress testing
   */
  static generateRandomUser(index: number) {
    const providers = ['google', 'email', 'apple'] as const;
    const domains = ['example.com', 'test.org', 'demo.net'];
    
    return {
      id: `test-user-${index}`,
      email: `testuser${index}@${domains[index % domains.length]}`,
      name: `Test User ${index}`,
      waitlist_status: Math.random() > 0.5,
      waitlist_joined_at: Math.random() > 0.3 
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      auth_provider: providers[index % providers.length],
      last_login: Math.random() > 0.2 
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    };
  }

  /**
   * Creates test data with specific scenarios
   */
  static createTestScenarios() {
    return {
      allOnWaitlist: {
        ...mockWaitlistData,
        users: mockWaitlistData.users.map(user => ({ ...user, waitlist_status: true })),
      },
      noneOnWaitlist: {
        ...mockWaitlistData,
        users: mockWaitlistData.users.map(user => ({ ...user, waitlist_status: false })),
      },
      mixedWithEdgeCases: {
        ...mockWaitlistData,
        users: [
          ...mockWaitlistData.users,
          {
            id: '4',
            email: 'edge-case@example.com',
            name: null, // No name
            waitlist_status: true,
            waitlist_joined_at: null, // On waitlist but no joined date
            created_at: '2024-01-01T00:00:00Z',
            auth_provider: 'google',
            last_login: null,
          },
          {
            id: '5',
            email: 'future-user@example.com',
            name: 'Future User',
            waitlist_status: true,
            waitlist_joined_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Future date
            created_at: '2024-01-01T00:00:00Z',
            auth_provider: 'email',
            last_login: '2024-01-01T00:00:00Z',
          },
        ],
      },
    };
  }

  /**
   * Validates API response format
   */
  static validateAPIResponse(response: any, type: 'waitlist-get' | 'waitlist-post' | 'admin') {
    switch (type) {
      case 'waitlist-get':
        return typeof response === 'object' && 
               response !== null && 
               typeof response.isOnWaitlist === 'boolean';
      
      case 'waitlist-post':
        return typeof response === 'object' && 
               response !== null && 
               typeof response.success === 'boolean';
      
      case 'admin':
        return this.validateWaitlistData(response);
      
      default:
        return false;
    }
  }

  /**
   * Creates console spy for testing error handling
   */
  static createConsoleSpy(method: 'log' | 'error' | 'warn' = 'error') {
    const spy = jest.spyOn(console, method).mockImplementation();
    return {
      spy,
      restore: () => spy.mockRestore(),
      expectCalled: (message?: string) => {
        if (message) {
          expect(spy).toHaveBeenCalledWith(expect.stringContaining(message));
        } else {
          expect(spy).toHaveBeenCalled();
        }
      },
    };
  }
}

// Export types for TypeScript support in tests
export type MockUser = typeof mockUsers[keyof typeof mockUsers];
export type TestScenario = keyof ReturnType<typeof WaitlistTestHelpers.createTestScenarios>;

// Common test assertions
export const testAssertions = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidDate: (dateString: string) => !isNaN(new Date(dateString).getTime()),
  isRecentDate: (dateString: string, withinMinutes = 5) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    return diffMinutes >= 0 && diffMinutes <= withinMinutes;
  },
};