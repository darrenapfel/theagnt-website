import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import InternalWaitlistPage from '../page';
import { AdminDashboardData } from '@/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock components
jest.mock('@/components/ui/Logo', () => {
  return function MockLogo(props: any) {
    return <div data-testid="logo" {...props}>theAGNT.ai</div>;
  };
});

jest.mock('@/components/ui/OptimizedButton', () => {
  return function MockOptimizedButton({ 
    children, 
    onClick, 
    variant, 
    size, 
    disabled,
    ...props 
  }: any) {
    return (
      <button
        onClick={onClick}
        data-variant={variant}
        data-size={size}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  };
});

// Mock utils
jest.mock('@/lib/utils', () => ({
  exportToCSV: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('InternalWaitlistPage Component', () => {
  const mockPush = jest.fn();
  
  const mockAdminData: AdminDashboardData = {
    totalUsers: 150,
    waitlistUsers: 45,
    conversionRate: 30,
    users: [
      {
        id: '1',
        email: 'user1@example.com',
        name: 'User One',
        waitlist_status: true,
        waitlist_joined_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-10T10:00:00Z',
        auth_provider: 'google',
        last_login: '2024-01-20T10:00:00Z',
      },
      {
        id: '2',
        email: 'user2@example.com',
        name: 'User Two',
        waitlist_status: true,
        waitlist_joined_at: '2024-01-16T10:00:00Z',
        created_at: '2024-01-11T10:00:00Z',
        auth_provider: 'email',
        last_login: null,
      },
      {
        id: '3',
        email: 'user3@example.com',
        name: null,
        waitlist_status: false,
        waitlist_joined_at: null,
        created_at: '2024-01-12T10:00:00Z',
        auth_provider: 'apple',
        last_login: '2024-01-18T10:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching data', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<InternalWaitlistPage />);
      
      expect(screen.getByText('Loading waitlist data...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner') || screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should fetch waitlist data on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdminData,
      });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/admin');
      });
    });
  });

  describe('Error State', () => {
    it('should display error message when API fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading waitlist data')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch waitlist data')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
        expect(screen.getByText('Back to Internal')).toBeInTheDocument();
      });
    });

    it('should retry fetching data when retry button is clicked', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAdminData,
        });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should navigate back when back button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Back to Internal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Back to Internal'));
      
      expect(mockPush).toHaveBeenCalledWith('/internal');
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading waitlist data')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Success State - Data Display', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdminData,
      });
    });

    it('should display header with waitlist count', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Waitlist Entries')).toBeInTheDocument();
        expect(screen.getByText('2 members')).toBeInTheDocument(); // Only waitlist users
      });
    });

    it('should display metrics cards', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
        
        expect(screen.getByText('Waitlist Members')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Filtered waitlist users
        
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
        expect(screen.getByText('30%')).toBeInTheDocument();
      });
    });

    it('should display waitlist users table', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Joined Waitlist')).toBeInTheDocument();
        expect(screen.getByText('Sign-up Date')).toBeInTheDocument();
        expect(screen.getByText('Auth Provider')).toBeInTheDocument();
        expect(screen.getByText('Last Login')).toBeInTheDocument();
        
        // Check user data (only waitlist users should be shown)
        expect(screen.getByText('user1@example.com')).toBeInTheDocument();
        expect(screen.getByText('user2@example.com')).toBeInTheDocument();
        expect(screen.queryByText('user3@example.com')).not.toBeInTheDocument(); // Not on waitlist
        
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('User Two')).toBeInTheDocument();
      });
    });

    it('should format dates correctly', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        // Check for formatted dates (exact format may vary by locale)
        expect(screen.getByText('1/15/2024')).toBeInTheDocument();
        expect(screen.getByText('1/16/2024')).toBeInTheDocument();
        expect(screen.getByText('Never')).toBeInTheDocument(); // user2 has no last_login
      });
    });

    it('should handle missing user names', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        // user2 has null name, should show em dash
        const userRows = screen.getAllByText('—');
        expect(userRows.length).toBeGreaterThan(0);
      });
    });

    it('should capitalize auth providers', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no waitlist users', async () => {
      const emptyData = {
        ...mockAdminData,
        users: mockAdminData.users.map(user => ({ ...user, waitlist_status: false })),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => emptyData,
      });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No users on waitlist yet')).toBeInTheDocument();
        expect(screen.getByText('Waitlist entries will appear here when users join')).toBeInTheDocument();
      });
    });

    it('should disable export button when no waitlist users', async () => {
      const emptyData = {
        ...mockAdminData,
        users: [],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => emptyData,
      });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        const exportButton = screen.getByText('Export Waitlist CSV');
        expect(exportButton).toBeDisabled();
      });
    });
  });

  describe('CSV Export Functionality', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdminData,
      });
    });

    it('should enable export button when waitlist users exist', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        const exportButton = screen.getByText('Export Waitlist CSV');
        expect(exportButton).not.toBeDisabled();
      });
    });

    it('should call exportToCSV when export button is clicked', async () => {
      const { exportToCSV } = require('@/lib/utils');
      
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Export Waitlist CSV')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export Waitlist CSV'));
      
      expect(exportToCSV).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            email: 'user1@example.com',
            name: 'User One',
            waitlist_joined: '1/15/2024',
            signup_date: '1/10/2024',
            auth_provider: 'google',
            last_login: '1/20/2024',
          }),
        ]),
        expect.stringMatching(/theagnt-waitlist-\d{4}-\d{2}-\d{2}\.csv/)
      );
    });

    it('should only export waitlist users', async () => {
      const { exportToCSV } = require('@/lib/utils');
      
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Export Waitlist CSV')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export Waitlist CSV'));
      
      const exportCall = (exportToCSV as jest.Mock).mock.calls[0];
      const exportedData = exportCall[0];
      
      // Should only include 2 waitlist users, not user3 who isn't on waitlist
      expect(exportedData).toHaveLength(2);
      expect(exportedData.some((user: any) => user.email === 'user1@example.com')).toBe(true);
      expect(exportedData.some((user: any) => user.email === 'user2@example.com')).toBe(true);
      expect(exportedData.some((user: any) => user.email === 'user3@example.com')).toBe(false);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdminData,
      });
    });

    it('should have back button in header', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('← Back')).toBeInTheDocument();
      });
    });

    it('should navigate back to internal page when back button is clicked', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('← Back')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('← Back'));
      
      expect(mockPush).toHaveBeenCalledWith('/internal');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdminData,
      });
    });

    it('should have proper table structure', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        
        const headers = screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(6);
        
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeGreaterThan(1); // Header + data rows
      });
    });

    it('should have accessible buttons', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export waitlist csv/i });
        expect(exportButton).toBeInTheDocument();
        
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        const exportButton = screen.getByText('Export Waitlist CSV');
        const backButton = screen.getByText('← Back');
        
        // Buttons should be focusable
        exportButton.focus();
        expect(document.activeElement).toBe(exportButton);
        
        backButton.focus();
        expect(document.activeElement).toBe(backButton);
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdminData,
      });
    });

    it('should have responsive grid layout for metrics', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        const metricsGrid = screen.getByText('Total Users').closest('.grid');
        expect(metricsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-3');
      });
    });

    it('should have scrollable table for mobile', async () => {
      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        const tableContainer = screen.getByRole('table').closest('.overflow-x-auto');
        expect(tableContainer).toBeInTheDocument();
      });
    });
  });

  describe('Data Filtering', () => {
    it('should filter out non-waitlist users from display', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdminData,
      });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        // Should show waitlist users
        expect(screen.getByText('user1@example.com')).toBeInTheDocument();
        expect(screen.getByText('user2@example.com')).toBeInTheDocument();
        
        // Should NOT show non-waitlist users
        expect(screen.queryByText('user3@example.com')).not.toBeInTheDocument();
      });
    });

    it('should correctly count only waitlist users', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdminData,
      });

      render(<InternalWaitlistPage />);
      
      await waitFor(() => {
        // Should show 2 members (only waitlist users) not 3 (total users)
        expect(screen.getByText('2 members')).toBeInTheDocument();
        expect(screen.queryByText('3 members')).not.toBeInTheDocument();
      });
    });
  });
});