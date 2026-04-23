'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shareEmojiGrid, formatDate } from '@/lib/utils';
import type { GameState } from '@/types';

function secondsUntilIsraelMidnight(): number {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const h = parseInt(parts.find(p => p.type === 'hour')!.value);
  const m = parseInt(parts.find(p => p.type === 'minute')!.value);
  const s = parseInt(parts.find(p => p.type === 'second')!.value);
  return 86400 - (h * 3600 + m * 60 + s);
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface ResultShareProps {
  game: GameState;
  onClose?: () => void;
}

export default function ResultShare({ game, onClose }: ResultShareProps) {
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(secondsUntilIsraelMidnight);

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft(secondsUntilIsraelMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

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

      {/* Next puzzle countdown */}
      <div className="py-3 px-4 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
        <p className="text-xs text-white/40 uppercase tracking-wider">Next puzzle</p>
        <p className="text-3xl font-mono font-black text-white tracking-tight">
          {formatCountdown(secondsLeft)}
        </p>
        <p className="text-xs text-white/25">Resets at midnight Israel time</p>
      </div>

      {onClose && (
        <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors underline">
          View compare →
        </button>
      )}
    </motion.div>
  );
}
