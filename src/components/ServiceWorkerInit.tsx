'use client';

import { useEffect } from 'react';
import { initServiceWorker, preloadAuthResources, addOAuthPreconnects } from '../lib/service-worker';

export function ServiceWorkerInit() {
  useEffect(() => {
    // Initialize service worker
    initServiceWorker();
    
    // Preload critical auth resources
    preloadAuthResources();
    
    // Add OAuth preconnects
    addOAuthPreconnects();
  }, []);

  // This component doesn't render anything
  return null;
}

export default ServiceWorkerInit;