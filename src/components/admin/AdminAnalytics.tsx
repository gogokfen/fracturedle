'use client';
import { BarChart2, Users, Target, TrendingUp, Clock } from 'lucide-react';
import puzzlesData from '@/data/puzzles.json';
import type { Puzzle } from '@/types';

// Mock analytics data — in production this would come from a database
const MOCK_ANALYTICS = [
  { puzzleNumber: 1, date: '2026-04-23', players: 1247, solveRate: 78, avgGuesses: 2.9, dropRate: 8 },
  { puzzleNumber: 2, date: '2026-04-24', players: 1183, solveRate: 84, avgGuesses: 2.4, dropRate: 5 },
  { puzzleNumber: 3, date: '2026-04-25', players: 1098, solveRate: 61, avgGuesses: 3.8, dropRate: 12 },
];

export default function AdminAnalytics() {
  const puzzles = puzzlesData as Puzzle[];
  const publishedCount = puzzles.filter(p => p.state === 'published').length;
  const scheduledCount = puzzles.filter(p => p.state === 'scheduled').length;
  const draftCount = puzzles.filter(p => p.state === 'draft').length;

  const totalPlayers = MOCK_ANALYTICS.reduce((s, a) => s + a.players, 0);
  const avgSolveRate = MOCK_ANALYTICS.length > 0
    ? Math.round(MOCK_ANALYTICS.reduce((s, a) => s + a.solveRate, 0) / MOCK_ANALYTICS.length)
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-white">Analytics Overview</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={<Users className="w-5 h-5 text-blue-400" />} value={totalPlayers.toLocaleString()} label="Total Players" />
        <SummaryCard icon={<Target className="w-5 h-5 text-green-400" />} value={`${avgSolveRate}%`} label="Avg Solve Rate" />
        <SummaryCard icon={<BarChart2 className="w-5 h-5 text-purple-400" />} value={publishedCount} label="Published" />
        <SummaryCard icon={<Clock className="w-5 h-5 text-amber-400" />} value={scheduledCount + draftCount} label="In Queue" />
      </div>

      {/* Per-puzzle table */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Per Puzzle</h3>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase">#</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase">Date</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-medium uppercase">Players</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-medium uppercase">Solve %</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-medium uppercase hidden sm:table-cell">Avg Guesses</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-medium uppercase hidden sm:table-cell">Drop %</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ANALYTICS.map((row, i) => (
                <tr key={row.puzzleNumber} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-white/60 font-mono">#{row.puzzleNumber}</td>
                  <td className="px-4 py-3 text-white/60">{row.date}</td>
                  <td className="px-4 py-3 text-right text-white">{row.players.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={row.solveRate >= 70 ? 'text-green-400' : row.solveRate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                      {row.solveRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/60 hidden sm:table-cell">{row.avgGuesses}</td>
                  <td className="px-4 py-3 text-right text-white/40 hidden sm:table-cell">{row.dropRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guess distribution summary */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Puzzle States</h3>
        <div className="flex gap-3">
          {[
            { label: 'Published', count: publishedCount, color: 'bg-green-500' },
            { label: 'Scheduled', count: scheduledCount, color: 'bg-blue-500' },
            { label: 'Draft', count: draftCount, color: 'bg-gray-500' },
          ].map(item => (
            <div key={item.label} className="flex-1 p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-2 ${item.color}`} />
              <div className="text-xl font-black text-white">{item.count}</div>
              <div className="text-xs text-white/40">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/20 text-center">
        Analytics are mocked. Connect to a real database (Supabase/Firebase) to see live data.
      </p>
    </div>
  );
}

function SummaryCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-1">
      <div className="text-white/40">{icon}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </div>
  );
}
