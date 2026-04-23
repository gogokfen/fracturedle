'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shareEmojiGrid, formatDate } from '@/lib/utils';
import type { GameState } from '@/types';

interface ResultShareProps {
  game: GameState;
  onClose?: () => void;
}

export default function ResultShare({ game, onClose }: ResultShareProps) {
  const [copied, setCopied] = useState(false);

  const emojiGrid = game.guesses.map(g => ({
    isCorrect: g.isCorrect,
    fractureScore: g.fractureScore,
  }));
  const emojiStr = shareEmojiGrid(emojiGrid);
  const guessCount = game.isWon ? game.guesses.length : 'X';
  const dateStr = formatDate(game.date);

  const shareText = [
    `Fracturedle #${game.puzzleNumber} (${dateStr})`,
    '',
    ...game.guesses.map(g => shareEmojiGrid([{ isCorrect: g.isCorrect, fractureScore: g.fractureScore }])),
    '',
    game.isWon ? `Solved in ${guessCount}/5` : 'Better luck next time!',
    'https://fracturedle.com',
  ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleNativeShare = async () => {
    if (!navigator.share) { handleCopy(); return; }
    try {
      await navigator.share({ title: 'Fracturedle', text: shareText });
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      {/* Result headline */}
      <div>
        <div className={cn(
          'text-4xl font-black mb-1',
          game.isWon ? 'text-green-400' : 'text-red-400',
        )}>
          {game.isWon ? '🎉 Solved!' : '💀 Failed'}
        </div>
        <p className="text-white/60 text-sm">
          {game.isWon
            ? `You found it in ${guessCount} guess${guessCount === 1 ? '' : 'es'}!`
            : `The card was: ${game.realCardName}`}
        </p>
      </div>

      {/* Emoji grid preview */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="text-sm font-mono space-y-1 text-center">
          <p className="text-white/70 font-semibold text-base">Fracturedle #{game.puzzleNumber}</p>
          <p className="text-white/40 text-xs">{dateStr}</p>
          <div className="mt-3 text-2xl tracking-widest">
            {game.guesses.map((g, i) => (
              <span key={i}>
                {g.isCorrect ? '🟩' : g.fractureScore >= 70 ? '🟨' : '⬜'}
              </span>
            ))}
          </div>
          <p className="text-white/50 text-xs mt-2">
            {game.isWon ? `${guessCount}/5` : 'X/5'} · fracturedle.com
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
            copied
              ? 'bg-green-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white',
          )}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        )}
      </div>

      {onClose && (
        <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors underline">
          View compare →
        </button>
      )}
    </motion.div>
  );
}
