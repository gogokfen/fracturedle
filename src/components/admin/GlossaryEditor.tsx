'use client';
import { useState } from 'react';
import { Plus, Edit3, Trash2, BookOpen, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import glossaryData from '@/data/glossary.json';
import type { GlossaryEntry } from '@/types';

const CATEGORY_STYLES: Record<string, string> = {
  keyword: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  mechanic: 'bg-purple-500/20 text-purple-300 border-purple-500/20',
  action: 'bg-amber-500/20 text-amber-300 border-amber-500/20',
  stat: 'bg-green-500/20 text-green-300 border-green-500/20',
  zone: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
};

export default function GlossaryEditor() {
  const [entries, setEntries] = useState<GlossaryEntry[]>(glossaryData as GlossaryEntry[]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<GlossaryEntry | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<GlossaryEntry>>({
    original: '', opposite: '', category: 'action',
  });

  const filtered = entries.filter(e =>
    e.original.toLowerCase().includes(search.toLowerCase()) ||
    e.opposite.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (!newEntry.original || !newEntry.opposite) return;
    const entry: GlossaryEntry = {
      id: `g${Date.now()}`,
      original: newEntry.original!,
      opposite: newEntry.opposite!,
      category: newEntry.category ?? 'action',
    };
    setEntries(prev => [...prev, entry]);
    setNewEntry({ original: '', opposite: '', category: 'action' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          Opposites Glossary
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Entry
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
        <Search className="w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms…"
          className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
        />
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
          <h3 className="text-sm font-semibold text-white">New Entry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 block mb-1">Original Term</label>
              <input
                value={newEntry.original ?? ''}
                onChange={e => setNewEntry(p => ({ ...p, original: e.target.value }))}
                placeholder="Draw"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1">Opposite</label>
              <input
                value={newEntry.opposite ?? ''}
                onChange={e => setNewEntry(p => ({ ...p, opposite: e.target.value }))}
                placeholder="Discard"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">Category</label>
            <select
              value={newEntry.category}
              onChange={e => setNewEntry(p => ({ ...p, category: e.target.value as GlossaryEntry['category'] }))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
            >
              {(['keyword', 'mechanic', 'action', 'stat', 'zone'] as const).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleAdd} className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500 transition-all">
              Add
            </button>
          </div>
        </div>
      )}

      {/* Entries table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase">Original</th>
              <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase">Opposite</th>
              <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase hidden sm:table-cell">Category</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => (
              <tr key={entry.id} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-3 text-white font-medium">{entry.original}</td>
                <td className="px-4 py-3 text-white/60 italic">{entry.opposite}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full border',
                    CATEGORY_STYLES[entry.category] ?? 'bg-white/10 text-white/40',
                  )}>
                    {entry.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded text-white/20 hover:text-white/60 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded text-red-400/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">No entries found.</div>
        )}
      </div>

      <p className="text-xs text-white/20 text-center">
        {entries.length} entries total · Changes are local only (connect to a database to persist)
      </p>
    </div>
  );
}
