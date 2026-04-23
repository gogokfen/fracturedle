import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CardColor, ManaCost } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseManaCost(manaCost: string): ManaCost {
  const matches = manaCost.match(/\{([^}]+)\}/g) || [];
  const symbols = matches.map(m => m.slice(1, -1));
  const cmc = symbols.reduce((sum, s) => {
    const n = parseInt(s);
    if (!isNaN(n)) return sum + n;
    if (s === 'X') return sum;
    return sum + 1;
  }, 0);
  return { symbols, cmc };
}

export function getCardColors(manaCost: string): CardColor[] {
  const colorMap: Record<string, CardColor> = { W: 'W', U: 'U', B: 'B', R: 'R', G: 'G' };
  const matches = manaCost.match(/\{([WUBRG])\}/g) || [];
  const colors = new Set(matches.map(m => colorMap[m.slice(1, -1)]));
  return Array.from(colors);
}

export function colorToFrameGradient(colors: CardColor[]): string {
  if (colors.length === 0) return 'from-gray-400 to-gray-600'; // colorless
  if (colors.length > 2) return 'from-yellow-300 via-yellow-500 to-amber-600'; // gold
  const gradients: Record<CardColor, string> = {
    W: 'from-amber-50 via-gray-100 to-amber-200',
    U: 'from-blue-400 via-blue-600 to-blue-800',
    B: 'from-gray-700 via-gray-900 to-black',
    R: 'from-red-400 via-red-600 to-red-800',
    G: 'from-green-400 via-green-600 to-green-800',
    C: 'from-gray-400 to-gray-600',
  };
  if (colors.length === 1) return gradients[colors[0]];
  // Two-color split
  return 'from-yellow-300 to-amber-500';
}

export function colorToTextColor(colors: CardColor[]): string {
  if (colors.length === 0) return 'text-gray-800';
  if (colors.length > 1) return 'text-gray-900';
  const map: Record<CardColor, string> = {
    W: 'text-gray-900',
    U: 'text-white',
    B: 'text-gray-100',
    R: 'text-white',
    G: 'text-white',
    C: 'text-gray-800',
  };
  return map[colors[0]];
}

export function rarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common: '#1a1a1a',
    uncommon: '#a0a0b0',
    rare: '#c8a530',
    mythic: '#e07730',
  };
  return map[rarity] ?? '#1a1a1a';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getTodayString(): string {
  // Always use Israel timezone so the puzzle resets at midnight Israel time (IDT/IST)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date());
}

export function puzzleNumberFromDate(dateStr: string): number {
  const epoch = new Date('2026-04-23');
  const target = new Date(dateStr + 'T00:00:00Z');
  const diff = Math.floor((target.getTime() - epoch.getTime()) / 86400000);
  return diff + 1;
}

export function cmcDiff(a: number, b: number): 'exact' | 'close' | 'far' {
  const diff = Math.abs(a - b);
  if (diff === 0) return 'exact';
  if (diff <= 2) return 'close';
  return 'far';
}

export function shareEmojiGrid(guesses: { isCorrect: boolean; fractureScore: number }[]): string {
  return guesses.map(g => {
    if (g.isCorrect) return '🟩';
    if (g.fractureScore >= 70) return '🟨';
    return '⬜';
  }).join('');
}
