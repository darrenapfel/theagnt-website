'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

export default function DevLoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call our dev login API
      const response = await fetch('/api/dev/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        // Redirect to dashboard - the domain logic will handle internal vs external routing
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogins = [
    { label: 'Internal User (@theagnt.ai)', email: 'test@theagnt.ai' },
    { label: 'Admin User', email: 'darrenapfel@gmail.com' },
    { label: 'External User (@gmail.com)', email: 'external@gmail.com' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Logo size="large" animated />
          <h1 className="mt-6 text-2xl font-light text-foreground">
            Development Login
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Enter any email to simulate authentication
          </p>
        </div>

        <form onSubmit={handleDevLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-charcoal border border-dark-gray text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-electric-mint focus:border-transparent transition-all duration-200"
              placeholder="Enter any email address"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-charcoal border border-dark-gray text-foreground font-medium hover:bg-dark-gray focus:outline-none focus:ring-2 focus:ring-electric-mint focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In (Dev Mode)'}
          </button>
        </form>

        <div className="space-y-3">
          <p className="text-xs text-foreground/40 text-center">Quick test logins:</p>
          {quickLogins.map((login, index) => (
            <button
              key={index}
              onClick={() => setEmail(login.email)}
              className="w-full py-2 px-3 text-xs bg-dark-gray/50 border border-dark-gray/50 text-foreground/80 hover:bg-dark-gray/80 transition-all duration-200"
            >
              {login.label}
              <span className="block text-foreground/40">{login.email}</span>
            </button>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/"
            className="text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            ← Back to main site
          </a>
        </div>

        <div className="text-xs text-foreground/30 text-center space-y-1">
          <p>🔧 Development Mode Only</p>
          <p>This bypasses real authentication for localhost testing</p>
        </div>
      </div>
    </div>
  );
}