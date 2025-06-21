// Service Worker for theAGNT.ai Authentication Performance
const CACHE_NAME = 'theagnt-auth-v1';
const RUNTIME_CACHE = 'theagnt-runtime-v1';

// Assets to pre-cache
const PRECACHE_ASSETS = [
  '/',
  '/auth/signin',
  '/auth/success',
  '/auth/error',
  '/favicon.ico',
];

// API routes to cache with strategy
const API_CACHE_PATTERNS = [
  /^\/api\/auth\//,
  /^\/api\/waitlist/,
];

// Static assets patterns
const STATIC_CACHE_PATTERNS = [
  /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(url.pathname)) {
    // Static assets - Cache First strategy
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(url.pathname)) {
    // API requests - Network First with short cache
    event.respondWith(networkFirstWithCache(request));
  } else if (isAuthPage(url.pathname)) {
    // Auth pages - Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Other requests - Network First
    event.respondWith(networkFirst(request));
  }
});

// Cache strategies
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithCache(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses for 5 minutes
    if (response.status === 200) {
      const responseToCache = response.clone();
      // Add timestamp header
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
    
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    
    if (cached) {
      const cachedAt = cached.headers.get('sw-cached-at');
      const cacheAge = Date.now() - parseInt(cachedAt || '0');
      
      // Use cached response if less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return cached;
      }
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  // Fetch in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached version immediately if available
  return cached || fetchPromise;
}

// Helper functions
function isStaticAsset(pathname) {
  return STATIC_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

function isAPIRequest(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

function isAuthPage(pathname) {
  return pathname.startsWith('/auth/') || pathname === '/';
}

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker registered successfully');