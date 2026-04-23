import type { GameState, PlayerStats, AppSettings } from '@/types';

const KEYS = {
  GAME_STATE: 'fracturedle_game_',
  STATS: 'fracturedle_stats',
  SETTINGS: 'fracturedle_settings',
} as const;

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function saveGameState(state: GameState): void {
  safeSet(KEYS.GAME_STATE + state.date, state);
}

export function loadGameState(date: string): GameState | null {
  return safeGet<GameState>(KEYS.GAME_STATE + date);
}

export const DEFAULT_STATS: PlayerStats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, X: 0 },
  averageGuesses: 0,
};

export function loadStats(): PlayerStats {
  return safeGet<PlayerStats>(KEYS.STATS) ?? { ...DEFAULT_STATS };
}

export function saveStats(stats: PlayerStats): void {
  safeSet(KEYS.STATS, stats);
}

export function updateStatsAfterGame(won: boolean, guessCount: number, date: string): PlayerStats {
  const stats = loadStats();
  stats.totalPlayed += 1;
  if (won) {
    stats.totalWon += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    const key = String(guessCount);
    stats.guessDistribution[key] = (stats.guessDistribution[key] ?? 0) + 1;
  } else {
    stats.currentStreak = 0;
    stats.guessDistribution['X'] = (stats.guessDistribution['X'] ?? 0) + 1;
  }
  const totalGuesses = Object.entries(stats.guessDistribution)
    .filter(([k]) => k !== 'X')
    .reduce((sum, [k, v]) => sum + parseInt(k) * v, 0);
  stats.averageGuesses = stats.totalWon > 0 ? totalGuesses / stats.totalWon : 0;
  stats.lastPlayedDate = date;
  saveStats(stats);
  return stats;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  difficulty: 'easy',
  reducedMotion: false,
};

export function loadSettings(): AppSettings {
  return safeGet<AppSettings>(KEYS.SETTINGS) ?? { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}
