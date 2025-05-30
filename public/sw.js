const CACHE_NAME = 'eccentric-life-game-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // 他の必要なリソースがあればここに追加
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュから返すか、ネットワークから取得
        return response || fetch(event.request);
      })
  );
}); 