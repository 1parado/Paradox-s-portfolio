'use client';

import { useEffect } from 'react';

/**
 * 注册 Service Worker（仅生产环境）。
 * SW 对页面导航走网络优先（no-cache 再校验），确保 GitHub Pages 部署后访客立即看到最新页面，
 * 不再被旧的 HTML 缓存卡住。
 *
 * 当后台发现新版 SW 并接管（skipWaiting）时，自动刷新一次页面，
 * 让本次访问就用上新 SW + 最新 HTML；首次注册不刷新，避免循环。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const hadController = !!navigator.serviceWorker.controller;

    const register = () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('Service Worker 注册失败', error);
      });
    };

    let refreshing = false;
    const onControllerChange = () => {
      if (!hadController) return; // 首次注册，无需刷新
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return null;
}
