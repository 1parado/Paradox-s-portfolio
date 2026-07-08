import { Calculator } from '@/components/builtin/Calculator';

export function getBuiltinApp(key?: string) {
  if (key === 'calculator') return Calculator;
  return null;
}
