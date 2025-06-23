'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  email?: string;
  name?: string;
  id?: string;
  isAdmin?: boolean;
}

interface WaitlistStatusProps {
  user: User;
}

export default function WaitlistStatus({ user }: WaitlistStatusProps) {
  const [isOnWaitlist, setIsOnWaitlist] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Detect Safari browser
    const userAgent = window.navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent);
    setIsSafari(isSafariBrowser);
    console.log('Browser detection - Safari:', isSafariBrowser);
    
    checkWaitlistStatus();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkWaitlistStatus = async () => {
    console.log('User in checkWaitlistStatus:', user);
    console.log('User email:', user?.email);
    
    // For Safari: First verify we have a valid session
    try {
      console.log('Checking session first...');
      const sessionCheck = await fetch('/api/auth/check-session');
      
      if (!sessionCheck.ok) {
        console.log('No valid session found');
        setIsLoading(false);
        return;
      }
      
      const sessionData = await sessionCheck.json();
      console.log('Session check result:', sessionData);
      
      if (!sessionData.authenticated) {
        console.log('Not authenticated, stopping waitlist check');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setIsLoading(false);
      return;
    }

    try {
      // Use Safari-specific endpoint if needed
      const endpoint = isSafari && user?.email 
        ? `/api/waitlist/safari?email=${encodeURIComponent(user.email)}`
        : '/api/waitlist';
        
      console.log('Making API request to:', endpoint);
      const response = await fetch(endpoint);
      console.log('Waitlist API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Waitlist API response data:', data);
        setIsOnWaitlist(data.isOnWaitlist);
      } else {
        const errorText = await response.text();
        console.error('Waitlist API error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error checking waitlist status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinWaitlist = async () => {
    if (!user?.email || isJoining) return;

    try {
      setIsJoining(true);
      console.log('Attempting to join waitlist for:', user.email);
      
      // Use Safari-specific endpoint if needed
      const endpoint = isSafari ? '/api/waitlist/safari' : '/api/waitlist';
      const body = isSafari ? JSON.stringify({ email: user.email }) : undefined;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const data = await response.json();
      console.log('Join waitlist response:', response.status, data);

      if (response.ok) {
        setIsOnWaitlist(true);
      } else {
        console.error('Failed to join waitlist:', data.error);
        // You could show an error message here
        alert(data.error || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert('Network error. Please try again.');
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
            className="text-center space-y-2"
          >
            <p className="text-electric-mint text-lg font-medium">
              You&apos;re on the waitlist!
            </p>
            <p className="text-foreground/60 text-base">
              We&apos;ll be in touch!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
