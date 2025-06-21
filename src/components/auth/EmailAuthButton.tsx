'use client';

import { useState } from 'react';

interface EmailAuthButtonProps {
  children: React.ReactNode;
}

export default function EmailAuthButton({ children }: EmailAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInitialClick = () => {
    setShowEmailForm(true);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setMessage('');

      console.log('📧 Sending magic link to:', email);

      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          redirectTo: '/dashboard',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setMessage('Magic link sent! Check your email and click the link to sign in.');
      
      // In development, also log the magic link
      if (data.magicLink && process.env.NODE_ENV === 'development') {
        console.log('🔗 Development Magic Link:', data.magicLink);
      }

    } catch (error) {
      console.error('❌ Error sending magic link:', error);
      setError(error instanceof Error ? error.message : 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  if (showEmailForm) {
    return (
      <div className="w-full space-y-4">
        <form onSubmit={handleSendMagicLink} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full h-12 px-4 border border-charcoal bg-transparent text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-charcoal"
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 border border-charcoal bg-transparent text-foreground font-medium text-base hover:bg-charcoal active:bg-dark-gray transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal focus:ring-offset-background"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              'Send Magic Link'
            )}
          </button>
        </form>

        {message && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <button
          onClick={() => setShowEmailForm(false)}
          className="w-full text-sm text-gray-500 hover:text-foreground transition-colors"
        >
          ← Back to sign in options
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleInitialClick}
      disabled={isLoading}
      className="w-full h-12 border border-charcoal bg-transparent text-foreground font-medium text-base hover:bg-charcoal active:bg-dark-gray transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal focus:ring-offset-background"
    >
      {children}
    </button>
  );
}