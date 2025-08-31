// Global Horizon Academy Service Worker
// Version: 1.0.0

const CACHE_NAME = 'global-horizon-academy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/config.js',
  '/images/logo.webp',
  '/images/hero-image.webp',
  '/images/about-img.webp',
  '/images/course1.webp',
  '/images/course2.webp',
  '/images/course3.webp',
  '/images/course4.webp',
  '/images/course5.webp',
  '/images/course6.webp',
  '/images/student1.webp',
  '/images/student2.webp',
  '/images/parent1.webp'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
