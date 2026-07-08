'use client';

import { useMemo, useState } from 'react';

const buttons = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(true);

  const displayValue = useMemo(() => display.slice(0, 12), [display]);

  const compute = (nextOperator?: string) => {
    if (storedValue === null || operator === null) {
      setStoredValue(Number(display));
      setOverwrite(true);
      if (nextOperator) setOperator(nextOperator);
      return;
    }

    const current = Number(display);
    const result =
      operator === '+' ? storedValue + current :
      operator === '-' ? storedValue - current :
      operator === '×' ? storedValue * current :
      operator === '÷' ? storedValue / current :
      current;

    setDisplay(Number.isFinite(result) ? String(result) : 'Error');
    setStoredValue(nextOperator ? result : null);
    setOperator(nextOperator ?? null);
    setOverwrite(true);
  };

  const onPress = (value: string) => {
    if (/^\d$/.test(value)) {
      setDisplay((current) => (overwrite ? value : current === '0' ? value : current + value));
      setOverwrite(false);
      return;
    }

    if (value === '.') {
      setDisplay((current) => {
        if (overwrite) return '0.';
        return current.includes('.') ? current : `${current}.`;
      });
      setOverwrite(false);
      return;
    }

    if (value === 'C') {
      setDisplay('0');
      setStoredValue(null);
      setOperator(null);
      setOverwrite(true);
      return;
    }

    if (value === '±') {
      setDisplay((current) => String(Number(current) * -1));
      return;
    }

    if (value === '%') {
      setDisplay((current) => String(Number(current) / 100));
      return;
    }

    if (value === '=') {
      compute();
      return;
    }

    compute(value);
  };

  return (
    <div className="flex h-full flex-col rounded-[2rem] bg-[#111827] p-4 text-white">
      <div className="flex min-h-24 items-end justify-end rounded-[1.5rem] bg-black/30 px-4 py-3 text-right text-5xl font-light">
        {displayValue}
      </div>
      <div className="mt-4 grid flex-1 grid-cols-4 gap-3">
        {buttons.flat().map((button, index) => {
          const isZero = button === '0';
          const isOperator = ['÷', '×', '-', '+', '='].includes(button);
          return (
            <button
              key={`${button}-${index}`}
              type="button"
              onClick={() => onPress(button)}
              className={[
                'rounded-full text-2xl font-medium transition active:scale-95',
                isZero ? 'col-span-2 px-6 text-left' : '',
                isOperator ? 'bg-orange-500 text-white' : 'bg-white/10 text-white',
              ].join(' ')}
            >
              {button}
            </button>
          );
        })}
      </div>
    </div>
  );
}
