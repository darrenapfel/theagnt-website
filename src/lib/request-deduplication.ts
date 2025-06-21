'use client';

// Request deduplication utility to prevent multiple identical requests
class RequestDeduplicator {
  private cache: Map<string, Promise<any>> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Deduplicate requests based on a unique key
   * @param key - Unique identifier for the request
   * @param requestFn - Function that returns a Promise
   * @param ttl - Time to live in milliseconds (default 5000ms)
   */
  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 5000
  ): Promise<T> {
    // Check if request is already in flight
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Execute the request
    const promise = requestFn();
    
    // Cache the promise
    this.cache.set(key, promise);

    // Set up cleanup timeout
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);
    
    this.timeouts.set(key, timeout);

    try {
      const result = await promise;
      return result;
    } catch (error) {
      // Remove from cache on error to allow retry
      this.cache.delete(key);
      const timeoutId = this.timeouts.get(key);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.timeouts.delete(key);
      }
      throw error;
    }
  }

  /**
   * Clear specific request from cache
   */
  clear(key: string): void {
    this.cache.delete(key);
    const timeoutId = this.timeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(key);
    }
  }

  /**
   * Clear all cached requests
   */
  clearAll(): void {
    this.cache.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

// Global instance for auth requests
export const authRequestDeduplicator = new RequestDeduplicator();

// Specialized functions for auth operations
export const deduplicatedSignIn = (provider: string, options: any) => {
  const key = `signin-${provider}-${JSON.stringify(options)}`;
  return authRequestDeduplicator.deduplicate(
    key,
    async () => {
      const { signIn } = await import('next-auth/react');
      return signIn(provider, options);
    },
    3000 // 3 seconds TTL for sign-in requests
  );
};

export const deduplicatedMagicLink = (email: string, redirectTo: string) => {
  const key = `magic-link-${email}-${redirectTo}`;
  return authRequestDeduplicator.deduplicate(
    key,
    async () => {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirectTo,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send magic link');
      }

      return response.json();
    },
    10000 // 10 seconds TTL for magic link requests
  );
};

export default RequestDeduplicator;