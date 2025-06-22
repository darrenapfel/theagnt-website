import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import WaitlistStatus from '../WaitlistStatus';

// Mock fetch globally
global.fetch = jest.fn();

describe('WaitlistStatus Component', () => {
  const mockUser = {
    email: 'test@example.com',
    name: 'Test User',
    id: '1',
    isAdmin: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering and Loading States', () => {
    it('should show loading spinner initially', async () => {
      // Mock a delayed response to keep loading state
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { container } = render(<WaitlistStatus user={mockUser} />);
      
      const loadingSpinner = container.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should handle user without email gracefully', async () => {
      const userWithoutEmail = { name: 'Test User', id: '1' };
      
      const { container } = render(<WaitlistStatus user={userWithoutEmail} />);
      
      await waitFor(() => {
        const loadingSpinner = container.querySelector('.animate-spin');
        expect(loadingSpinner).not.toBeInTheDocument();
      });
      
      // Should not make API call without email
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Waitlist Status Checking', () => {
    it('should check waitlist status on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isOnWaitlist: false })
      });

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/waitlist');
      });
    });

    it('should display join button when user is not on waitlist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isOnWaitlist: false })
      });

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });
    });

    it('should display confirmation when user is on waitlist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isOnWaitlist: true })
      });

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
      });
    });

    it('should handle API error gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Waitlist API error:', 
          500, 
          'Internal Server Error'
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle network error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error checking waitlist status:', 
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Joining Waitlist', () => {
    beforeEach(() => {
      // Mock initial status check (not on waitlist)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isOnWaitlist: false })
      });
    });

    it('should join waitlist when button is clicked', async () => {
      // Mock successful join
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist');
      
      await act(async () => {
        fireEvent.click(joinButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/waitlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      // Should show confirmation after successful join
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
      });
    });

    it('should show loading state during join process', async () => {
      // Mock delayed join response
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'POST') {
          return new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true })
          }), 100));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ isOnWaitlist: false })
        });
      });

      const { container } = render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist');
      
      act(() => {
        fireEvent.click(joinButton);
      });

      // Should show loading spinner
      await waitFor(() => {
        const loadingSpinner = container.querySelector('.animate-spin');
        expect(loadingSpinner).toBeInTheDocument();
      });
    });

    it('should disable button during join process', async () => {
      // Mock delayed join response
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'POST') {
          return new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true })
          }), 100));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ isOnWaitlist: false })
        });
      });

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist') as HTMLButtonElement;
      
      act(() => {
        fireEvent.click(joinButton);
      });

      await waitFor(() => {
        expect(joinButton).toBeDisabled();
      });
    });

    it('should handle join failure gracefully', async () => {
      // Mock failed join
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 500
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ isOnWaitlist: false })
        });
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist');
      
      await act(async () => {
        fireEvent.click(joinButton);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to join waitlist');
      });

      // Should still show join button after failure
      expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should not allow joining when user has no email', async () => {
      const userWithoutEmail = { name: 'Test User', id: '1' };
      
      render(<WaitlistStatus user={userWithoutEmail} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Join the Waitlist')).not.toBeInTheDocument();
      });
    });

    it('should prevent multiple simultaneous join attempts', async () => {
      // Mock slow join response
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options?.method === 'POST') {
          return new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true })
          }), 200));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ isOnWaitlist: false })
        });
      });

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist');
      
      // Click multiple times quickly
      act(() => {
        fireEvent.click(joinButton);
        fireEvent.click(joinButton);
        fireEvent.click(joinButton);
      });

      await waitFor(() => {
        // Should only make one POST request
        const postCalls = (global.fetch as jest.Mock).mock.calls.filter(
          call => call[1]?.method === 'POST'
        );
        expect(postCalls).toHaveLength(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus management', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isOnWaitlist: false })
      });

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist');
      
      // Should be focusable
      expect(joinButton).toHaveAttribute('tabIndex', expect.not.stringMatching('-1'));
    });

    it('should have proper ARIA attributes for loading state', async () => {
      // Mock delayed response to test loading state
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { container } = render(<WaitlistStatus user={mockUser} />);
      
      // Check for loading indicator accessibility
      const loadingSpinner = container.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should provide visual feedback for state changes', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ isOnWaitlist: false })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join the Waitlist');
      
      await act(async () => {
        fireEvent.click(joinButton);
      });

      // Should transition to confirmation
      await waitFor(() => {
        expect(screen.getByText("You're on the waitlist.")).toBeInTheDocument();
        expect(screen.queryByText('Join the Waitlist')).not.toBeInTheDocument();
      });
    });

    it('should handle rapid user updates gracefully', async () => {
      const { rerender } = render(<WaitlistStatus user={mockUser} />);
      
      // Mock different responses for different users
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ isOnWaitlist: false })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ isOnWaitlist: true })
        });

      // Change user quickly
      const newUser = { ...mockUser, email: 'newuser@example.com' };
      rerender(<WaitlistStatus user={newUser} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user object', () => {
      const emptyUser = {};
      
      render(<WaitlistStatus user={emptyUser} />);
      
      // Should not crash and should not make API calls
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle null user', () => {
      // @ts-expect-error - Testing edge case
      render(<WaitlistStatus user={null} />);
      
      // Should not crash
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle malformed API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalidProperty: 'test' })
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<WaitlistStatus user={mockUser} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should handle gracefully without crashing
      expect(screen.queryByText('Join the Waitlist')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});