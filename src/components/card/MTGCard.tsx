'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FakeCard } from '@/types';
import { ManaCostDisplay } from './ManaSymbol';

interface MTGCardProps {
  card: FakeCard;
  revealed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  blurArt?: boolean;
}

const FRAME_COLORS: Record<string, { outer: string; inner: string; title: string; text: string }> = {
  W: {
    outer: 'bg-gradient-to-b from-amber-100 to-amber-200 border-amber-300',
    inner: 'bg-amber-50/90',
    title: 'text-gray-900',
    text: 'text-gray-800',
  },
  U: {
    outer: 'bg-gradient-to-b from-blue-400 to-blue-700 border-blue-800',
    inner: 'bg-blue-50/90',
    title: 'text-white',
    text: 'text-gray-800',
  },
  B: {
    outer: 'bg-gradient-to-b from-gray-700 to-gray-900 border-gray-950',
    inner: 'bg-gray-100/90',
    title: 'text-gray-100',
    text: 'text-gray-900',
  },
  R: {
    outer: 'bg-gradient-to-b from-red-500 to-red-800 border-red-900',
    inner: 'bg-orange-50/90',
    title: 'text-white',
    text: 'text-gray-800',
  },
  G: {
    outer: 'bg-gradient-to-b from-green-500 to-green-800 border-green-900',
    inner: 'bg-green-50/90',
    title: 'text-white',
    text: 'text-gray-800',
  },
  multi: {
    outer: 'bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-700 border-amber-800',
    inner: 'bg-amber-50/90',
    title: 'text-gray-900',
    text: 'text-gray-800',
  },
  colorless: {
    outer: 'bg-gradient-to-b from-gray-400 to-gray-600 border-gray-700',
    inner: 'bg-gray-100/90',
    title: 'text-white',
    text: 'text-gray-900',
  },
};

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-700',
  uncommon: 'bg-slate-400',
  rare: 'bg-amber-500',
  mythic: 'bg-orange-500',
};

function getFrame(colors: string[]) {
  if (colors.length === 0) return FRAME_COLORS.colorless;
  if (colors.length > 1) return FRAME_COLORS.multi;
  return FRAME_COLORS[colors[0]] ?? FRAME_COLORS.colorless;
}

const SIZE_STYLES = {
  sm: { card: 'w-[180px]', art: 'h-[100px]', title: 'text-[10px]', body: 'text-[8px]', type: 'text-[8px]' },
  md: { card: 'w-[240px]', art: 'h-[130px]', title: 'text-xs', body: 'text-[9px]', type: 'text-[9px]' },
  lg: { card: 'w-[320px]', art: 'h-[175px]', title: 'text-sm', body: 'text-xs', type: 'text-xs' },
};

