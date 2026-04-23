'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { buildGuessResult } from '@/lib/fracture';
import type { Puzzle, RealCard } from '@/types';
import MTGCard from '@/components/card/MTGCard';
import GuessInput from './GuessInput';
import FractureMeter from './FractureMeter';
import HintPanel from './HintPanel';
import CompareView from './CompareView';
import ResultShare from './ResultShare';

interface GameBoardProps {
  puzzle: Puzzle;
}

export default function GameBoard({ puzzle }: GameBoardProps) {
  const {
    game, initGame, submitGuess,
    showCompare, setShowCompare,
  } = useGameStore();

  const [realCard, setRealCard] = useState<RealCard | null>(null);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'game' | 'compare'>('game');

  useEffect(() => { initGame(puzzle); }, [puzzle, initGame]);

  // Load real card when game is complete
  useEffect(() => {
    if (!game?.isComplete || realCard) return;
    setIsLoadingReal(true);
    fetch(`/api/scryfall/card?name=${encodeURIComponent(puzzle.realCardName)}`)
      .then(r => r.json())
      .then(d => { if (d.card) setRealCard(d.card); })
      .catch(() => {})
      .finally(() => setIsLoadingReal(false));
  }, [game?.isComplete, puzzle.realCardName, realCard]);

  const handleGuess = useCallback(async (name: string) => {
    if (!game || game.isComplete) return;
    setError(null);
    try {
      const res = await fetch(`/api/scryfall/card?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (!data.card) {
        setError(`"${name}" not found. Please check the spelling.`);
        return;
      }
      const guessedCard: RealCard = data.card;
      const isCorrect = guessedCard.name.toLowerCase() === puzzle.realCardName.toLowerCase();
      const hintIndex = game.guesses.length;
      const hint = puzzle.hints[hintIndex] ?? '';
      const result = buildGuessResult(
        guessedCard.name,
        isCorrect,
        hint,
        game.fakeCard,
        { name: puzzle.realCardName } as RealCard, // lightweight; fracture uses full card via API
        guessedCard,
      );
      submitGuess(guessedCard.name, result);
      if (isCorrect) setRealCard(guessedCard);
    } catch {
      setError('Failed to look up card. Try again.');
    }
  }, [game, puzzle, submitGuess]);

  if (!game) return <LoadingState />;

  const wrongGuessCount = game.guesses.filter(g => !g.isCorrect).length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Fake card display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <MTGCard card={puzzle.fakeCard} size="lg" />
      </motion.div>

      {/* Game complete: tabs for game view / compare */}
      {game.isComplete ? (
        <div>
          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
            {(['game', 'compare'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                  tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70',
                )}
              >
                {t === 'game' ? 'Result' : 'Compare'}
              </button>
            ))}
          </div>

          {tab === 'game' ? (
            <div className="space-y-6">
              <ResultShare game={game} onClose={() => setTab('compare')} />
              <FractureMeter guesses={game.guesses} maxGuesses={game.maxGuesses} />
            </div>
          ) : (
            <CompareView
              fakeCard={puzzle.fakeCard}
              realCard={realCard}
              isLoading={isLoadingReal}
            />
          )}
        </div>
      ) : (
        /* Active game */
        <div className="space-y-6">
          {/* Guess input */}
          <div>
            <GuessInput
              onSubmit={handleGuess}
              guessNumber={game.guesses.length + 1}
              disabled={game.isComplete}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 text-center text-xs text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Progress + fracture meter */}
          {game.guesses.length > 0 && (
            <FractureMeter guesses={game.guesses} maxGuesses={game.maxGuesses} />
          )}

          {/* Remaining guesses indicator */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: game.maxGuesses }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  i < game.guesses.length
                    ? game.guesses[i].isCorrect ? 'bg-green-400' : 'bg-red-400'
                    : 'bg-white/20',
                )}
              />
            ))}
            <span className="text-xs text-white/30 ml-2">
              {game.maxGuesses - game.guesses.length} left
            </span>
          </div>

          {/* Hints */}
          {wrongGuessCount > 0 && (
            <HintPanel puzzle={puzzle} revealedCount={wrongGuessCount} />
          )}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white/30 text-sm animate-pulse">Loading puzzle…</div>
    </div>
  );
}
