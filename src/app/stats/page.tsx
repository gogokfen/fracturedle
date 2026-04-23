'use client';
import { useEffect, useState } from 'react';
import { BarChart2, Trophy, Flame, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadStats } from '@/lib/storage';
import type { PlayerStats } from '@/types';

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  if (!stats) return <LoadingState />;

  const winRate = stats.totalPlayed > 0
    ? Math.round((stats.totalWon / stats.totalPlayed) * 100)
    : 0;

  const maxGuessCount = Math.max(...Object.values(stats.guessDistribution), 1);

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs uppercase tracking-widest">
          <BarChart2 className="w-3.5 h-3.5" />
          Statistics
        </div>
        <h1 className="text-2xl font-black text-white">Your Stats</h1>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<BarChart2 className="w-5 h-5" />} value={stats.totalPlayed} label="Played" />
        <StatCard icon={<Trophy className="w-5 h-5 text-yellow-400" />} value={`${winRate}%`} label="Win Rate" />
        <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} value={stats.currentStreak} label="Streak" />
        <StatCard icon={<Target className="w-5 h-5 text-blue-400" />} value={stats.maxStreak} label="Max Streak" />
      </div>

      {/* Average */}
      {stats.totalWon > 0 && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/10 bg-white/5">
          <TrendingUp className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <div className="text-white font-bold text-lg">{stats.averageGuesses.toFixed(1)}</div>
            <div className="text-white/40 text-xs">Average guesses per win</div>
          </div>
        </div>
      )}

      {/* Guess distribution */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Guess Distribution</h2>
        <div className="space-y-2">
          {['1', '2', '3', '4', '5', 'X'].map(key => {
            const count = stats.guessDistribution[key] ?? 0;
            const width = maxGuessCount > 0 ? Math.max((count / maxGuessCount) * 100, count > 0 ? 8 : 0) : 0;
            return (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className={cn(
                  'w-5 text-right font-bold shrink-0',
                  key === 'X' ? 'text-red-400' : 'text-white/70',
                )}>
                  {key}
                </span>
                <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500',
                      key === 'X' ? 'bg-red-500/60' : 'bg-blue-500/60',
                    )}
                    style={{ width: `${width}%` }}
                  >
                    {count > 0 && (
                      <span className="text-xs font-bold text-white">{count}</span>
                    )}
                  </div>
                </div>
                {count === 0 && <span className="text-white/20 text-xs w-4">0</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* No data state */}
      {stats.totalPlayed === 0 && (
        <div className="text-center py-8 text-white/30">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm">Play your first puzzle to see stats here!</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="text-white/40">{icon}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-white/40 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white/30 text-sm animate-pulse">Loading stats…</div>
    </div>
  );
}
