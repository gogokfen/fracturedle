import { notFound } from 'next/navigation';
import { getPuzzleByNumber, getPublishedPuzzles } from '@/lib/puzzles';
import { formatDate } from '@/lib/utils';
import GameBoard from '@/components/game/GameBoard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
  const puzzles = await getPublishedPuzzles();
  return puzzles.map(p => ({ number: String(p.number) }));
}

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const puzzle = await getPuzzleByNumber(parseInt(number));
  if (!puzzle) return { title: 'Not Found' };
  return { title: `Puzzle #${puzzle.number} — Fracturedle` };
}

export default async function ArchivePuzzlePage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const puzzle = await getPuzzleByNumber(parseInt(number));
  if (!puzzle) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/archive" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">Puzzle #{puzzle.number}</h1>
          <p className="text-white/40 text-xs">{formatDate(puzzle.date)}</p>
        </div>
        <span className={`ml-auto text-xs px-2.5 py-1 rounded-full border ${
          puzzle.difficulty === 'hard'
            ? 'bg-red-500/20 text-red-300 border-red-500/20'
            : 'bg-green-500/20 text-green-300 border-green-500/20'
        }`}>
          {puzzle.difficulty}
        </span>
      </div>
      <GameBoard puzzle={puzzle} />
    </div>
  );
}
