'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WaitlistStatus() {
  const { data: session } = useSession();
  const [isOnWaitlist, setIsOnWaitlist] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    checkWaitlistStatus();
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkWaitlistStatus = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/waitlist');
      if (response.ok) {
        const data = await response.json();
        setIsOnWaitlist(data.isOnWaitlist);
      }
    } catch (error) {
      console.error('Error checking waitlist status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinWaitlist = async () => {
    if (!session?.user?.id || isJoining) return;

    try {
      setIsJoining(true);
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsOnWaitlist(true);
      } else {
        console.error('Failed to join waitlist');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!isOnWaitlist ? (
          <motion.div
            key="join-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <button
              onClick={joinWaitlist}
              disabled={isJoining}
              className="w-48 h-14 bg-charcoal border border-dark-gray text-foreground font-medium text-lg hover:bg-dark-gray active:scale-[0.98] transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-mint focus:ring-offset-background"
            >
              {isJoining ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                'Join the Waitlist'
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <p className="text-electric-mint text-lg font-medium">
              You&apos;re on the waitlist.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
