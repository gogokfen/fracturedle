'use client';
import { BarChart2, Archive, Clock, CheckCircle, CalendarDays, Loader2 } from 'lucide-react';
import { usePuzzles } from '@/hooks/usePuzzles';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATE_STYLES: Record<string, string> = {
  published: 'text-green-300',
  scheduled: 'text-blue-300',
  draft:     'text-gray-400',
};

export default function AdminAnalytics() {
  const { puzzles, loading, error } = usePuzzles();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-white/30 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />Loading analytics…
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-sm p-4">{error}</div>;
  }

  const published  = puzzles.filter(p => p.state === 'published');
  const scheduled  = puzzles.filter(p => p.state === 'scheduled');
  const drafts     = puzzles.filter(p => p.state === 'draft');
  const easyCount  = puzzles.filter(p => p.difficulty === 'easy').length;
  const hardCount  = puzzles.filter(p => p.difficulty === 'hard').length;

  // Next scheduled date
  const nextScheduled = scheduled
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // Latest published
  const latestPublished = published
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-white">Analytics</h2>

      {/* State summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          icon={<CheckCircle className="w-5 h-5 text-green-400" />}
          value={published.length}
          label="Published"
          color="green"
        />
        <SummaryCard
          icon={<CalendarDays className="w-5 h-5 text-blue-400" />}
          value={scheduled.length}
          label="Scheduled"
          color="blue"
        />
        <SummaryCard
          icon={<Archive className="w-5 h-5 text-gray-400" />}
          value={drafts.length}
          label="Drafts"
          color="gray"
        />
      </div>

      {/* Difficulty split */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Difficulty Split</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Easy</span>
              <span className="text-white">{easyCount}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: puzzles.length ? `${(easyCount / puzzles.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Hard</span>
              <span className="text-white">{hardCount}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: puzzles.length ? `${(hardCount / puzzles.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-1">
          <div className="text-xs text-white/40 uppercase tracking-wider">Latest Published</div>
          {latestPublished ? (
            <>
              <div className="text-white font-semibold">{latestPublished.fakeCard.name}</div>
              <div className="text-white/40 text-xs">{formatDate(latestPublished.date)} · #{latestPublished.number}</div>
            </>
          ) : (
            <div className="text-white/30 text-sm">None yet</div>
          )}
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-1">
          <div className="text-xs text-white/40 uppercase tracking-wider">Next Up</div>
          {nextScheduled ? (
            <>
              <div className="text-white font-semibold">{nextScheduled.fakeCard.name}</div>
              <div className="text-white/40 text-xs">{formatDate(nextScheduled.date)} · #{nextScheduled.number}</div>
            </>
          ) : (
            <div className="text-white/30 text-sm">Nothing scheduled</div>
          )}
        </div>
      </div>

      {/* Puzzle list */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
          All Puzzles ({puzzles.length})
        </h3>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase">#</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase">Fake Card</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase hidden sm:table-cell">Real Card</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase">Date</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase">State</th>
              </tr>
            </thead>
            <tbody>
              {puzzles.map(p => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-white/60 font-mono">#{p.number}</td>
                  <td className="px-4 py-3 text-white font-medium truncate max-w-[120px]">{p.fakeCard.name}</td>
                  <td className="px-4 py-3 text-white/50 hidden sm:table-cell">{p.realCardName}</td>
                  <td className="px-4 py-3 text-white/50">{p.date}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium capitalize', STATE_STYLES[p.state] ?? 'text-white/40')}>
                      {p.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {puzzles.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">No puzzles yet.</div>
          )}
        </div>
      </div>

      {/* Player tracking note */}
      <div className="p-4 rounded-xl border border-dashed border-white/10 text-center space-y-1">
        <BarChart2 className="w-5 h-5 text-white/20 mx-auto" />
        <p className="text-xs text-white/30">Player analytics (solve rates, guess counts) require a game_plays tracking table in Supabase.</p>
        <p className="text-xs text-white/20">Add a <code className="text-white/40">game_plays</code> table to enable live player stats.</p>
      </div>
    </div>
  );
}

function SummaryCard({ icon, value, label, color }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'green' | 'blue' | 'gray';
}) {
  const border = { green: 'border-green-500/20', blue: 'border-blue-500/20', gray: 'border-white/10' }[color];
  return (
    <div className={cn('p-4 rounded-xl border bg-white/5 space-y-1', border)}>
      <div className="text-white/40">{icon}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </div>
  );
}
