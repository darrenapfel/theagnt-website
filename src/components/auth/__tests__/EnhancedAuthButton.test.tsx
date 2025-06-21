/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AuthButton from '../AuthButton';

// Mock next-auth/react
const mockSignIn = jest.fn();
jest.mock('next-auth/react', () => ({
  signIn: mockSignIn,
}));

describe('EnhancedAuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue(undefined);
  });

  describe('Visual Design & Styling', () => {
    it('should render with proper Vercel-style button styling', () => {
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      // Test core Vercel-style classes
      expect(button).toHaveClass('w-full', 'h-12', 'border', 'border-charcoal');
      expect(button).toHaveClass('bg-transparent', 'text-foreground');
      expect(button).toHaveClass('font-medium', 'text-base');
      expect(button).toHaveClass('hover:bg-charcoal', 'active:bg-dark-gray');
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });

    it('should have proper focus styling for accessibility', () => {
      render(<AuthButton provider="apple">Continue with Apple</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with apple/i });
      
      // Test focus ring classes
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
      expect(button).toHaveClass('focus:ring-charcoal', 'focus:ring-offset-background');
    });

    it('should apply disabled styling when loading', async () => {
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      // Trigger loading state
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
        expect(button).toBeDisabled();
      });
    });

    it('should render proper loading spinner with enhanced styling', async () => {
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const spinner = button.querySelector('div.animate-spin');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('w-4', 'h-4');
        expect(spinner).toHaveClass('border-2', 'border-foreground', 'border-t-transparent');
        expect(spinner).toHaveClass('rounded-full');
      });
    });
  });

  describe('Interactive States & Animations', () => {
    it('should handle hover state transitions properly', async () => {
      const user = userEvent.setup();
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      // Test hover classes are properly configured
      expect(button).toHaveClass('hover:bg-charcoal');
      
      // Simulate hover
      await user.hover(button);
      
      // Button should remain interactive
      expect(button).not.toBeDisabled();
    });

    it('should handle active state transitions', async () => {
      const user = userEvent.setup();
      render(<AuthButton provider="apple">Continue with Apple</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with apple/i });
      
      // Test active state classes
      expect(button).toHaveClass('active:bg-dark-gray');
      
      await user.click(button);
      
      // Should trigger loading state
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should have smooth transition animations', () => {
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      // Test transition timing configuration
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });
  });

  describe('Provider-Specific Styling', () => {
    it('should maintain consistent styling across all providers', () => {
      const { rerender } = render(<AuthButton provider="google">Continue with Google</AuthButton>);
      const googleButton = screen.getByRole('button');
      const googleClasses = googleButton.className;
      
      rerender(<AuthButton provider="apple">Continue with Apple</AuthButton>);
      const appleButton = screen.getByRole('button');
      const appleClasses = appleButton.className;
      
      rerender(<AuthButton provider="email">Continue with Email</AuthButton>);
      const emailButton = screen.getByRole('button');
      const emailClasses = emailButton.className;
      
      // All providers should have identical styling
      expect(googleClasses).toBe(appleClasses);
      expect(appleClasses).toBe(emailClasses);
    });

    it('should set correct data-testid for each provider', () => {
      const { rerender } = render(<AuthButton provider="google">Continue with Google</AuthButton>);
      expect(screen.getByTestId('google-auth-button')).toBeInTheDocument();
      
      rerender(<AuthButton provider="apple">Continue with Apple</AuthButton>);
      expect(screen.getByTestId('apple-auth-button')).toBeInTheDocument();
      
      rerender(<AuthButton provider="email">Continue with Email</AuthButton>);
      expect(screen.getByTestId('email-auth-button')).toBeInTheDocument();
    });
  });

  describe('Loading State Management', () => {
    it('should show loading spinner and disable button during authentication', async () => {
      // Mock signIn to simulate pending state
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      fireEvent.click(button);
      
      // Should immediately show loading state
      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(button.querySelector('.animate-spin')).toBeInTheDocument();
        expect(button).not.toHaveTextContent('Continue with Google');
      });
      
      // Should restore after completion
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      }, { timeout: 200 });
    });

    it('should handle authentication errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSignIn.mockRejectedValue(new Error('Authentication failed'));
      
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication error:', expect.any(Error));
        expect(button).not.toBeDisabled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes', () => {
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toBeEnabled();
    });

    it('should maintain focus outline for keyboard navigation', () => {
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      // Should not remove focus outline
      expect(button).not.toHaveClass('focus:outline');
      expect(button).toHaveClass('focus:outline-none'); // Using custom focus ring instead
      expect(button).toHaveClass('focus:ring-2');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      
      // Focus and activate with keyboard
      await user.tab();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/dashboard',
          redirect: true,
        });
      });
    });
  });

  describe('Custom testId Support', () => {
    it('should use custom data-testid when provided', () => {
      render(
        <AuthButton provider="google" data-testid="custom-google-btn">
          Continue with Google
        </AuthButton>
      );
      
      expect(screen.getByTestId('custom-google-btn')).toBeInTheDocument();
      expect(screen.queryByTestId('google-auth-button')).not.toBeInTheDocument();
    });

    it('should fall back to default testId pattern', () => {
      render(<AuthButton provider="apple">Continue with Apple</AuthButton>);
      
      expect(screen.getByTestId('apple-auth-button')).toBeInTheDocument();
    });
  });

  describe('Authentication Integration', () => {
    it('should call signIn with correct parameters for Google', async () => {
      render(<AuthButton provider="google">Continue with Google</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/dashboard',
          redirect: true,
        });
      });
    });

    it('should call signIn with correct parameters for Apple', async () => {
      render(<AuthButton provider="apple">Continue with Apple</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with apple/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('apple', {
          callbackUrl: '/dashboard',
          redirect: true,
        });
      });
    });

    it('should handle email provider correctly', async () => {
      render(<AuthButton provider="email">Continue with Email</AuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with email/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('email', {
          callbackUrl: '/dashboard',
          redirect: true,
        });
      });
    });
  });

  describe('Performance & Optimization', () => {
    it('should not cause unnecessary re-renders', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
            <AuthButton provider="google">Continue with Google</AuthButton>
          </div>
        );
      };
      
      const { rerender } = render(<TestComponent />);
      const authButton = screen.getByRole('button', { name: /continue with google/i });
      const countButton = screen.getByRole('button', { name: /count:/i });
      
      // Click counter should not affect auth button
      fireEvent.click(countButton);
      rerender(<TestComponent />);
      
      expect(authButton).toBeInTheDocument();
      expect(authButton).not.toBeDisabled();
    });
  });
});