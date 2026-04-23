import { getDailyPuzzle } from '@/lib/puzzles';
import { getTodayString, formatDate } from '@/lib/utils';
import GameBoard from '@/components/game/GameBoard';
import NoPuzzleState from '@/components/game/NoPuzzleState';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const today = getTodayString();
  const puzzle = await getDailyPuzzle(today);

  if (!puzzle) {
    return <NoPuzzleState />;
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-xs text-white/30 uppercase tracking-widest">
          {formatDate(today)} · Puzzle #{puzzle.number}
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-white">
          What&apos;s the Real Card?
        </h1>
        <p className="text-sm text-white/50">
          This fractured card is the <em>opposite</em> of a real MTG card. Can you identify it?
        </p>
      </div>
      <GameBoard puzzle={puzzle} />
    </div>
  );
}
