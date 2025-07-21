// Enhanced Service Worker for performance optimization
const CACHE_NAME = 'animator-blog-v2';
const STATIC_CACHE = 'static-v2';
const API_CACHE = 'api-v2';
const IMAGE_CACHE = 'images-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Cache configuration
const CACHE_CONFIG = {
  static: { maxAge: 30 * 24 * 60 * 60 * 1000, maxEntries: 100 }, // 30 days
  dynamic: { maxAge: 24 * 60 * 60 * 1000, maxEntries: 50 },      // 1 day
  images: { maxAge: 7 * 24 * 60 * 60 * 1000, maxEntries: 200 },  // 7 days
  api: { maxAge: 60 * 60 * 1000, maxEntries: 100 },              // 1 hour
};

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/blog',
  '/gallery',
  '/manifest.json',
  '/offline.html',
];

// Critical API endpoints to preload
const CRITICAL_API_ENDPOINTS = [
  '/api/blog-posts?pagination[page]=1&pagination[pageSize]=6',
  '/api/gallery-works?pagination[page]=1&pagination[pageSize]=9',
  '/api/featured',
  '/api/categories',
];

// Install event - cache static resources and preload critical APIs
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_RESOURCES);
      }),
      // Preload critical API endpoints
      caches.open(API_CACHE).then((cache) => {
        return Promise.all(
          CRITICAL_API_ENDPOINTS.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response) : null)
              .catch(() => null)
          )
        );
      }),
      // Initialize other caches
      caches.open(IMAGE_CACHE),
      caches.open(DYNAMIC_CACHE),
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and expired entries
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old cache versions
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('v2') && 
                [STATIC_CACHE, API_CACHE, IMAGE_CACHE, DYNAMIC_CACHE].some(cache => 
                  cacheName.includes(cache.replace('v2', ''))
                )) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clean up expired entries
      cleanupExpiredEntries(),
    ]).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - enhanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Route to appropriate handler
  if (url.pathname.startsWith('/api/') || url.origin.includes('1337')) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
  } else {
    event.respondWith(handleOtherRequests(request));
  }
});

// Helper functions
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(new URL(request.url).pathname);
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_next/static/') ||
         /\.(js|css|woff|woff2|ttf|otf)$/i.test(url.pathname);
}

function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  
  const responseTime = new Date(dateHeader).getTime();
  return Date.now() - responseTime > maxAge;
}

async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    const entriesToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(entriesToDelete.map(key => cache.delete(key)));
  }
}

async function cleanupExpiredEntries() {
  const cacheConfigs = [
    { name: STATIC_CACHE, config: CACHE_CONFIG.static },
    { name: DYNAMIC_CACHE, config: CACHE_CONFIG.dynamic },
    { name: IMAGE_CACHE, config: CACHE_CONFIG.images },
    { name: API_CACHE, config: CACHE_CONFIG.api },
  ];
  
  await Promise.all(
    cacheConfigs.map(async ({ name, config }) => {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      const expiredKeys = await Promise.all(
        keys.map(async (key) => {
          const response = await cache.match(key);
          return isExpired(response, config.maxAge) ? key : null;
        })
      );
      
      const keysToDelete = expiredKeys.filter(Boolean);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
    })
  );
}

// API request handler - Stale-while-revalidate strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Return cached response immediately if available and not expired
  if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.api.maxAge)) {
    // Revalidate in background
    fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});
    
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      await cleanupCache(API_CACHE, CACHE_CONFIG.api.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Return stale cache if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Content not available offline' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Image request handler - Cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.images.maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      await cleanupCache(IMAGE_CACHE, CACHE_CONFIG.images.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Image not available offline', { status: 503 });
  }
}

// Static asset handler - Cache-first with long TTL
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.static.maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      await cleanupCache(STATIC_CACHE, CACHE_CONFIG.static.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Navigation handler - Network-first with fallback
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
      await cleanupCache(DYNAMIC_CACHE, CACHE_CONFIG.dynamic.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache first
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try static cache for root page
    const staticCache = await caches.open(STATIC_CACHE);
    const rootResponse = await staticCache.match('/');
    
    if (rootResponse) {
      return rootResponse;
    }
    
    // Return offline page
    const offlineResponse = await staticCache.match('/offline.html');
    
    return offlineResponse || new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Animator Blog</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: #f9fafb;
              color: #374151;
            }
            .offline-message {
              max-width: 400px;
              margin: 2rem auto;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .retry-btn {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 1rem;
              margin-top: 1rem;
            }
            .retry-btn:hover {
              background: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <h1>You're Offline</h1>
            <p>This page isn't available offline. Please check your internet connection and try again.</p>
            <button class="retry-btn" onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Other requests handler
async function handleOtherRequests(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response('Request failed', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any queued offline actions
  console.log('Background sync triggered');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'blog-notification'
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});