import { Calculator } from '@/components/builtin/Calculator';
import { ContactCard } from '@/components/builtin/ContactCard';
import { OpenSourceContributions } from '@/components/builtin/OpenSourceContributions';
import { VoiceCalendar } from '@/components/builtin/VoiceCalendar';

export function getBuiltinApp(key?: string) {
  if (key === 'calculator') return Calculator;
  if (key === 'contact') return ContactCard;
  if (key === 'open-source') return OpenSourceContributions;
  if (key === 'voice-calendar') return VoiceCalendar;
  return null;
}
