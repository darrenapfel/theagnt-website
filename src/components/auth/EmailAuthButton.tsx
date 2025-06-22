'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmailIcon from './icons/EmailIcon';
import OptimizedButton from '../ui/OptimizedButton';
import { deduplicatedMagicLink } from '../../lib/request-deduplication';

interface EmailAuthButtonProps {
  children: React.ReactNode;
  'data-testid'?: string;
}

export default function EmailAuthButton({ children, 'data-testid': testId }: EmailAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);

  const handleInitialClick = useCallback(() => {
    setShowEmailForm(true);
  }, []);

  const handleSendMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      // Immediate loading state for better UX
      setIsLoading(true);
      setError('');
      setMessage('');

      console.log('📧 Sending magic link to:', email);

      // Use deduplicated magic link request
      const data = await deduplicatedMagicLink(email, '/dashboard');

      setMessage('Magic link sent! Check your email and click the link to sign in.');
      
      // Start 60-second cooldown to prevent rate limiting
      setCooldownTime(60);
      const interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('❌ Error sending magic link:', error);
      setError(error instanceof Error ? error.message : 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  if (showEmailForm) {
    return (
      <motion.div 
        className="w-full space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <form onSubmit={handleSendMagicLink} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              data-testid="email-input"
              className="w-full h-12 px-4 border border-charcoal bg-transparent text-foreground placeholder-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-charcoal transition-all duration-200 ease-out"
              required
              disabled={isLoading || cooldownTime > 0}
            />
          </div>
          
          <OptimizedButton
            type="submit"
            loading={isLoading}
            loadingText="Sending..."
            data-testid="send-magic-link"
            className="w-full"
            variant="outline"
            size="md"
            icon={<EmailIcon className="w-4 h-4" />}
            hapticFeedback={true}
            instantFeedback={true}
            disabled={cooldownTime > 0}
          >
            {cooldownTime > 0 ? `Wait ${cooldownTime}s` : 'Send Magic Link'}
          </OptimizedButton>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div 
              className="mt-4 p-4 text-sm text-white bg-green-600/20 border border-green-600/30 rounded-md flex items-start gap-3" 
              data-testid="email-sent-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div 
              className="mt-4 p-4 text-sm text-white bg-red-600/20 border border-red-600/30 rounded-md flex items-start gap-3" 
              data-testid="email-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowEmailForm(false)}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out py-2"
        >
          ← Back to sign in options
        </button>
      </motion.div>
    );
  }

  return (
    <OptimizedButton
      onClick={handleInitialClick}
      loading={isLoading}
      data-testid={testId || "email-auth-button"}
      className="w-full"
      variant="outline"
      size="md"
      icon={<EmailIcon className="w-5 h-5" />}
      hapticFeedback={true}
      instantFeedback={true}
    >
      {children}
    </OptimizedButton>
  );
}