import { createElement } from 'react';
import dynamic from 'next/dynamic';

function BuiltinAppLoading() {
  return createElement(
    'div',
    {
      className: 'flex h-full min-h-48 items-center justify-center gap-3 text-sm text-white/70',
      role: 'status',
      'aria-live': 'polite',
    },
    createElement('span', {
      className: 'h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white/80',
      'aria-hidden': true,
    }),
    createElement('span', null, '正在加载 App…'),
  );
}

const AboutCard = dynamic(
  () => import('@/components/builtin/AboutCard').then((module) => module.AboutCard),
  { loading: BuiltinAppLoading },
);
const BookList = dynamic(
  () => import('@/components/builtin/BookList').then((module) => module.BookList),
  { loading: BuiltinAppLoading },
);
const Calculator = dynamic(
  () => import('@/components/builtin/Calculator').then((module) => module.Calculator),
  { loading: BuiltinAppLoading },
);
const ContactCard = dynamic(
  () => import('@/components/builtin/ContactCard').then((module) => module.ContactCard),
  { loading: BuiltinAppLoading },
);
const Notepad = dynamic(
  () => import('@/components/builtin/Notepad').then((module) => module.Notepad),
  { loading: BuiltinAppLoading },
);
const OpenSourceContributions = dynamic(
  () => import('@/components/builtin/OpenSourceContributions').then((module) => module.OpenSourceContributions),
  { loading: BuiltinAppLoading },
);
const PhotoApp = dynamic(
  () => import('@/components/builtin/PhotoApp').then((module) => module.PhotoApp),
  { loading: BuiltinAppLoading },
);
const Resume = dynamic(
  () => import('@/components/builtin/Resume').then((module) => module.Resume),
  { loading: BuiltinAppLoading },
);
const SkillsList = dynamic(
  () => import('@/components/builtin/SkillsList').then((module) => module.SkillsList),
  { loading: BuiltinAppLoading },
);
const VoiceCalendar = dynamic(
  () => import('@/components/builtin/VoiceCalendar').then((module) => module.VoiceCalendar),
  { loading: BuiltinAppLoading },
);
const MusicApp = dynamic(
  () => import('@/components/builtin/MusicApp').then((module) => module.MusicApp),
  { loading: BuiltinAppLoading },
);

export function getBuiltinApp(key?: string) {
  if (key === 'about') return AboutCard;
  if (key === 'booklist') return BookList;
  if (key === 'calculator') return Calculator;
  if (key === 'contact') return ContactCard;
  if (key === 'notepad') return Notepad;
  if (key === 'open-source') return OpenSourceContributions;
  if (key === 'photo') return PhotoApp;
  if (key === 'resume') return Resume;
  if (key === 'skills') return SkillsList;
  if (key === 'voice-calendar') return VoiceCalendar;
  if (key === 'music') return MusicApp;
  return null;
}
