import type { Metadata } from 'next';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://1parado.github.io'),
  title: {
    default: '李家乐 (Paradox) 的作品集',
    template: '%s · Paradox',
  },
  description:
    '李家乐（Paradox）的 macOS 风格交互式作品集：像操作真实 Mac 桌面一样浏览项目、开源贡献与联系方式。',
  applicationName: "Paradox's portfolio",
  keywords: ['作品集', 'Portfolio', 'Paradox', '李家乐', 'macOS', '前端', '开源', 'Frontend'],
  authors: [{ name: '李家乐 (Paradox)', url: 'https://github.com/1parado' }],
  creator: '李家乐 (Paradox)',
  alternates: {
    canonical: 'https://1parado.github.io/Paradox-s-portfolio',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://1parado.github.io/Paradox-s-portfolio',
    siteName: "Paradox's portfolio",
    title: '李家乐 (Paradox) 的作品集',
    description:
      'macOS 风格交互式作品集：像操作真实 Mac 桌面一样浏览项目、开源贡献与联系方式。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '李家乐 (Paradox) 的作品集',
    description:
      'macOS 风格交互式作品集：像操作真实 Mac 桌面一样浏览项目、开源贡献与联系方式。',
    creator: '@1parado',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
