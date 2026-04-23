'use client';
import { useState } from 'react';
import { Archive, Tag, Copy, Trash2, Eye, Calendar, Loader2, Check } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { usePuzzles } from '@/hooks/usePuzzles';
import type { Puzzle } from '@/types';
import MTGCard from '@/components/card/MTGCard';
import Modal from '@/components/ui/Modal';

export default function DraftVault() {
  const { puzzles, loading, reload } = usePuzzles();
  const drafts = puzzles.filter(p => p.state === 'draft');

  const [preview, setPreview] = useState<Puzzle | null>(null);
  const [scheduling, setScheduling] = useState<Puzzle | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (puzzle: Puzzle) => {
    if (!confirm(`Delete "${puzzle.fakeCard.name}"?`)) return;
    setActionLoading(puzzle.id + ':delete');
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/puzzles?id=${encodeURIComponent(puzzle.id)}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Delete failed'); }
      await reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (puzzle: Puzzle) => {
    setActionLoading(puzzle.id + ':dup');
    setActionError(null);
    try {
      const copy: Puzzle = {
        ...puzzle,
        id: `puzzle_${Date.now()}`,
        fakeCard: { ...puzzle.fakeCard, id: `puzzle_${Date.now()}_fake` },
        number: Date.now() % 100000,
        state: 'draft',
        createdAt: new Date().toISOString(),
        publishedAt: undefined,
      };
      const res = await fetch('/api/admin/puzzles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Duplicate failed'); }
      await reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Duplicate failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSchedule = async () => {
    if (!scheduling || !scheduleDate) return;
    const conflict = puzzles.find(p => p.date === scheduleDate && p.id !== scheduling.id);
    if (conflict) {
      setActionError(`"${conflict.fakeCard.name}" is already on ${scheduleDate}. Pick a different date.`);
      return;
    }
    setActionLoading(scheduling.id + ':schedule');
    setActionError(null);
    try {
      const updated: Puzzle = { ...scheduling, state: 'scheduled', date: scheduleDate };
      const res = await fetch('/api/admin/puzzles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Schedule failed'); }
      setScheduling(null);
      setScheduleDate('');
      await reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Schedule failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-white/30 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />Loading drafts…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Draft Vault</h2>
        <span className="text-xs text-white/30">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
      </div>

      {actionError && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {actionError}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="text-center py-12 text-white/30 border border-dashed border-white/10 rounded-2xl">
          <Archive className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No drafts yet. Create a card and save as draft.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(puzzle => (
            <div key={puzzle.id} className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{puzzle.fakeCard.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/20">draft</span>
                    {puzzle.tags?.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    Real: <span className="text-white/60">{puzzle.realCardName}</span>
                    {' · '}Created {formatDate(puzzle.createdAt.split('T')[0])}
                  </p>
                  {puzzle.curatorNotes && (
                    <p className="text-xs text-white/30 mt-1 italic">{puzzle.curatorNotes}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setPreview(puzzle)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />Preview
                </button>
                <button
                  onClick={() => handleDuplicate(puzzle)}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all disabled:opacity-40"
                >
                  {actionLoading === puzzle.id + ':dup'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Copy className="w-3.5 h-3.5" />}
                  Duplicate
                </button>
                <button
                  onClick={() => { setScheduling(puzzle); setScheduleDate(''); setActionError(null); }}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 transition-all ml-auto disabled:opacity-40"
                >
                  {actionLoading === puzzle.id + ':schedule'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Calendar className="w-3.5 h-3.5" />}
                  Schedule
                </button>
                <button
                  onClick={() => handleDelete(puzzle)}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all disabled:opacity-40"
                >
                  {actionLoading === puzzle.id + ':delete'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Card Preview" size="sm">
        {preview && (
          <div className="flex justify-center">
            <MTGCard card={preview.fakeCard} size="md" />
          </div>
        )}
      </Modal>

      {/* Schedule modal */}
      <Modal open={!!scheduling} onClose={() => { setScheduling(null); setActionError(null); }} title="Schedule Puzzle" size="sm">
        {scheduling && (
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              Schedule <span className="text-white font-semibold">{scheduling.fakeCard.name}</span> (real: {scheduling.realCardName})
            </p>
            <div>
              <label className="text-xs text-white/40 block mb-1">Publish Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            {actionError && <p className="text-xs text-red-400">{actionError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setScheduling(null)} className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!scheduleDate || !!actionLoading}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-40"
              >
                {actionLoading === scheduling.id + ':schedule'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Check className="w-3.5 h-3.5" />}
                Confirm Schedule
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
