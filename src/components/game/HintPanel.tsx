'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Puzzle } from '@/types';

interface HintPanelProps {
  puzzle: Puzzle;
  revealedCount: number; // number of wrong guesses = hints revealed
}

export default function HintPanel({ puzzle, revealedCount }: HintPanelProps) {
  const { hints } = puzzle;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <span className="text-xs text-white/50 uppercase tracking-widest">Hints</span>
        <span className="text-xs text-white/30">({revealedCount}/{hints.length} revealed)</span>
      </div>
      <div className="space-y-2">
        {hints.map((hint, i) => (
          <HintItem
            key={i}
            hint={hint}
            index={i}
            revealed={i < revealedCount}
          />
        ))}
      </div>
    </div>
  );
}

function HintItem({ hint, index, revealed }: { hint: string; index: number; revealed: boolean }) {
  return (
    <motion.div
      layout
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border transition-all',
        revealed
          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-100'
          : 'bg-white/5 border-white/10 text-white/20',
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5',
        revealed ? 'bg-yellow-500/30 text-yellow-300' : 'bg-white/10 text-white/30',
      )}>
        {index + 1}
      </div>
      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="text-sm leading-snug"
          >
            {hint}
          </motion.p>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-3.5 h-3.5" />
            <span>Revealed after guess {index + 1}</span>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
