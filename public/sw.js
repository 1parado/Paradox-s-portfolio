// Paradox portfolio service worker.
// 目的：让 GitHub Pages 上的静态站点在部署后能立即被访客看到最新页面，
// 而不必等浏览器 HTML 缓存过期（Pages 默认缓存 HTML 约 10 分钟）。
//
// 策略：
//   - 导航请求（HTML 文档）→ 网络优先，且用 cache: 'no-cache' 强制与源站再校验，
//     绕过浏览器本地的 HTTP 缓存——否则同一浏览器会一直拿到旧 HTML（换个没缓存的
//     浏览器才是新页面）。失败再回退缓存（离线兜底）。
//   - 同源静态资源（_next/ 下的 JS/CSS/字体等）→ 缓存优先：命中直接用，
//     未命中再联网并缓存。这些资源文件名带内容哈希，缓存绝对安全。
//
// 部署新版本时：bump CACHE 版本号会让新 SW 在 activate 阶段清掉旧缓存，
// 配合 skipWaiting + clients.claim + 页面 controllerchange 重载，访客可即时切换到新版。

const CACHE = 'paradox-cache-v2';

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
    // no-cache：每次都与源站再校验（304 或新 200），绝不直接用浏览器本地 HTTP 缓存里的旧 HTML。
    const fresh = await fetch(request, { cache: 'no-cache' });
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
