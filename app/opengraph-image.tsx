import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '李家乐 (Paradox) 的作品集';
export const dynamic = 'force-static';

const INTER_URLS = [
  { weight: 400, url: 'https://rsms.me/inter/font-files/Inter-Regular.woff2' },
  { weight: 500, url: 'https://rsms.me/inter/font-files/Inter-Medium.woff2' },
  { weight: 600, url: 'https://rsms.me/inter/font-files/Inter-SemiBold.woff2' },
  { weight: 700, url: 'https://rsms.me/inter/font-files/Inter-Bold.woff2' },
];

async function loadFonts() {
  const fonts: any[] = [];
  for (const { weight, url } of INTER_URLS) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      fonts.push({ name: 'Inter', data: Buffer.from(await res.arrayBuffer()), weight, style: 'normal' });
    } catch {
      /* skip unavailable weight, fall back to default */
    }
  }
  return fonts;
}

async function loadAvatar(): Promise<string | null> {
  try {
    const res = await fetch('https://avatars.githubusercontent.com/u/98088789?v=4&size=256', { cache: 'no-store' });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

const dockApps = [
  'linear-gradient(135deg,#FF9F0A,#FF6B00)',
  'linear-gradient(135deg,#0A84FF,#0040DD)',
  'linear-gradient(135deg,#30D158,#1AA34A)',
  'linear-gradient(135deg,#BF5AF2,#7D2AE8)',
  'linear-gradient(135deg,#FF375F,#D10B30)',
  'linear-gradient(135deg,#64D2FF,#0A84FF)',
];

export default async function OpengraphImage() {
  const [fonts, avatar] = await Promise.all([loadFonts(), loadAvatar()]);
  const fontFamily = fonts.length > 0 ? 'Inter' : 'sans-serif';
  const options = { ...size, ...(fonts.length > 0 ? { fonts } : {}) };

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          fontFamily,
          background: 'linear-gradient(135deg, #0B1A2F 0%, #1C6E73 32%, #C75B54 64%, #3A2350 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 24% 16%, rgba(255,255,255,0.18), rgba(255,255,255,0) 52%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 780,
            borderRadius: 30,
            overflow: 'hidden',
            background: 'rgba(18,20,30,0.55)',
            border: '1px solid rgba(255,255,255,0.20)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.45)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 54,
              paddingLeft: 22,
              paddingRight: 22,
              background: 'rgba(255,255,255,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div style={{ display: 'flex', gap: 9 }}>
              <div style={{ width: 13, height: 13, borderRadius: 7, background: '#FF5F57' }} />
              <div style={{ width: 13, height: 13, borderRadius: 7, background: '#FEBC2E' }} />
              <div style={{ width: 13, height: 13, borderRadius: 7, background: '#28C840' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 21, fontWeight: 500, color: 'rgba(255,255,255,0.70)' }}>
              Paradox Portfolio
            </div>
            <div style={{ width: 69 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '44px 64px 52px' }}>
            {avatar ? (
              <img
                src={avatar}
                width={132}
                height={132}
                style={{ borderRadius: 34, border: '3px solid rgba(255,255,255,0.90)', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 132,
                  height: 132,
                  borderRadius: 34,
                  background: 'linear-gradient(135deg, #22D3EE, #A78BFA)',
                  color: 'white',
                  fontSize: 80,
                  fontWeight: 700,
                }}
              >
                P
              </div>
            )}
            <div style={{ marginTop: 20, fontSize: 20, letterSpacing: 6, color: 'rgba(255,255,255,0.50)', fontWeight: 600 }}>
              PORTFOLIO
            </div>
            <div style={{ marginTop: 6, fontSize: 70, fontWeight: 700, color: '#FFFFFF', letterSpacing: -1.5 }}>Paradox</div>
            <div style={{ marginTop: 4, fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>@1parado</div>
            <div style={{ marginTop: 12, fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
              macOS-style interactive portfolio
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            borderRadius: 24,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {dockApps.map((gradient, index) => (
            <div key={index} style={{ width: 56, height: 56, borderRadius: 14, background: gradient }} />
          ))}
        </div>
      </div>
    ),
    options,
  );
}
