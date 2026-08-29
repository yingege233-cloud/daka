// 离线支持：有网时用最新的网页，没网时用缓存里的
var CACHE = 'daka-cache-v1';

// 安装时预缓存主要文件
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll([
        './',
        './index.html',
        './manifest.json',
        './icon-192.png',
        './icon-512.png'
      ]);
    }).then(function () { return self.skipWaiting(); })
  );
});

// 清理旧版本缓存
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// 网络优先，失败时用缓存（保证页面永远是新的，断网也能用）
self.addEventListener('fetch', function (e) {
  e.respondWith(
    fetch(e.request).then(function (resp) {
      if (resp && resp.status === 200 && e.request.method === 'GET') {
        var copy = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
