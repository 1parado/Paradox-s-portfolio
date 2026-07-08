// Paradox portfolio service worker.
// 目的：让 GitHub Pages 上的静态站点在部署后能立即被访客看到最新页面，
// 而不必等浏览器 HTML 缓存过期（Pages 默认缓存 HTML 约 10 分钟）。
//
// 策略：
//   - 导航请求（HTML 文档）→ 网络优先：总是拉最新 HTML，失败再回退缓存。
//     这样新部署的 HTML（引用新的 _next 哈希 chunk）会立即生效。
//   - 同源静态资源（_next/ 下的 JS/CSS/字体等）→ 缓存优先：命中直接用，
//     未命中再联网并缓存。这些资源文件名带内容哈希，缓存绝对安全。

const CACHE = 'paradox-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.ok && fresh.type === 'basic') cache.put(request, fresh.clone());
  return fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
