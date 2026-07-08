'use client';

import { useEffect } from 'react';

/**
 * 注册 Service Worker（仅生产环境）。
 * SW 对页面导航走网络优先，确保 GitHub Pages 部署后访客立即看到最新页面，
 * 不再被旧的 HTML 缓存卡住。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('Service Worker 注册失败', error);
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}
