'use client';
import { useState } from 'react';
import { Archive, Tag, Copy, Trash2, Eye } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import puzzlesData from '@/data/puzzles.json';
import type { Puzzle } from '@/types';
import MTGCard from '@/components/card/MTGCard';
import Modal from '@/components/ui/Modal';

export default function DraftVault() {
  const drafts = (puzzlesData as Puzzle[]).filter(p => p.state === 'draft');
  const [preview, setPreview] = useState<Puzzle | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Draft Vault</h2>
        <span className="text-xs text-white/30">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12 text-white/30 border border-dashed border-white/10 rounded-2xl">
          <Archive className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No drafts yet. Create a card and save as draft.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(puzzle => (
            <div
              key={puzzle.id}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{puzzle.fakeCard.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/20">
                      draft
                    </span>
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

              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(puzzle)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 transition-all ml-auto">
                  Schedule →
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}
