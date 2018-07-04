var dataCacheName = 'weatherData-v7';
var cacheName = 'weatherPWA-step-7-1';
var filesToCache = [
  '/pwa-weather',
  '/pwa-weather/index.html',
  '/pwa-weather/scripts/app.js',
  '/pwa-weather/styles/inline.css',
  '/pwa-weather/images/clear.png',
  '/pwa-weather/images/cloudy-scattered-showers.png',
  '/pwa-weather/images/cloudy.png',
  '/pwa-weather/images/fog.png',
  '/pwa-weather/images/ic_add_white_24px.svg',
  '/pwa-weather/images/ic_refresh_white_24px.svg',
  '/pwa-weather/images/partly-cloudy.png',
  '/pwa-weather/images/rain.png',
  '/pwa-weather/images/scattered-showers.png',
  '/pwa-weather/images/sleet.png',
  '/pwa-weather/images/snow.png',
  '/pwa-weather/images/thunderstorm.png',
  '/pwa-weather/images/wind.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = 'https://publicdata-weather.firebaseio.com/';
  if (e.request.url.indexOf(dataUrl) === 0) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            console.log('[ServiceWorker] Fetched&Cached Data');
            return response;
          });
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
