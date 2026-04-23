'use client';
import { create } from 'zustand';
import type {
  GameState, GuessResult, FakeCard, Puzzle,
  PlayerStats, AppSettings, Theme,
} from '@/types';
import {
  saveGameState, loadGameState, loadStats, saveStats,
  loadSettings, saveSettings, updateStatsAfterGame, DEFAULT_SETTINGS,
} from '@/lib/storage';
import { getTodayString } from '@/lib/utils';

interface GameStore {
  // Current game
  game: GameState | null;
  puzzle: Puzzle | null;
  isLoading: boolean;
  error: string | null;

  // UI state
  showCompare: boolean;
  showShare: boolean;
  showHowToPlay: boolean;
  showStats: boolean;
  currentInput: string;
  autocompleteResults: string[];
  isSearching: boolean;

  // Settings & stats
  settings: AppSettings;
  stats: PlayerStats | null;

  // Actions
  initGame: (puzzle: Puzzle) => void;
  submitGuess: (guessName: string, guessResult: GuessResult) => void;
  setInput: (val: string) => void;
  setAutocomplete: (results: string[]) => void;
  setSearching: (val: boolean) => void;
  setShowCompare: (val: boolean) => void;
  setShowShare: (val: boolean) => void;
  setShowHowToPlay: (val: boolean) => void;
  setShowStats: (val: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  loadPersistedGame: (date?: string) => void;
  setTheme: (theme: Theme) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  puzzle: null,
  isLoading: false,
  error: null,
  showCompare: false,
  showShare: false,
  showHowToPlay: false,
  showStats: false,
  currentInput: '',
  autocompleteResults: [],
  isSearching: false,
  settings: DEFAULT_SETTINGS,
  stats: null,

  initGame: (puzzle) => {
    const date = puzzle.date;
    const existing = loadGameState(date);
    if (existing && existing.puzzleId === puzzle.id) {
      set({ game: existing, puzzle, showCompare: existing.isComplete });
      return;
    }
    const newGame: GameState = {
      puzzleId: puzzle.id,
      puzzleNumber: puzzle.number,
      date: puzzle.date,
      fakeCard: puzzle.fakeCard,
      realCardName: puzzle.realCardName,
      guesses: [],
      maxGuesses: 5,
      isComplete: false,
      isWon: false,
      startTime: Date.now(),
      difficulty: puzzle.difficulty,
    };
    saveGameState(newGame);
    set({ game: newGame, puzzle, showCompare: false });
  },

  submitGuess: (guessName, guessResult) => {
    const { game, puzzle } = get();
    if (!game || !puzzle || game.isComplete) return;
    const guesses = [...game.guesses, guessResult];
    const isWon = guessResult.isCorrect;
    const isComplete = isWon || guesses.length >= game.maxGuesses;
    const updated: GameState = {
      ...game,
      guesses,
      isComplete,
      isWon,
      endTime: isComplete ? Date.now() : undefined,
    };
    saveGameState(updated);
    if (isComplete) {
      const stats = updateStatsAfterGame(isWon, guesses.length, game.date);
      set({ game: updated, stats, showCompare: true });
    } else {
      set({ game: updated });
    }
  },

  setInput: (val) => set({ currentInput: val }),
  setAutocomplete: (results) => set({ autocompleteResults: results }),
  setSearching: (val) => set({ isSearching: val }),
  setShowCompare: (val) => set({ showCompare: val }),
  setShowShare: (val) => set({ showShare: val }),
  setShowHowToPlay: (val) => set({ showHowToPlay: val }),
  setShowStats: (val) => set({ showStats: val }),

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    saveSettings(settings);
    set({ settings });
  },

  setTheme: (theme) => {
    const settings = { ...get().settings, theme };
    saveSettings(settings);
    set({ settings });
  },

  loadPersistedGame: (date) => {
    const settings = loadSettings();
    const stats = loadStats();
    const existing = loadGameState(date ?? getTodayString());
    set({ settings, stats, game: existing });
  },
}));
