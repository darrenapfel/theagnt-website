'use client';

// Service Worker registration and management
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Register the service worker
   */
  async register(): Promise<boolean> {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service workers not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Registration successful:', this.registration.scope);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdate();
      });

      // Check for existing service worker
      if (this.registration.active) {
        console.log('[SW] Service worker already active');
      }

      return true;
    } catch (error) {
      console.error('[SW] Registration failed:', error);
      return false;
    }
  }

  /**
   * Handle service worker updates
   */
  private handleUpdate(): void {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker available
        console.log('[SW] New version available');
        this.promptUserToUpdate();
      }
    });
  }

  /**
   * Prompt user to update (in production you might show a toast/notification)
   */
  private promptUserToUpdate(): void {
    // For now, just skip waiting automatically for better performance
    this.skipWaiting();
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration) return;

    const newWorker = this.registration.waiting || this.registration.installing;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    }

    // Listen for the new service worker to take control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('[SW] Unregistered:', result);
      return result;
    } catch (error) {
      console.error('[SW] Unregistration failed:', error);
      return false;
    }
  }

  /**
   * Get service worker status
   */
  getStatus(): string {
    if (!('serviceWorker' in navigator)) {
      return 'not-supported';
    }

    if (!this.registration) {
      return 'not-registered';
    }

    if (this.registration.active) {
      return 'active';
    }

    if (this.registration.installing) {
      return 'installing';
    }

    if (this.registration.waiting) {
      return 'waiting';
    }

    return 'unknown';
  }
}

// Global instance
export const serviceWorkerManager = new ServiceWorkerManager();

/**
 * Initialize service worker with error handling
 */
export async function initServiceWorker(): Promise<void> {
  // Only register in production or when explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SW_ENABLED) {
    console.log('[SW] Skipping registration in development');
    return;
  }

  try {
    const success = await serviceWorkerManager.register();
    if (success) {
      console.log('[SW] Initialized successfully');
    }
  } catch (error) {
    console.error('[SW] Initialization failed:', error);
  }
}

/**
 * Preload critical authentication resources
 */
export function preloadAuthResources(): void {
  const criticalResources = [
    '/auth/signin',
    '/api/auth/providers',
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Add preconnect hints for OAuth providers
 */
export function addOAuthPreconnects(): void {
  const oauthDomains = [
    'https://accounts.google.com',
    'https://appleid.apple.com',
  ];

  oauthDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

export default ServiceWorkerManager;