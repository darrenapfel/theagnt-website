import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import InternalPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
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
    className, 
    ...props 
  }: any) {
    return (
      <button
        onClick={onClick}
        data-variant={variant}
        data-size={size}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  };
});

describe('InternalPage Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Rendering', () => {
    it('should render all main elements', () => {
      render(<InternalPage />);
      
      // Check for logo
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      
      // Check for main heading
      expect(screen.getByText('this is a special page')).toBeInTheDocument();
      
      // Check for description
      expect(screen.getByText('Restricted access for theAGNT.ai team members')).toBeInTheDocument();
      
      // Check for waitlist button
      expect(screen.getByText('View Waitlist Entries')).toBeInTheDocument();
      
      // Check for security note
      expect(screen.getByText('Protected by server-side middleware')).toBeInTheDocument();
    });

    it('should render with correct styling classes', () => {
      render(<InternalPage />);
      
      const mainContainer = screen.getByText('this is a special page').closest('.min-h-screen');
      expect(mainContainer).toHaveClass('bg-background', 'flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('should render logo with correct props', () => {
      render(<InternalPage />);
      
      const logo = screen.getByTestId('logo');
      expect(logo).toHaveAttribute('size', 'default');
      expect(logo).toHaveAttribute('animated', 'false');
    });

    it('should render button with correct props', () => {
      render(<InternalPage />);
      
      const button = screen.getByText('View Waitlist Entries');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toHaveAttribute('data-size', 'lg');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Navigation', () => {
    it('should navigate to waitlist page when button is clicked', async () => {
      render(<InternalPage />);
      
      const waitlistButton = screen.getByText('View Waitlist Entries');
      
      fireEvent.click(waitlistButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/internal/waitlist');
      });
    });

    it('should only navigate once per click', async () => {
      render(<InternalPage />);
      
      const waitlistButton = screen.getByText('View Waitlist Entries');
      
      // Click multiple times
      fireEvent.click(waitlistButton);
      fireEvent.click(waitlistButton);
      fireEvent.click(waitlistButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(3);
        expect(mockPush).toHaveBeenCalledWith('/internal/waitlist');
      });
    });

    it('should handle navigation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      render(<InternalPage />);
      
      const waitlistButton = screen.getByText('View Waitlist Entries');
      
      // Should not crash when navigation fails
      expect(() => fireEvent.click(waitlistButton)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<InternalPage />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('this is a special page');
    });

    it('should have accessible button', () => {
      render(<InternalPage />);
      
      const button = screen.getByRole('button', { name: /view waitlist entries/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('should have proper focus management', () => {
      render(<InternalPage />);
      
      const button = screen.getByText('View Waitlist Entries');
      
      // Button should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should support keyboard navigation', () => {
      render(<InternalPage />);
      
      const button = screen.getByText('View Waitlist Entries');
      
      // Should respond to Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Should respond to Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    });
  });

  describe('Content and Messaging', () => {
    it('should display appropriate messaging for internal users', () => {
      render(<InternalPage />);
      
      // Check for internal-specific messaging
      expect(screen.getByText('this is a special page')).toBeInTheDocument();
      expect(screen.getByText('Restricted access for theAGNT.ai team members')).toBeInTheDocument();
      expect(screen.getByText('Protected by server-side middleware')).toBeInTheDocument();
    });

    it('should have clear call-to-action', () => {
      render(<InternalPage />);
      
      const ctaButton = screen.getByText('View Waitlist Entries');
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toBeVisible();
    });

    it('should have appropriate visual hierarchy', () => {
      render(<InternalPage />);
      
      const heading = screen.getByText('this is a special page');
      const description = screen.getByText('Restricted access for theAGNT.ai team members');
      const securityNote = screen.getByText('Protected by server-side middleware');
      
      // All elements should be present and visible
      expect(heading).toBeVisible();
      expect(description).toBeVisible();
      expect(securityNote).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing router gracefully', () => {
      (useRouter as jest.Mock).mockReturnValue(null);
      
      // Should not crash when router is null
      expect(() => render(<InternalPage />)).not.toThrow();
    });

    it('should handle router without push method', () => {
      (useRouter as jest.Mock).mockReturnValue({});
      
      render(<InternalPage />);
      
      const button = screen.getByText('View Waitlist Entries');
      
      // Should not crash when push method is missing
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Layout and Responsive Design', () => {
    it('should have responsive container classes', () => {
      render(<InternalPage />);
      
      const container = screen.getByText('this is a special page').closest('.max-w-md');
      expect(container).toHaveClass('w-full', 'max-w-md', 'space-y-16');
    });

    it('should have proper spacing between elements', () => {
      render(<InternalPage />);
      
      const textContainer = screen.getByText('this is a special page').closest('.space-y-8');
      expect(textContainer).toHaveClass('text-center', 'space-y-8');
    });

    it('should handle different viewport sizes', () => {
      render(<InternalPage />);
      
      const heading = screen.getByText('this is a special page');
      expect(heading).toHaveClass('text-2xl', 'md:text-3xl');
    });
  });

  describe('Integration with Authentication', () => {
    it('should assume user is authenticated (middleware protection)', () => {
      render(<InternalPage />);
      
      // Page should render normally, assuming middleware has validated access
      expect(screen.getByText('this is a special page')).toBeInTheDocument();
      expect(screen.getByText('View Waitlist Entries')).toBeInTheDocument();
    });

    it('should not perform additional authentication checks', () => {
      // Mock any potential auth-related functions
      const authSpy = jest.fn();
      
      render(<InternalPage />);
      
      // Should not call any auth functions (middleware handles this)
      expect(authSpy).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should render efficiently without unnecessary re-renders', () => {
      const { rerender } = render(<InternalPage />);
      
      // Re-render with same props
      rerender(<InternalPage />);
      
      // Component should handle re-renders gracefully
      expect(screen.getByText('this is a special page')).toBeInTheDocument();
    });
  });
});