'use client';
import { cn } from '@/lib/utils';

interface ManaSymbolProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

const SYMBOL_STYLES: Record<string, string> = {
  W: 'bg-amber-100 border-amber-300 text-amber-900',
  U: 'bg-blue-500 border-blue-700 text-white',
  B: 'bg-gray-900 border-gray-700 text-gray-100',
  R: 'bg-red-500 border-red-700 text-white',
  G: 'bg-green-600 border-green-800 text-white',
  C: 'bg-gray-400 border-gray-600 text-gray-800',
  X: 'bg-gray-600 border-gray-800 text-white',
  T: 'bg-amber-700 border-amber-900 text-white',
  S: 'bg-cyan-300 border-cyan-500 text-cyan-900',
};

const SYMBOL_DISPLAY: Record<string, string> = {
  W: 'W', U: 'U', B: 'B', R: 'R', G: 'G',
  C: 'C', X: 'X', T: '↷', S: '❄',
};

const SIZES = {
  sm: 'w-4 h-4 text-[9px]',
  md: 'w-5 h-5 text-[10px]',
  lg: 'w-6 h-6 text-xs',
};

export default function ManaSymbol({ symbol, size = 'md' }: ManaSymbolProps) {
  const num = parseInt(symbol);
  const isNumeric = !isNaN(num);
  const style = isNumeric
    ? 'bg-gray-500 border-gray-700 text-white'
    : SYMBOL_STYLES[symbol] ?? 'bg-gray-500 border-gray-600 text-white';

  const display = isNumeric ? symbol : (SYMBOL_DISPLAY[symbol] ?? symbol);

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-bold leading-none',
        SIZES[size],
        style,
      )}
      title={`{${symbol}}`}
    >
      {display}
    </span>
  );
}

interface ManaCostDisplayProps {
  manaCost: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ManaCostDisplay({ manaCost, size = 'md' }: ManaCostDisplayProps) {
  const matches = manaCost.match(/\{([^}]+)\}/g) ?? [];
  const symbols = matches.map(m => m.slice(1, -1));

  return (
    <span className="inline-flex items-center gap-0.5">
      {symbols.map((s, i) => (
        <ManaSymbol key={i} symbol={s} size={size} />
      ))}
    </span>
  );
}
