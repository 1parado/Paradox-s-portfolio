import { Calculator } from '@/components/builtin/Calculator';
import { ContactCard } from '@/components/builtin/ContactCard';
import { OpenSourceContributions } from '@/components/builtin/OpenSourceContributions';

export function getBuiltinApp(key?: string) {
  if (key === 'calculator') return Calculator;
  if (key === 'contact') return ContactCard;
  if (key === 'open-source') return OpenSourceContributions;
  return null;
}
