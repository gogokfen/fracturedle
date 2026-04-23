'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getFractureLevel } from '@/lib/fracture';
import type { GuessResult } from '@/types';

interface FractureMeterProps {
  guesses: GuessResult[];
  maxGuesses: number;
}

export default function FractureMeter({ guesses, maxGuesses }: FractureMeterProps) {
  const latestScore = guesses.length > 0 ? guesses[guesses.length - 1].fractureScore : 0;
  const level = getFractureLevel(latestScore);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50 uppercase tracking-widest">Fracture Meter</span>
        <span className="text-xs font-semibold" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>

      {/* Main progress bar */}
      <div className="relative h-4 rounded-full bg-white/10 overflow-hidden border border-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #3b82f6, ${level.color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${latestScore}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Segmented markers */}
        {[25, 50, 75].map(pct => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: `${pct}%` }}
          />
        ))}
      </div>

      {/* Score + description */}
      {guesses.length > 0 && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-white/40">{level.description}</span>
          <span className="text-xs font-mono text-white/60">{latestScore}/100</span>
        </div>
      )}

      {/* Per-guess history */}
      {guesses.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {guesses.map((g, i) => (
            <GuessRow key={i} guess={g} index={i} />
          ))}
          {/* Empty slots */}
          {Array.from({ length: maxGuesses - guesses.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-8 rounded-lg border border-dashed border-white/10"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GuessRow({ guess, index }: { guess: GuessResult; index: number }) {
  const level = getFractureLevel(guess.fractureScore);
  const delay = index * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border',
        guess.isCorrect
          ? 'bg-green-500/20 border-green-500/40 text-green-300'
          : 'bg-white/5 border-white/10 text-white/70',
      )}
    >
      {/* Guess number */}
      <span className="text-white/30 w-4 shrink-0 font-mono">{index + 1}</span>

      {/* Card name */}
      <span className="flex-1 truncate font-medium">{guess.guessName}</span>

      {/* Attribute indicators */}
      <div className="flex items-center gap-1 shrink-0">
        <AttributeDot label="Color" match={guess.colorMatch} />
        <AttributeDot label="CMC" match={guess.cmcMatch === 'exact' ? 'exact' : guess.cmcMatch === 'close' ? 'partial' : 'none'} />
        <AttributeDot label="Type" match={guess.typeMatch} />
        <AttributeDot label="Keywords" match={guess.keywordMatch} />
      </div>

      {/* Score badge */}
      <span
        className="font-bold w-8 text-right font-mono shrink-0"
        style={{ color: level.color }}
      >
        {guess.fractureScore}
      </span>

      {/* Win indicator */}
      {guess.isCorrect && <span className="text-green-400">✓</span>}
    </motion.div>
  );
}

function AttributeDot({ label, match }: { label: string; match: 'exact' | 'partial' | 'none' }) {
  const colors = {
    exact: 'bg-green-400',
    partial: 'bg-yellow-400',
    none: 'bg-gray-600',
  };
  return (
    <div
      className={cn('w-2 h-2 rounded-full', colors[match])}
      title={`${label}: ${match}`}
    />
  );
}
