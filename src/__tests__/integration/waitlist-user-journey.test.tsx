import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';
import InternalPage from '@/app/internal/page';
import InternalWaitlistPage from '@/app/internal/waitlist/page';
import { WaitlistTestHelpers, mockUsers, mockWaitlistData } from '../utils/waitlist-test-helpers';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

jest.mock('@/components/ui/Logo', () => {
  return function MockLogo() {
    return <div data-testid="logo">theAGNT.ai</div>;
  };
});

jest.mock('@/components/ui/OptimizedButton', () => {
  return function MockOptimizedButton({ children, onClick, disabled, ...props }: any) {
    return (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    );
  };
});

jest.mock('@/lib/utils', () => ({
  exportToCSV: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Waitlist Feature - Complete User Journey Integration Tests', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (global.fetch as jest.Mock).mockClear();
  });

  describe('External User Complete Journey', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: WaitlistTestHelpers.mockSession('external'),
        status: 'authenticated',
      });
    });

    it('should complete the full external user waitlist journey', async () => {
      // Setup: User not on waitlist initially
      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockWaitlistAPI({
        getResponse: { isOnWaitlist: false },
        postResponse: { success: true },
      });

      // Step 1: Render WaitlistStatus component (as it appears on dashboard)
      render(<WaitlistStatus user={mockUsers.external} />);

      // Step 2: Wait for initial load and verify join button appears
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      // Verify API was called to check status
      expect(global.fetch).toHaveBeenCalledWith('/api/waitlist');

      // Step 3: User clicks join button
      const joinButton = screen.getByText('Join the Waitlist');
      fireEvent.click(joinButton);

      // Step 4: Verify API was called to join waitlist
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/waitlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      // Step 5: Verify success state is displayed
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
        expect(screen.queryByText('Join the Waitlist')).not.toBeInTheDocument();
      });
    });

    it('should handle returning user already on waitlist', async () => {
      // Setup: User already on waitlist
      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockWaitlistAPI({
        getResponse: { isOnWaitlist: true },
      });

      render(<WaitlistStatus user={mockUsers.external} />);

      // Should immediately show waitlist confirmation
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
        expect(screen.queryByText('Join the Waitlist')).not.toBeInTheDocument();
      });

      // Should not make POST request since user is already on waitlist
      const postCalls = (global.fetch as jest.Mock).mock.calls.filter(
        call => call[1]?.method === 'POST'
      );
      expect(postCalls).toHaveLength(0);
    });

    it('should handle join waitlist failure gracefully', async () => {
      // Setup: GET succeeds, POST fails
      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockWaitlistAPI({
        getResponse: { isOnWaitlist: false },
        postResponse: { error: 'Server error' },
      });

      render(<WaitlistStatus user={mockUsers.external} />);

      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist');
      fireEvent.click(joinButton);

      // Should remain in join state after failure
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
        expect(screen.queryByText("You're on the waitlist.")).not.toBeInTheDocument();
      });
    });

    it('should handle slow network responses', async () => {
      // Setup: Slow API responses
      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockWaitlistAPI({
        getResponse: { isOnWaitlist: false },
        postResponse: { success: true },
        delay: 500,
      });

      const { container } = render(<WaitlistStatus user={mockUsers.external} />);

      // Should show loading state initially
      const loadingSpinner = container.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();

      // Eventually shows join button
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      }, { timeout: 1000 });

      const joinButton = screen.getByText('Join the Waitlist');
      fireEvent.click(joinButton);

      // Should show loading during join process
      await waitFor(() => {
        const loadingSpinner = container.querySelector('.animate-spin');
        expect(loadingSpinner).toBeInTheDocument();
      });

      // Eventually shows success
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Internal User Complete Journey', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: WaitlistTestHelpers.mockSession('internal'),
        status: 'authenticated',
      });
    });

    it('should complete the full internal user journey', async () => {
      // Setup: Admin API returns waitlist data
      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockAdminAPI(mockWaitlistData);

      // Step 1: Start at internal page
      render(<InternalPage />);

      // Step 2: Verify internal page content
      expect(screen.getByText('this is a special page')).toBeInTheDocument();
      expect(screen.getByText('Restricted access for theAGNT.ai team members')).toBeInTheDocument();
      expect(screen.getByText('View Waitlist Entries')).toBeInTheDocument();

      // Step 3: Navigate to waitlist
      const waitlistButton = screen.getByText('View Waitlist Entries');
      fireEvent.click(waitlistButton);

      // Verify navigation was triggered
      expect(mockPush).toHaveBeenCalledWith('/internal/waitlist');

      // Step 4: Render waitlist page (simulating navigation)
      const { rerender } = render(<InternalWaitlistPage />);

      // Step 5: Verify waitlist page loads and displays data
      await waitFor(() => {
        expect(screen.getByText('Waitlist Entries')).toBeInTheDocument();
      });

      // Check metrics are displayed
      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(screen.getByText('Waitlist Members')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Only waitlist users
      });

      // Check table data
      await waitFor(() => {
        expect(screen.getByText('waitlist1@example.com')).toBeInTheDocument();
        expect(screen.getByText('waitlist2@example.com')).toBeInTheDocument();
        // Should not show non-waitlist users
        expect(screen.queryByText('regular@example.com')).not.toBeInTheDocument();
      });

      // Step 6: Test export functionality
      const exportButton = screen.getByText('Export Waitlist CSV');
      expect(exportButton).not.toBeDisabled();

      fireEvent.click(exportButton);

      const { exportToCSV } = require('@/lib/utils');
      expect(exportToCSV).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            email: 'waitlist1@example.com',
            name: 'Waitlist User 1',
          }),
          expect.objectContaining({
            email: 'waitlist2@example.com',
            name: 'Waitlist User 2',
          }),
        ]),
        expect.stringMatching(/theagnt-waitlist-\d{4}-\d{2}-\d{2}\.csv/)
      );

      // Step 7: Navigate back
      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/internal');
    });

    it('should handle error recovery in internal user journey', async () => {
      // Setup: API fails initially, then succeeds
      let requestCount = 0;
      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        requestCount++;
        if (url.includes('/api/admin')) {
          if (requestCount === 1) {
            return {
              ok: false,
              status: 500,
              text: async () => 'Server error',
            };
          } else {
            return {
              ok: true,
              status: 200,
              json: async () => mockWaitlistData,
            };
          }
        }
        return { ok: true, status: 200, json: async () => ({}) };
      });

      render(<InternalWaitlistPage />);

      // Should show error state first
      await waitFor(() => {
        expect(screen.getByText('Error loading waitlist data')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch waitlist data')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Should show success state after retry
      await waitFor(() => {
        expect(screen.getByText('Waitlist Entries')).toBeInTheDocument();
        expect(screen.queryByText('Error loading waitlist data')).not.toBeInTheDocument();
      });
    });

    it('should handle empty waitlist scenario', async () => {
      // Setup: Empty waitlist data
      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockAdminAPI({
        totalUsers: 100,
        waitlistUsers: 0,
        conversionRate: 0,
        users: [],
      });

      render(<InternalWaitlistPage />);

      await waitFor(() => {
        expect(screen.getByText('Waitlist Entries')).toBeInTheDocument();
      });

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText('No users on waitlist yet')).toBeInTheDocument();
        expect(screen.getByText('Waitlist entries will appear here when users join')).toBeInTheDocument();
      });

      // Export button should be disabled
      const exportButton = screen.getByText('Export Waitlist CSV');
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Cross-Component Integration', () => {
    it('should maintain consistent state across component re-renders', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: WaitlistTestHelpers.mockSession('external'),
        status: 'authenticated',
      });

      // Setup: User joins waitlist during session
      let isOnWaitlist = false;
      (global.fetch as jest.Mock).mockImplementation(async (url: string, options?: any) => {
        if (url.includes('/api/waitlist')) {
          if (!options || options.method === 'GET') {
            return {
              ok: true,
              status: 200,
              json: async () => ({ isOnWaitlist }),
            };
          } else if (options.method === 'POST') {
            isOnWaitlist = true; // Simulate successful join
            return {
              ok: true,
              status: 200,
              json: async () => ({ success: true }),
            };
          }
        }
        return { ok: true, status: 200, json: async () => ({}) };
      });

      const { rerender } = render(<WaitlistStatus user={mockUsers.external} />);

      // Initially shows join button
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      // Join waitlist
      fireEvent.click(screen.getByText('Join the Waitlist'));

      // Should show success
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
      });

      // Re-render component (simulating navigation back to page)
      rerender(<WaitlistStatus user={mockUsers.external} />);

      // Should maintain waitlist state
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
        expect(screen.queryByText('Join the Waitlist')).not.toBeInTheDocument();
      });
    });

    it('should handle user changes during session', async () => {
      // Start with external user
      (useSession as jest.Mock).mockReturnValue({
        data: WaitlistTestHelpers.mockSession('external'),
        status: 'authenticated',
      });

      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockWaitlistAPI({
        getResponse: { isOnWaitlist: false },
      });

      const { rerender } = render(<WaitlistStatus user={mockUsers.external} />);

      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      // Switch to different user
      rerender(<WaitlistStatus user={mockUsers.withoutName} />);

      // Should fetch new user's waitlist status
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // One for each user
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle large datasets efficiently', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: WaitlistTestHelpers.mockSession('internal'),
        status: 'authenticated',
      });

      // Generate large dataset
      const largeDataset = {
        totalUsers: 10000,
        waitlistUsers: 2500,
        conversionRate: 25,
        users: Array.from({ length: 1000 }, (_, index) => 
          WaitlistTestHelpers.generateRandomUser(index)
        ),
      };

      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockAdminAPI(largeDataset);

      const startTime = performance.now();
      render(<InternalWaitlistPage />);

      await waitFor(() => {
        expect(screen.getByText('Waitlist Entries')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in reasonable time (under 2 seconds)
      expect(renderTime).toBeLessThan(2000);

      // Should show correct filtered count
      const waitlistUsers = largeDataset.users.filter(user => user.waitlist_status);
      await waitFor(() => {
        expect(screen.getByText(`${waitlistUsers.length} members`)).toBeInTheDocument();
      });
    });

    it('should handle rapid user interactions', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: WaitlistTestHelpers.mockSession('external'),
        status: 'authenticated',
      });

      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockWaitlistAPI({
        getResponse: { isOnWaitlist: false },
        postResponse: { success: true },
        delay: 100, // Slow response to test rapid clicking
      });

      render(<WaitlistStatus user={mockUsers.external} />);

      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist');

      // Rapid clicks
      fireEvent.click(joinButton);
      fireEvent.click(joinButton);
      fireEvent.click(joinButton);
      fireEvent.click(joinButton);

      // Should only make one POST request
      await waitFor(() => {
        const postCalls = (global.fetch as jest.Mock).mock.calls.filter(
          call => call[1]?.method === 'POST'
        );
        expect(postCalls).toHaveLength(1);
      });

      // Should eventually show success
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain focus and navigation flow', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: WaitlistTestHelpers.mockSession('internal'),
        status: 'authenticated',
      });

      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockAdminAPI(mockWaitlistData);

      render(<InternalPage />);

      // Tab to waitlist button
      const waitlistButton = screen.getByText('View Waitlist Entries');
      waitlistButton.focus();
      expect(document.activeElement).toBe(waitlistButton);

      // Activate with keyboard
      fireEvent.keyDown(waitlistButton, { key: 'Enter', code: 'Enter' });
      expect(mockPush).toHaveBeenCalledWith('/internal/waitlist');

      // Render waitlist page
      const { rerender } = render(<InternalWaitlistPage />);

      await waitFor(() => {
        expect(screen.getByText('Waitlist Entries')).toBeInTheDocument();
      });

      // Tab to back button
      const backButton = screen.getByText('← Back');
      backButton.focus();
      expect(document.activeElement).toBe(backButton);

      // Activate with keyboard
      fireEvent.keyDown(backButton, { key: 'Enter', code: 'Enter' });
      expect(mockPush).toHaveBeenCalledWith('/internal');
    });

    it('should provide appropriate ARIA labels and roles', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: WaitlistTestHelpers.mockSession('internal'),
        status: 'authenticated',
      });

      (global.fetch as jest.Mock) = WaitlistTestHelpers.mockAdminAPI(mockWaitlistData);

      render(<InternalWaitlistPage />);

      await waitFor(() => {
        expect(screen.getByText('Waitlist Entries')).toBeInTheDocument();
      });

      // Check for proper table structure
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + data rows
    });
  });
});