'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * 图片加速层：把 raw.githubusercontent.com 直链改写为 jsDelivr 全球 CDN 链接。
 *
 * - jsDelivr 对公开 GitHub 仓库的静态文件做边缘缓存，访客就近拉取，
 *   比 raw.githubusercontent.com（单区出口）快得多，尤其国内访问。
 * - 仓库内图片文件名带唯一时间戳 + 随机 id，内容不可变，不存在 CDN 缓存过期问题。
 * - jsDelivr 单文件上限 20MB：超限或 CDN 故障时走 onError/探针回退到 raw 直链，保证可用性。
 */

export const RAW_URL_PATTERN =
  /^https?:\/\/raw\.githubusercontent\.com\/([^/\s)"']+)\/([^/\s)"']+)\/([^/\s)"']+)\/(.+)$/;

/** raw.githubusercontent.com 直链 → jsDelivr CDN 链接；不匹配时原样返回。 */
export function toCdnUrl(url: string): string {
  const match = url.match(RAW_URL_PATTERN);
  if (!match) return url;
  return `https://cdn.jsdelivr.net/gh/${match[1]}/${match[2]}@${match[3]}/${match[4]}`;
}

/** 壁纸 CSS value（url(...) center / cover no-repeat）里的 raw 直链改写为 CDN。 */
export function accelerateWallpaperValue(value: string): string {
  return value.replace(/https?:\/\/raw\.githubusercontent\.com\/[^\s)"']+/g, (m) => toCdnUrl(m));
}

/**
 * 壁纸加速 hook：优先展示原值（保证可用），后台用 <img> 探针预加载 CDN 版本，
 * 加载成功后无缝切换到 CDN（浏览器命中探针缓存，无二次下载）；失败则保持 raw 直链。
 */
export function useAcceleratedWallpaper(value: string): string {
  const accelerated = useMemo(() => accelerateWallpaperValue(value), [value]);
  const [useCdn, setUseCdn] = useState(false);
  const probedRef = useRef<string | null>(null);

  useEffect(() => {
    if (accelerated === value) {
      setUseCdn(false);
      return;
    }
    if (probedRef.current === accelerated) return;
    probedRef.current = accelerated;
    const img = new Image();
    img.onload = () => setUseCdn(true);
    img.onerror = () => setUseCdn(false);
    img.src = accelerated;
  }, [accelerated, value]);

  return useCdn ? accelerated : value;
}
