'use client';

import type { AppIconKey } from '@/lib/types';

type Props = {
  iconKey?: AppIconKey;
  fallback: string;
  className?: string;
};

const iconPaths: Partial<Record<AppIconKey, string[]>> = {
  about: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4.5 21a7.5 7.5 0 0 1 15 0'],
  agent: ['M7 8V6a5 5 0 0 1 10 0v2', 'M5 9h14v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9Z', 'M9 14h.01M15 14h.01M10 18h4'],
  archive: ['M4 7h16M6 7v13h12V7', 'M9 11h6'],
  automation: ['M13 2 4 14h7l-1 8 10-13h-7l1-7Z'],
  blog: ['M5 4h14v16H5z', 'M8 8h8M8 12h8M8 16h5'],
  bookmark: ['M6 4h12v17l-6-4-6 4V4Z'],
  calculator: ['M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01'],
  calendar: ['M7 3v4M17 3v4', 'M4 8h16', 'M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'M8 12h3M8 16h3M14 12h2M14 16h2'],
  chart: ['M4 19V5', 'M4 19h16', 'M8 16v-5M12 16V8M16 16v-9'],
  design: ['M4 5h16v14H4z', 'M8 9h8M8 13h3M14 13h2'],
  folder: ['M3 6h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z'],
  lab: ['M9 3h6', 'M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3', 'M8 15h8'],
  mail: ['M4 6h16v12H4z', 'm4 7 8 6 8-6'],
  mentor: ['M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M4 20a8 8 0 0 1 16 0', 'M17 5h4v6h-4'],
  motion: ['M4 6h16v12H4z', 'M8 6v12M16 6v12', 'M10 10l4 2-4 2v-4Z'],
  note: ['M6 4h9l3 3v13H6z', 'M14 4v4h4', 'M9 12h6M9 16h5'],
  photo: ['M4 5h16v14H4z', 'M8.5 15l2.5-3 2.5 3 3.5-4', 'M9 9.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z'],
  portfolio: ['M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z', 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2', 'M4 12h16'],
  prompt: ['M5 7l5 5-5 5', 'M12 17h7'],
  reading: ['M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 0V4Z', 'M5 4v16'],
  resume: ['M7 3h7l4 4v14H7z', 'M14 3v5h5', 'M10 12h6M10 16h5'],
  settings: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M3 12h3M18 12h3M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1'],
  skills: ['M5 5h14v4H5z', 'M5 15h14v4H5z', 'M8 9v6M16 9v6', 'M9 3h6M9 21h6'],
  target: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z', 'M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z'],
  writing: ['M4 20h16', 'M7 17l9.5-9.5a2.1 2.1 0 0 0-3-3L4 14v3h3Z'],
};

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function AppGlyph({ iconKey, fallback, className = 'h-8 w-8' }: Props) {
  if (fallback.startsWith('/')) {
    return <img src={fallback} alt="" aria-hidden className={`${className} object-contain`} />;
  }

  if (iconKey === 'github') {
    return <GitHubMark className={className} />;
  }

  const paths = iconKey ? iconPaths[iconKey] : null;
  if (!paths) {
    return <span className="text-[1em] leading-none">{fallback}</span>;
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((path) => <path key={path} d={path} />)}
    </svg>
  );
}
