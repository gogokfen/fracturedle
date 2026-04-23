import Link from 'next/link';
import { Archive, Lock, Clock } from 'lucide-react';
import { getPublishedPuzzles } from '@/lib/puzzles';
import { formatDate, getTodayString } from '@/lib/utils';
import { ManaCostDisplay } from '@/components/card/ManaSymbol';

export const metadata = { title: 'Archive — Fracturedle' };
export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  const puzzles = (await getPublishedPuzzles()).sort((a, b) => b.number - a.number);
  const today = getTodayString();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs uppercase tracking-widest">
          <Archive className="w-3.5 h-3.5" />
          Archive
        </div>
        <h1 className="text-2xl font-black text-white">Past Puzzles</h1>
        <p className="text-white/40 text-sm">Replay any previous Fracturedle. Stats are tracked separately from daily plays.</p>
      </div>

      <div className="space-y-2">
        {puzzles.map(puzzle => {
          const isPast = puzzle.date < today;
          const isToday = puzzle.date === today;
          const isFuture = puzzle.date > today;

          return (
            <div key={puzzle.id}>
              {isFuture ? (
                <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] opacity-50">
                  <Lock className="w-4 h-4 text-white/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/30 text-sm">Puzzle #{puzzle.number}</div>
                    <div className="text-white/20 text-xs">{formatDate(puzzle.date)} · Upcoming</div>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/archive/${puzzle.number}`}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="shrink-0">
                    {isToday ? (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 text-sm font-bold">
                        {puzzle.number}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm truncate">{puzzle.fakeCard.name}</span>
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20 shrink-0">Today</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        puzzle.difficulty === 'hard'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/20'
                          : 'bg-green-500/20 text-green-300 border border-green-500/20'
                      }`}>
                        {puzzle.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-white/30 text-xs">{formatDate(puzzle.date)}</span>
                      <span className="text-white/20">·</span>
                      <ManaCostDisplay manaCost={puzzle.fakeCard.manaCost} size="sm" />
                      <span className="text-white/20">·</span>
                      <span className="text-white/30 text-xs">{puzzle.fakeCard.type.split(' ')[0]}</span>
                    </div>
                  </div>
                  <div className="text-white/20 group-hover:text-white/50 transition-colors shrink-0">→</div>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {puzzles.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">🃏</div>
          <p>No puzzles yet. Come back soon!</p>
        </div>
      )}
    </div>
  );
}
