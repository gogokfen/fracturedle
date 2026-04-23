'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FakeCard, RealCard } from '@/types';
import MTGCard from '@/components/card/MTGCard';
import { ManaCostDisplay } from '@/components/card/ManaSymbol';

interface CompareViewProps {
  fakeCard: FakeCard;
  realCard: RealCard | null;
  isLoading?: boolean;
}

interface DiffRow {
  label: string;
  fake: string;
  real: string;
  different: boolean;
}

function buildDiff(fake: FakeCard, real: RealCard): DiffRow[] {
  return [
    { label: 'Name', fake: fake.name, real: real.name, different: fake.name !== real.name },
    { label: 'Mana Cost', fake: fake.manaCost, real: real.manaCost, different: fake.manaCost !== real.manaCost },
    { label: 'CMC', fake: String(fake.cmc), real: String(real.cmc), different: fake.cmc !== real.cmc },
    { label: 'Colors', fake: fake.colors.join('') || 'Colorless', real: real.colors.join('') || 'Colorless', different: JSON.stringify(fake.colors) !== JSON.stringify(real.colors) },
    { label: 'Type', fake: fake.type, real: real.type, different: fake.type !== real.type },
    { label: 'Rarity', fake: fake.rarity, real: real.rarity, different: fake.rarity !== real.rarity },
  ];
}

export default function CompareView({ fakeCard, realCard, isLoading }: CompareViewProps) {
  const [showDiff, setShowDiff] = useState(true);
  const [realCardFull, setRealCardFull] = useState<RealCard | null>(realCard);

  useEffect(() => {
    if (realCard) setRealCardFull(realCard);
  }, [realCard]);

  const diff = realCardFull ? buildDiff(fakeCard, realCardFull) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Card Compare</h2>
        </div>
        <button
          onClick={() => setShowDiff(s => !s)}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          {showDiff ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showDiff ? 'Hide' : 'Show'} differences
        </button>
      </div>

      {/* Cards side by side */}
      <div className="flex flex-col sm:flex-row gap-6 items-start justify-center">
        {/* Fake card */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-red-400/80 uppercase tracking-widest font-semibold">Fractured</span>
          <MTGCard card={fakeCard} size="md" />
        </div>

        <div className="flex items-center justify-center self-center">
          <div className="text-white/20 text-2xl hidden sm:block">⇄</div>
        </div>

        {/* Real card */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-green-400/80 uppercase tracking-widest font-semibold">Real Card</span>
          {isLoading ? (
            <RealCardSkeleton />
          ) : realCardFull ? (
            <RealCardDisplay card={realCardFull} />
          ) : (
            <div className="w-[240px] h-[340px] rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/30 text-sm">
              Card not found
            </div>
          )}
        </div>
      </div>

      {/* Diff table */}
      {showDiff && diff.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-8 overflow-hidden"
        >
          <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Differences</h3>
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-white/40 text-xs uppercase">
                  <th className="text-left px-4 py-2">Attribute</th>
                  <th className="text-left px-4 py-2 text-red-400">Fractured</th>
                  <th className="text-left px-4 py-2 text-green-400">Real</th>
                </tr>
              </thead>
              <tbody>
                {diff.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn(
                      'border-t border-white/5',
                      row.different && 'bg-yellow-500/5',
                    )}
                  >
                    <td className="px-4 py-2 text-white/50 font-medium">{row.label}</td>
                    <td className={cn('px-4 py-2', row.different ? 'text-red-300' : 'text-white/70')}>
                      {row.label === 'Mana Cost' ? (
                        <ManaCostDisplay manaCost={row.fake} size="sm" />
                      ) : row.fake}
                    </td>
                    <td className={cn('px-4 py-2', row.different ? 'text-green-300' : 'text-white/70')}>
                      {row.label === 'Mana Cost' ? (
                        <ManaCostDisplay manaCost={row.real} size="sm" />
                      ) : row.real}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function RealCardDisplay({ card }: { card: RealCard }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-[240px] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-gray-900"
    >
      {card.imageUrl ? (
        <img src={card.imageUrl} alt={card.name} className="w-full" />
      ) : (
        <div className="p-4 text-white/70 space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-bold">{card.name}</span>
            <ManaCostDisplay manaCost={card.manaCost} size="sm" />
          </div>
          <p className="text-xs text-white/50">{card.type}</p>
          <p className="text-xs leading-snug">{card.oracleText}</p>
        </div>
      )}
    </motion.div>
  );
}

function RealCardSkeleton() {
  return (
    <div className="w-[240px] h-[340px] rounded-xl border border-white/10 bg-white/5 animate-pulse flex items-center justify-center">
      <span className="text-white/20 text-sm">Loading card…</span>
    </div>
  );
}
