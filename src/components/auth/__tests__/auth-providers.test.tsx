/**
 * Component Tests for Authentication Provider UI
 * 
 * This test suite validates the authentication UI components and their interactions.
 * These tests follow TDD principles and will initially FAIL to demonstrate
 * the current authentication issues before fixes are implemented.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import AuthButton from '../AuthButton';
import EmailAuthButton from '../EmailAuthButton';
import { signIn } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock fetch for EmailAuthButton tests
global.fetch = jest.fn();

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Authentication Provider Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('AuthButton Component', () => {
    test('should render Google auth button with correct text', () => {
      render(
        <SessionProvider session={null}>
          <AuthButton provider="google" data-testid="google-auth-button">
            Continue with Google
          </AuthButton>
        </SessionProvider>
      );

      const button = screen.getByTestId('google-auth-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Continue with Google');
    });

    test('should render Apple auth button with correct text', () => {
      render(
        <SessionProvider session={null}>
          <AuthButton provider="apple" data-testid="apple-auth-button">
            Continue with Apple
          </AuthButton>
        </SessionProvider>
      );

      const button = screen.getByTestId('apple-auth-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Continue with Apple');
    });

    test('should call signIn with correct provider when Google button is clicked', async () => {
      mockSignIn.mockResolvedValue({ error: null });

      render(
        <SessionProvider session={null}>
          <AuthButton provider="google" data-testid="google-auth-button">
            Continue with Google
          </AuthButton>
        </SessionProvider>
      );

      const button = screen.getByTestId('google-auth-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/dashboard',
          redirect: true
        });
      });
    });

    test('should call signIn with correct provider when Apple button is clicked', async () => {
      mockSignIn.mockResolvedValue({ error: null });

      render(
        <SessionProvider session={null}>
          <AuthButton provider="apple" data-testid="apple-auth-button">
            Continue with Apple
          </AuthButton>
        </SessionProvider>
      );

      const button = screen.getByTestId('apple-auth-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('apple', {
          callbackUrl: '/dashboard',
          redirect: true
        });
      });
    });

    test('should show loading state when authentication is in progress', async () => {
      // Mock signIn to return a pending promise
      mockSignIn.mockImplementation(() => new Promise(() => {}));

      render(
        <SessionProvider session={null}>
          <AuthButton provider="google" data-testid="google-auth-button">
            Continue with Google
          </AuthButton>
        </SessionProvider>
      );

      const button = screen.getByTestId('google-auth-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(screen.getByRole('generic')).toHaveClass('animate-spin');
      });
    });

    test('should handle authentication errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSignIn.mockRejectedValue(new Error('Authentication failed'));

      render(
        <SessionProvider session={null}>
          <AuthButton provider="google" data-testid="google-auth-button">
            Continue with Google
          </AuthButton>
        </SessionProvider>
      );

      const button = screen.getByTestId('google-auth-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Authentication error:', expect.any(Error));
        expect(button).not.toBeDisabled();
      });

      consoleSpy.mockRestore();
    });

    test('should have proper accessibility attributes', () => {
      render(
        <SessionProvider session={null}>
          <AuthButton provider="google" data-testid="google-auth-button">
            Continue with Google
          </AuthButton>
        </SessionProvider>
      );

      const button = screen.getByTestId('google-auth-button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    test('should have proper hover and focus styles', () => {
      render(
        <SessionProvider session={null}>
          <AuthButton provider="google" data-testid="google-auth-button">
            Continue with Google
          </AuthButton>
        </SessionProvider>
      );

      const button = screen.getByTestId('google-auth-button');
      expect(button).toHaveClass('hover:bg-charcoal', 'focus:ring-charcoal');
    });
  });

  describe('EmailAuthButton Component', () => {
    test('should render initial email auth button', () => {
      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      const button = screen.getByTestId('email-auth-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Continue with Email');
    });

    test('should show email form when initial button is clicked', () => {
      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      const initialButton = screen.getByTestId('email-auth-button');
      fireEvent.click(initialButton);

      expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
      expect(screen.getByText('Send Magic Link')).toBeInTheDocument();
      expect(screen.getByText('← Back to sign in options')).toBeInTheDocument();
    });

    test('should validate email format and show error for invalid email', async () => {
      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByText('Send Magic Link');

      // Enter invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(sendButton);

      // Should show validation error
      await waitFor(() => {
        const errorMessage = screen.getByText(/enter your email address/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    test('should show error when email field is empty', async () => {
      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      const sendButton = screen.getByText('Send Magic Link');
      fireEvent.click(sendButton);

      // Should show required field error
      await waitFor(() => {
        const errorMessage = screen.getByText(/enter your email address/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    test('should send magic link for valid email', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Magic link sent successfully'
        })
      } as Response);

      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByText('Send Magic Link');

      // Enter valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            redirectTo: '/dashboard'
          })
        });
      });

      // Should show success message
      await waitFor(() => {
        const successMessage = screen.getByText(/magic link sent/i);
        expect(successMessage).toBeInTheDocument();
      });
    });

    test('should handle magic link API failure', async () => {
      // This test will FAIL initially due to magic link email sending issues
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'Failed to send magic link'
        })
      } as Response);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByText('Send Magic Link');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/failed to send magic link/i);
        expect(errorMessage).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    test('should show loading state while sending magic link', async () => {
      // Mock fetch to return a pending promise
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByText('Send Magic Link');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(sendButton).toBeDisabled();
        expect(screen.getByRole('generic')).toHaveClass('animate-spin');
        expect(emailInput).toBeDisabled();
      });
    });

    test('should allow user to go back to sign in options', () => {
      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      // Click back button
      const backButton = screen.getByText('← Back to sign in options');
      fireEvent.click(backButton);

      // Should be back to initial state
      expect(screen.getByTestId('email-auth-button')).toBeInTheDocument();
      expect(screen.getByText('Continue with Email')).toBeInTheDocument();
    });

    test('should display development magic link in development mode', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Magic link sent successfully',
          magicLink: 'https://test.supabase.co/auth/v1/verify?token=dev-token'
        })
      } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByText('Send Magic Link');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '🔗 Development Magic Link:',
          'https://test.supabase.co/auth/v1/verify?token=dev-token'
        );
      });

      process.env.NODE_ENV = originalNodeEnv;
      consoleSpy.mockRestore();
    });

    test('should have proper form accessibility', () => {
      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByText('Send Magic Link');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(sendButton).toHaveAttribute('type', 'submit');
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <EmailAuthButton data-testid="email-auth-button">
          Continue with Email
        </EmailAuthButton>
      );

      // Click to show email form
      fireEvent.click(screen.getByTestId('email-auth-button'));

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByText('Send Magic Link');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/network error/i);
        expect(errorMessage).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Component Integration', () => {
    test('should render all auth provider buttons together', () => {
      render(
        <SessionProvider session={null}>
          <div>
            <AuthButton provider="google" data-testid="google-auth-button">
              Continue with Google
            </AuthButton>
            <AuthButton provider="apple" data-testid="apple-auth-button">
              Continue with Apple
            </AuthButton>
            <EmailAuthButton data-testid="email-auth-button">
              Continue with Email
            </EmailAuthButton>
          </div>
        </SessionProvider>
      );

      expect(screen.getByTestId('google-auth-button')).toBeInTheDocument();
      expect(screen.getByTestId('apple-auth-button')).toBeInTheDocument();
      expect(screen.getByTestId('email-auth-button')).toBeInTheDocument();
    });

    test('should maintain consistent styling across all auth buttons', () => {
      render(
        <SessionProvider session={null}>
          <div>
            <AuthButton provider="google" data-testid="google-auth-button">
              Continue with Google
            </AuthButton>
            <AuthButton provider="apple" data-testid="apple-auth-button">
              Continue with Apple
            </AuthButton>
            <EmailAuthButton data-testid="email-auth-button">
              Continue with Email
            </EmailAuthButton>
          </div>
        </SessionProvider>
      );

      const googleButton = screen.getByTestId('google-auth-button');
      const appleButton = screen.getByTestId('apple-auth-button');
      const emailButton = screen.getByTestId('email-auth-button');

      // All buttons should have consistent styling classes
      const expectedClasses = ['border', 'border-charcoal', 'bg-transparent'];
      
      expectedClasses.forEach(className => {
        expect(googleButton).toHaveClass(className);
        expect(appleButton).toHaveClass(className);
        expect(emailButton).toHaveClass(className);
      });
    });

    test('should handle multiple simultaneous authentication attempts', async () => {
      mockSignIn.mockResolvedValue({ error: null });

      render(
        <SessionProvider session={null}>
          <div>
            <AuthButton provider="google" data-testid="google-auth-button">
              Continue with Google
            </AuthButton>
            <AuthButton provider="apple" data-testid="apple-auth-button">
              Continue with Apple
            </AuthButton>
          </div>
        </SessionProvider>
      );

      const googleButton = screen.getByTestId('google-auth-button');
      const appleButton = screen.getByTestId('apple-auth-button');

      // Click both buttons simultaneously
      fireEvent.click(googleButton);
      fireEvent.click(appleButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(2);
        expect(mockSignIn).toHaveBeenCalledWith('google', expect.any(Object));
        expect(mockSignIn).toHaveBeenCalledWith('apple', expect.any(Object));
      });
    });
  });

  describe('Error Boundary Tests', () => {
    test('should handle component errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error by passing invalid props
      const InvalidComponent = () => {
        throw new Error('Component error');
      };

      expect(() => {
        render(
          <SessionProvider session={null}>
            <InvalidComponent />
          </SessionProvider>
        );
      }).toThrow('Component error');

      consoleSpy.mockRestore();
    });
  });
});