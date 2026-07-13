import { MacPortfolio } from '@/components/MacPortfolio';

export default function Page() {
  return (
    <>
      <MacPortfolio />
      <noscript>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #09111f 0%, #1d4f7a 34%, #a94f82 68%, #201530 100%)',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700 }}>李家乐 (Paradox) 的作品集</div>
          <div style={{ maxWidth: 640, fontSize: 18, opacity: 0.85, lineHeight: 1.6 }}>
            macOS 风格交互式作品集：像操作真实 Mac 桌面一样浏览项目、开源贡献与联系方式。
          </div>
          <a
            href="https://github.com/1parado"
            style={{ marginTop: 8, fontSize: 16, color: 'white', textDecoration: 'underline', opacity: 0.9 }}
          >
            github.com/1parado
          </a>
          <div style={{ marginTop: 12, fontSize: 14, opacity: 0.6 }}>请启用 JavaScript 以体验完整交互桌面。</div>
        </div>
      </noscript>
    </>
  );
}
