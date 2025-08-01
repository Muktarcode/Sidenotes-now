// SideNotes Clone - Service Worker
// Provides offline caching and PWA functionality

const CACHE_NAME = 'sidenotes-v1.0.0';
const STATIC_CACHE_NAME = 'sidenotes-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'sidenotes-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical assets as needed
];

// Network-first resources (for dynamic content)
const NETWORK_FIRST_ROUTES = [
  '/api/',
];

// Cache-first resources (for static assets)
const CACHE_FIRST_ROUTES = [
  '/static/',
  '/images/',
  '/fonts/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SideNotes SW: Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('SideNotes SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SideNotes SW: Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('SideNotes SW: Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SideNotes SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('sidenotes-') && 
                     cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('SideNotes SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('SideNotes SW: Service worker activated');
        return self.clients.claim(); // Take control immediately
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
  
  // Skip cross-origin requests (unless specifically needed)
  if (url.origin !== location.origin) {
    return;
  }
  
  // Determine caching strategy based on URL
  if (shouldUseNetworkFirst(url.pathname)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (shouldUseCacheFirst(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network-first strategy (for API calls and dynamic content)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SideNotes SW: Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback if available
    return createOfflineFallback(request);
  }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('SideNotes SW: Failed to fetch and cache:', error);
    return createOfflineFallback(request);
  }
}

// Stale-while-revalidate strategy (for main app)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('SideNotes SW: Network request failed:', error);
      return cachedResponse;
    });
  
  return cachedResponse || fetchPromise;
}

// Helper functions
function shouldUseNetworkFirst(pathname) {
  return NETWORK_FIRST_ROUTES.some(route => pathname.startsWith(route));
}

function shouldUseCacheFirst(pathname) {
  return CACHE_FIRST_ROUTES.some(route => pathname.startsWith(route));
}

function createOfflineFallback(request) {
  if (request.destination === 'document') {
    return caches.match('/') || new Response(
      '<html><body><h1>SideNotes is Offline</h1><p>Your notes are still available in the cached version.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  return new Response('Offline', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('SideNotes SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Implement any sync logic needed when connection is restored
    console.log('SideNotes SW: Background sync completed');
  } catch (error) {
    console.error('SideNotes SW: Background sync failed:', error);
  }
}

// Push notification handling (for future features)
self.addEventListener('push', (event) => {
  console.log('SideNotes SW: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open SideNotes',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SideNotes', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('SideNotes SW: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Share target handling (when app is shared to from other apps)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') || 'Shared Note';
    const text = formData.get('text') || '';
    const url = formData.get('url') || '';
    
    // Store shared content in a way that the main app can retrieve it
    const sharedData = {
      title,
      text,
      url,
      timestamp: Date.now()
    };
    
    // Use postMessage to send data to the main app
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SHARED_CONTENT',
        data: sharedData
      });
    }
    
    // Redirect to main app
    return Response.redirect('/', 302);
  } catch (error) {
    console.error('SideNotes SW: Share target error:', error);
    return Response.redirect('/', 302);
  }
}

console.log('SideNotes SW: Service worker script loaded');