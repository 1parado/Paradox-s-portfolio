import { Calculator } from '@/components/builtin/Calculator';
import { ContactCard } from '@/components/builtin/ContactCard';
import { Notepad } from '@/components/builtin/Notepad';
import { OpenSourceContributions } from '@/components/builtin/OpenSourceContributions';
import { PhotoApp } from '@/components/builtin/PhotoApp';
import { Resume } from '@/components/builtin/Resume';
import { VoiceCalendar } from '@/components/builtin/VoiceCalendar';

export function getBuiltinApp(key?: string) {
  if (key === 'calculator') return Calculator;
  if (key === 'contact') return ContactCard;
  if (key === 'notepad') return Notepad;
  if (key === 'open-source') return OpenSourceContributions;
  if (key === 'photo') return PhotoApp;
  if (key === 'resume') return Resume;
  if (key === 'voice-calendar') return VoiceCalendar;
  return null;
}
