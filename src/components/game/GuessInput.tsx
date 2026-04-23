'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';

interface GuessInputProps {
  onSubmit: (cardName: string) => void;
  disabled?: boolean;
  guessNumber: number;
}

export default function GuessInput({ onSubmit, disabled, guessNumber }: GuessInputProps) {
  const {
    currentInput, setInput,
    autocompleteResults, setAutocomplete,
    isSearching, setSearching,
  } = useGameStore();

  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setAutocomplete([]); return; }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setSearching(true);
    try {
      const res = await fetch(`/api/scryfall/autocomplete?q=${encodeURIComponent(q)}`, {
        signal: abortRef.current.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setAutocomplete(data.results ?? []);
      }
    } catch {
      // aborted or network error
    } finally {
      setSearching(false);
    }
  }, [setAutocomplete, setSearching]);

  useEffect(() => {
    const id = setTimeout(() => search(currentInput), 200);
    return () => clearTimeout(id);
  }, [currentInput, search]);

  const handleSelect = (name: string) => {
    setInput(name);
    setAutocomplete([]);
    setHighlighted(-1);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const val = currentInput.trim();
    if (!val) return;
    onSubmit(val);
    setInput('');
    setAutocomplete([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, autocompleteResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && autocompleteResults[highlighted]) {
        handleSelect(autocompleteResults[highlighted]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setAutocomplete([]);
      setHighlighted(-1);
    }
  };

  const showDropdown = focused && autocompleteResults.length > 0;

  return (
    <div className="w-full max-w-lg mx-auto">
      <label className="block text-xs text-white/50 mb-1 uppercase tracking-widest">
        Guess #{guessNumber}
      </label>
      <div className="relative">
        <div className={cn(
          'flex items-center gap-2 rounded-xl border-2 bg-white/5 backdrop-blur-sm transition-all px-3',
          focused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/20',
          disabled && 'opacity-50 cursor-not-allowed',
        )}>
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={e => { setInput(e.target.value); setHighlighted(-1); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            disabled={disabled}
            placeholder="Type a card name…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent py-3 text-white placeholder-white/30 outline-none text-sm"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-white/40 animate-spin shrink-0" />}
        </div>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute z-50 top-full mt-1 w-full rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              {autocompleteResults.map((name, i) => (
                <li key={name}>
                  <button
                    onMouseDown={() => handleSelect(name)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-colors',
                      i === highlighted
                        ? 'bg-blue-600 text-white'
                        : 'text-white/80 hover:bg-white/10',
                    )}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled || !currentInput.trim()}
        className={cn(
          'mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all',
          'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100',
        )}
      >
        Submit Guess
      </button>
    </div>
  );
}
