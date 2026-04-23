'use client';
import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle, Edit3 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import puzzlesData from '@/data/puzzles.json';
import type { Puzzle } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-500/20 text-green-300 border-green-500/20',
  scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
};

export default function PuzzleScheduler() {
  const puzzles = puzzlesData as Puzzle[];
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const monthStr = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const puzzlesByDate = Object.fromEntries(
    puzzles.map(p => [p.date, p])
  );

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-white">Puzzle Calendar</h2>

      {/* Calendar header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <button onClick={prevMonth} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-white">{monthStr}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs text-white/30 py-2 font-medium">{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 border-r border-b border-white/5" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const puzzle = puzzlesByDate[dateStr];
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day}
                className={cn(
                  'h-16 p-1.5 border-r border-b border-white/5 relative cursor-pointer hover:bg-white/5 transition-colors',
                  (i + firstDayOfWeek) % 7 === 6 && 'border-r-0',
                )}
              >
                <span className={cn(
                  'text-xs font-medium',
                  isToday ? 'text-blue-400' : 'text-white/50',
                  puzzle && 'text-white',
                )}>
                  {day}
                </span>
                {puzzle && (
                  <div className={cn(
                    'mt-0.5 text-[9px] px-1 py-0.5 rounded truncate border',
                    STATUS_STYLES[puzzle.state],
                  )}>
                    #{puzzle.number} {puzzle.fakeCard.name.slice(0, 8)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Puzzle list */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">All Puzzles</h3>
        <div className="space-y-2">
          {puzzles.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="text-center w-8 shrink-0">
                <div className="text-xs font-bold text-white">#{p.number}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{p.fakeCard.name}</div>
                <div className="text-xs text-white/40">{formatDate(p.date)} → {p.realCardName}</div>
              </div>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full border shrink-0',
                STATUS_STYLES[p.state],
              )}>
                {p.state}
              </span>
              <button className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/10 transition-all">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
