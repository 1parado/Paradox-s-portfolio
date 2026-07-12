import { AboutCard } from '@/components/builtin/AboutCard';
import { BookList } from '@/components/builtin/BookList';
import { Calculator } from '@/components/builtin/Calculator';
import { ContactCard } from '@/components/builtin/ContactCard';
import { Notepad } from '@/components/builtin/Notepad';
import { OpenSourceContributions } from '@/components/builtin/OpenSourceContributions';
import { PhotoApp } from '@/components/builtin/PhotoApp';
import { Resume } from '@/components/builtin/Resume';
import { SkillsList } from '@/components/builtin/SkillsList';
import { VoiceCalendar } from '@/components/builtin/VoiceCalendar';
import { MusicApp } from '@/components/builtin/MusicApp';

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
