/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EmailAuthButton from '../EmailAuthButton';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('EnhancedEmailAuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe('Initial State & Vercel-Style Design', () => {
    it('should render initial button with proper Vercel-style styling', () => {
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with email/i });
      
      // Test core Vercel design system classes
      expect(button).toHaveClass('w-full', 'h-12', 'border', 'border-charcoal');
      expect(button).toHaveClass('bg-transparent', 'text-foreground');
      expect(button).toHaveClass('font-medium', 'text-base');
      expect(button).toHaveClass('hover:bg-charcoal', 'active:bg-dark-gray');
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });

    it('should have enhanced focus styling for accessibility', () => {
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with email/i });
      
      // Test enhanced focus ring design
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
      expect(button).toHaveClass('focus:ring-charcoal', 'focus:ring-offset-background');
    });

    it('should support custom data-testid', () => {
      render(
        <EmailAuthButton data-testid="custom-email-btn">
          Continue with Email
        </EmailAuthButton>
      );
      
      expect(screen.getByTestId('custom-email-btn')).toBeInTheDocument();
      expect(screen.queryByTestId('email-auth-button')).not.toBeInTheDocument();
    });

    it('should use default testId when not provided', () => {
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      expect(screen.getByTestId('email-auth-button')).toBeInTheDocument();
    });
  });

  describe('Email Form UI & Enhanced Styling', () => {
    it('should show enhanced email form with proper styling after button click', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      const initialButton = screen.getByRole('button', { name: /continue with email/i });
      await user.click(initialButton);
      
      // Check email input styling
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveClass('w-full', 'h-12', 'px-4');
      expect(emailInput).toHaveClass('border', 'border-charcoal', 'bg-transparent');
      expect(emailInput).toHaveClass('text-foreground', 'placeholder-gray-400');
      expect(emailInput).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-charcoal');
      
      // Check submit button styling
      const submitButton = screen.getByTestId('send-magic-link');
      expect(submitButton).toHaveClass('w-full', 'h-12', 'border', 'border-charcoal');
      expect(submitButton).toHaveClass('bg-transparent', 'text-foreground', 'font-medium');
      expect(submitButton).toHaveClass('hover:bg-charcoal', 'active:bg-dark-gray');
      expect(submitButton).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });

    it('should show proper form layout and spacing', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      
      // Check form container spacing
      const formContainer = screen.getByRole('form').parentElement;
      expect(formContainer).toHaveClass('w-full', 'space-y-4');
      
      // Check form internal spacing
      const form = screen.getByRole('form');
      expect(form).toHaveClass('space-y-4');
    });

    it('should have enhanced back button styling', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      
      const backButton = screen.getByRole('button', { name: /back to sign in options/i });
      expect(backButton).toHaveClass('w-full', 'text-sm', 'text-gray-500');
      expect(backButton).toHaveClass('hover:text-foreground', 'transition-colors');
    });
  });

  describe('Loading States & Animations', () => {
    it('should show enhanced loading spinner during magic link send', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 100))
      );
      
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      
      const submitButton = screen.getByTestId('send-magic-link');
      await user.click(submitButton);
      
      // Check loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
        
        const spinner = submitButton.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('w-4', 'h-4');
        expect(spinner).toHaveClass('border-2', 'border-foreground', 'border-t-transparent');
        expect(spinner).toHaveClass('rounded-full');
      });
    });

    it('should disable email input during loading', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 50))
      );
      
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('send-magic-link'));
      
      const emailInput = screen.getByTestId('email-input');
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
      });
    });
  });

  describe('Success & Error Message Styling', () => {
    it('should show enhanced success message with proper styling', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        const successMessage = screen.getByTestId('email-sent-message');
        expect(successMessage).toBeInTheDocument();
        expect(successMessage).toHaveClass('p-3', 'text-sm');
        expect(successMessage).toHaveClass('text-green-600', 'bg-green-50');
        expect(successMessage).toHaveClass('border', 'border-green-200', 'rounded');
      });
    });

    it('should show enhanced error message with proper styling', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid email address' }),
      });
      
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'invalid-email');
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        const errorMessage = screen.getByTestId('email-error');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('p-3', 'text-sm');
        expect(errorMessage).toHaveClass('text-red-600', 'bg-red-50');
        expect(errorMessage).toHaveClass('border', 'border-red-200', 'rounded');
      });
    });

    it('should clear previous messages when showing new ones', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      
      // Trigger validation error first
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter your email address');
      });
      
      // Now enter email and submit successfully
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
        expect(screen.getByTestId('email-sent-message')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation & UX', () => {
    it('should validate email before submission with enhanced error styling', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        const errorMessage = screen.getByTestId('email-error');
        expect(errorMessage).toHaveTextContent('Please enter your email address');
        expect(errorMessage).toHaveClass('text-red-600', 'bg-red-50', 'border-red-200');
      });
    });

    it('should maintain focus states during form interactions', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('send-magic-link');
      
      // Test enhanced focus styling
      expect(emailInput).toHaveClass('focus:ring-2', 'focus:ring-charcoal');
      expect(submitButton).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
      expect(submitButton).toHaveClass('focus:ring-charcoal', 'focus:ring-offset-background');
    });
  });

  describe('Responsive Design & Mobile Experience', () => {
    it('should maintain proper styling across different viewport sizes', () => {
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      const button = screen.getByRole('button', { name: /continue with email/i });
      
      // Test responsive width and height
      expect(button).toHaveClass('w-full', 'h-12');
      
      // Mobile-first approach should work at all breakpoints
      expect(button).toHaveClass('px-4'); // Sufficient padding for mobile
    });

    it('should have accessible touch targets on mobile', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      
      const submitButton = screen.getByTestId('send-magic-link');
      
      // 48px (h-12) meets WCAG touch target minimum
      expect(submitButton).toHaveClass('h-12'); // 48px minimum
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels and roles', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      
      const emailInput = screen.getByTestId('email-input');
      const form = screen.getByRole('form');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email address');
      expect(form).toBeInTheDocument();
    });

    it('should support keyboard navigation throughout the flow', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      // Navigate with keyboard
      await user.tab();
      const initialButton = screen.getByRole('button', { name: /continue with email/i });
      expect(initialButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      // Should focus email input after form appears
      await waitFor(() => {
        const emailInput = screen.getByTestId('email-input');
        expect(emailInput).toBeInTheDocument();
      });
      
      await user.tab();
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveFocus();
      
      await user.type(emailInput, 'test@example.com');
      await user.tab();
      
      const submitButton = screen.getByTestId('send-magic-link');
      expect(submitButton).toHaveFocus();
    });

    it('should announce state changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        const successMessage = screen.getByTestId('email-sent-message');
        expect(successMessage).toBeInTheDocument();
        expect(successMessage).toHaveTextContent('Magic link sent!');
      });
    });
  });

  describe('Back Navigation & State Management', () => {
    it('should handle back navigation with proper state reset', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      // Go to email form
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      
      // Go back
      const backButton = screen.getByRole('button', { name: /back to sign in options/i });
      await user.click(backButton);
      
      // Should return to initial state
      expect(screen.getByRole('button', { name: /continue with email/i })).toBeInTheDocument();
      expect(screen.queryByTestId('email-input')).not.toBeInTheDocument();
    });

    it('should preserve email value when going back and forth', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      
      // Go back
      await user.click(screen.getByRole('button', { name: /back to sign in options/i }));
      
      // Go forward again
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      
      // Email should be preserved
      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('API Integration & Error Handling', () => {
    it('should make correct API call with proper payload', async () => {
      const user = userEvent.setup();
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            redirectTo: '/dashboard',
          }),
        });
      });
    });

    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Network error');
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error sending magic link:', expect.any(Error));
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Development Mode Features', () => {
    it('should log magic link in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ 
          success: true, 
          magicLink: 'http://localhost:3000/auth/callback?token=test123' 
        }),
      });
      
      render(<EmailAuthButton>Continue with Email</EmailAuthButton>);
      
      await user.click(screen.getByRole('button', { name: /continue with email/i }));
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('send-magic-link'));
      
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('🔗 Development Magic Link:', expect.stringContaining('http://localhost:3000/auth/callback'));
      });
      
      process.env.NODE_ENV = originalEnv;
      consoleLogSpy.mockRestore();
    });
  });
});