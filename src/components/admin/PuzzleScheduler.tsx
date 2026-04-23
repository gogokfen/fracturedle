'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Check, X, Loader2, Trash2 } from 'lucide-react';
import { cn, formatDate, getTodayString } from '@/lib/utils';
import { usePuzzles } from '@/hooks/usePuzzles';
import type { Puzzle, PuzzleState, DifficultyMode } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  published:  'bg-green-500/20 text-green-300 border-green-500/20',
  scheduled:  'bg-blue-500/20 text-blue-300 border-blue-500/20',
  draft:      'bg-gray-500/20 text-gray-400 border-gray-500/20',
};

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500/50 transition-colors';

interface EditState {
  puzzleId: string;
  date: string;
  number: number;
  state: PuzzleState;
  difficulty: DifficultyMode;
}

export default function PuzzleScheduler() {
  const { puzzles, loading, reload } = usePuzzles();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [y, m] = getTodayString().split('-').map(Number);
    return new Date(y, m - 1, 1);
  });
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const monthStr = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const puzzlesByDate = Object.fromEntries(puzzles.map(p => [p.date, p]));

  const startEdit = (p: Puzzle) => {
    setEditing({ puzzleId: p.id, date: p.date, number: p.number, state: p.state, difficulty: p.difficulty });
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const puzzle = puzzles.find(p => p.id === editing.puzzleId);
    if (!puzzle) return;

    // Client-side date conflict check
    const conflict = puzzles.find(p => p.date === editing.date && p.id !== editing.puzzleId);
    if (conflict) {
      setSaveError(`"${conflict.fakeCard.name}" is already on ${editing.date}. Pick a different date.`);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const updated: Puzzle = {
        ...puzzle,
        date: editing.date,
        number: editing.number,
        state: editing.state,
        difficulty: editing.difficulty,
        publishedAt: editing.state === 'published' ? (puzzle.publishedAt ?? new Date().toISOString()) : puzzle.publishedAt,
      };
      const res = await fetch('/api/admin/puzzles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      setEditing(null);
      await reload();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this puzzle permanently?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/puzzles?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await reload();
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-white/30 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />Loading puzzles…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-white">Puzzle Calendar</h2>

      {/* Calendar */}
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
        <div className="grid grid-cols-7 border-b border-white/5">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-xs text-white/30 py-2 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`e${i}`} className="h-16 border-r border-b border-white/5" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const puzzle  = puzzlesByDate[dateStr];
            const isToday = dateStr === getTodayString();
            return (
              <div
                key={day}
                className={cn(
                  'h-16 p-1.5 border-r border-b border-white/5 relative',
                  (i + firstDayOfWeek) % 7 === 6 && 'border-r-0',
                )}
              >
                <span className={cn('text-xs font-medium', isToday ? 'text-blue-400' : 'text-white/50', puzzle && 'text-white')}>
                  {day}
                </span>
                {puzzle && (
                  <div className={cn('mt-0.5 text-[9px] px-1 py-0.5 rounded truncate border', STATUS_STYLES[puzzle.state])}>
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
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
          All Puzzles ({puzzles.length})
        </h3>
        <div className="space-y-2">
          {puzzles.map(p => (
            <div key={p.id}>
              <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors">
                <div className="text-center w-8 shrink-0">
                  <div className="text-xs font-bold text-white">#{p.number}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{p.fakeCard.name}</div>
                  <div className="text-xs text-white/40">{formatDate(p.date)} → {p.realCardName}</div>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', STATUS_STYLES[p.state])}>
                  {p.state}
                </span>
                <button
                  onClick={() => editing?.puzzleId === p.id ? setEditing(null) : startEdit(p)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/10 transition-all"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="p-1.5 rounded-lg text-red-400/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete"
                >
                  {deleting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Inline edit panel */}
              {editing?.puzzleId === p.id && (
                <div className="mt-1 mb-2 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Date</label>
                      <input
                        type="date"
                        value={editing.date}
                        onChange={e => setEditing(s => s && ({ ...s, date: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Puzzle #</label>
                      <input
                        type="number"
                        value={editing.number}
                        onChange={e => setEditing(s => s && ({ ...s, number: parseInt(e.target.value) || 0 }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 block mb-1">State</label>
                      <select
                        value={editing.state}
                        onChange={e => setEditing(s => s && ({ ...s, state: e.target.value as PuzzleState }))}
                        className={inputCls}
                      >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Difficulty</label>
                      <select
                        value={editing.difficulty}
                        onChange={e => setEditing(s => s && ({ ...s, difficulty: e.target.value as DifficultyMode }))}
                        className={inputCls}
                      >
                        <option value="easy">Easy</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  {saveError && <p className="text-xs text-red-400">{saveError}</p>}
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white transition-colors">
                      <X className="w-3.5 h-3.5" />Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {puzzles.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
              No puzzles yet. Create one in the Create Card tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