export default function MTGCard({
  card,
  revealed = true,
  className,
  size = 'lg',
  blurArt = false,
}: MTGCardProps) {
  const frame = getFrame(card.frameColor.map(c => String(c)));
  const sz = SIZE_STYLES[size];

  return (
    <motion.div
      className={cn(
        'relative rounded-xl border-2 shadow-2xl select-none font-serif',
        sz.card,
        frame.outer,
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Card inner padding */}
      <div className="m-1.5 rounded-lg overflow-hidden flex flex-col gap-0.5 bg-black/20">

        {/* Title bar */}
        <div className="flex items-center justify-between px-2 py-1 bg-black/30 rounded-t">
          <span className={cn('font-bold truncate flex-1 mr-1', sz.title, frame.title)}>
            {card.name}
          </span>
          <ManaCostDisplay manaCost={card.manaCost} size={size === 'sm' ? 'sm' : 'md'} />
        </div>

        {/* Art box */}
        <div className={cn('relative mx-1 rounded overflow-hidden', sz.art)}>
          {card.artworkUrl ? (
            <img
              src={card.artworkUrl}
              alt={card.name}
              className={cn('w-full h-full object-cover', blurArt && 'blur-md scale-110')}
            />
          ) : (
            <ArtPlaceholder card={card} />
          )}
          {/* Rarity gem */}
          <div className={cn(
            'absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white/50',
            RARITY_COLORS[card.rarity],
          )} />
        </div>

        {/* Type line */}
        <div className={cn('mx-1 px-2 py-0.5 bg-black/25 rounded flex items-center justify-between', sz.type, frame.title)}>
          <span className="font-semibold truncate">{card.type}</span>
          <span className="opacity-60 text-[8px] ml-1">{card.rarity.charAt(0).toUpperCase()}</span>
        </div>

        {/* Rules text box */}
        <div className={cn('mx-1 mb-1 rounded p-2 flex-1 min-h-[60px]', frame.inner)}>
          <p className={cn('whitespace-pre-wrap leading-snug', sz.body, frame.text)}>
            {renderOracleText(card.oracleText)}
          </p>
          {card.flavorText && (
            <p className={cn('mt-1 italic opacity-70 leading-snug border-t border-gray-300 pt-1', sz.body, frame.text)}>
              {card.flavorText}
            </p>
          )}
        </div>

        {/* P/T or Loyalty */}
        {(card.power !== undefined || card.loyalty !== undefined) && (
          <div className="flex justify-end mx-1 mb-1">
            {card.power !== undefined ? (
              <div className={cn(
                'bg-amber-100 border border-amber-400 rounded px-2 py-0.5 font-bold text-gray-900',
                sz.type,
              )}>
                {card.power}/{card.toughness}
              </div>
            ) : (
              <div className={cn(
                'bg-orange-400 border border-orange-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-white',
                sz.type,
              )}>
                {card.loyalty}
              </div>
            )}
          </div>
        )}

        {/* Collector info */}
        <div className="flex justify-between items-center px-2 pb-1 opacity-50">
          <span className={cn('text-[7px]', frame.title)}>FRACTUREDLE</span>
          <span className={cn('text-[7px]', frame.title)}>★ FAKE</span>
        </div>
      </div>
    </motion.div>
  );
}

function ArtPlaceholder({ card }: { card: FakeCard }) {
  const color = card.frameColor[0];
  const bg: Record<string, string> = {
    W: 'from-amber-100 to-yellow-200',
    U: 'from-blue-700 to-blue-900',
    B: 'from-gray-800 to-gray-950',
    R: 'from-red-600 to-orange-800',
    G: 'from-green-700 to-green-900',
    C: 'from-gray-500 to-gray-700',
  };
  return (
    <div className={cn(
      'w-full h-full flex items-center justify-center bg-gradient-to-b',
      bg[String(color)] ?? 'from-gray-600 to-gray-900',
    )}>
      <div className="text-center text-white/40 px-2">
        <div className="text-2xl mb-1">🃏</div>
        <div className="text-[9px] font-mono leading-tight">{card.artworkPrompt?.slice(0, 60) ?? 'Art pending'}</div>
      </div>
    </div>
  );
}

function renderOracleText(text: string): React.ReactNode {
  // Replace mana symbols with styled spans
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{([^}]+)\}$/);
    if (match) {
      return (
        <span key={i} className="inline-flex items-center align-middle mx-0.5">
          <ManaInline symbol={match[1]} />
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function ManaInline({ symbol }: { symbol: string }) {
  const styles: Record<string, string> = {
    W: 'bg-amber-100 text-amber-900',
    U: 'bg-blue-500 text-white',
    B: 'bg-gray-900 text-gray-100',
    R: 'bg-red-500 text-white',
    G: 'bg-green-600 text-white',
    T: 'bg-amber-700 text-white',
  };
  const num = parseInt(symbol);
  const style = !isNaN(num)
    ? 'bg-gray-500 text-white'
    : styles[symbol] ?? 'bg-gray-500 text-white';
  return (
    <span className={cn(
      'inline-flex items-center justify-center w-3 h-3 rounded-full text-[7px] font-bold border border-black/20',
      style,
    )}>
      {isNaN(num) ? symbol : symbol}
    </span>
  );
}
