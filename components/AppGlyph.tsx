'use client';

import type { LucideIcon, LucideProps } from 'lucide-react';
import {
  Beaker,
  BookOpen,
  Bookmark,
  Bot,
  Briefcase,
  Calculator,
  CalendarDays,
  ChartColumn,
  Clapperboard,
  Folder,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Mail,
  Music2,
  NotebookPen,
  Pi,
  Settings,
  Sparkles,
  Target,
  Terminal,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react';
import type { AppIconKey } from '@/lib/types';

type Props = {
  iconKey?: AppIconKey;
  fallback?: string;
  className?: string;
  strokeWidth?: number;
};

/** Official GitHub mark (Lucide dropped brand icons). */
function GithubMark({ className, ...props }: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor" {...props}>
      <path d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

const lucideByKey: Partial<Record<AppIconKey, LucideIcon>> = {
  about: UserRound,
  agent: Bot,
  archive: Layers,
  automation: Zap,
  blog: NotebookPen,
  bookmark: Bookmark,
  calculator: Calculator,
  calendar: CalendarDays,
  chart: ChartColumn,
  design: LayoutTemplate,
  folder: Folder,
  globe: Globe,
  lab: Beaker,
  mail: Mail,
  music: Music2,
  mentor: GraduationCap,
  motion: Clapperboard,
  note: NotebookPen,
  photo: ImageIcon,
  pi: Pi,
  portfolio: Briefcase,
  prompt: Terminal,
  reading: BookOpen,
  resume: BookOpen,
  settings: Settings,
  skills: Wrench,
  sparkles: Sparkles,
  target: Target,
  writing: BookOpen,
};

export function AppGlyph({ iconKey, fallback = '', className = 'h-8 w-8', strokeWidth = 1.75 }: Props) {
  if (fallback.startsWith('/') || fallback.startsWith('http') || fallback.startsWith('data:')) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fallback} alt="" aria-hidden className={`${className} object-contain`} />;
  }

  if (iconKey === 'github') {
    return <GithubMark className={className} />;
  }

  const Icon = iconKey ? lucideByKey[iconKey] : null;
  if (Icon) {
    return <Icon aria-hidden className={className} strokeWidth={strokeWidth} />;
  }

  // Never render emoji — fall back to a neutral Lucide mark.
  return <Sparkles aria-hidden className={className} strokeWidth={strokeWidth} />;
}
