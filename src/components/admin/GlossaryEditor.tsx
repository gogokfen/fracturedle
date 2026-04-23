'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Search, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RealCard } from '@/types';

const MTG_KEYWORDS: { term: string; category: string }[] = [
  { term: 'Flying',        category: 'keyword' },
  { term: 'Trample',       category: 'keyword' },
  { term: 'Haste',         category: 'keyword' },
  { term: 'Vigilance',     category: 'keyword' },
  { term: 'Lifelink',      category: 'keyword' },
  { term: 'Deathtouch',    category: 'keyword' },
  { term: 'First strike',  category: 'keyword' },
  { term: 'Double strike', category: 'keyword' },
  { term: 'Reach',         category: 'keyword' },
  { term: 'Hexproof',      category: 'keyword' },
  { term: 'Indestructible',category: 'keyword' },
  { term: 'Flash',         category: 'keyword' },
  { term: 'Menace',        category: 'keyword' },
  { term: 'Prowess',       category: 'keyword' },
  { term: 'Ward',          category: 'keyword' },
  { term: 'Defender',      category: 'keyword' },
  { term: 'Protection',    category: 'keyword' },
  { term: 'Shroud',        category: 'keyword' },
  { term: 'Infect',        category: 'keyword' },
  { term: 'Persist',       category: 'keyword' },
  { term: 'Undying',       category: 'keyword' },
  { term: 'Flashback',     category: 'mechanic' },
  { term: 'Cycling',       category: 'mechanic' },
  { term: 'Kicker',        category: 'mechanic' },
  { term: 'Cascade',       category: 'mechanic' },
  { term: 'Convoke',       category: 'mechanic' },
  { term: 'Delve',         category: 'mechanic' },
  { term: 'Escape',        category: 'mechanic' },
  { term: 'Foretell',      category: 'mechanic' },
  { term: 'Morph',         category: 'mechanic' },
  { term: 'Madness',       category: 'mechanic' },
  { term: 'Draw a card',   category: 'action' },
  { term: 'Discard',       category: 'action' },
  { term: 'Exile',         category: 'action' },
  { term: 'Destroy target',category: 'action' },
  { term: 'Counter target',category: 'action' },
  { term: 'Tap',           category: 'action' },
  { term: 'Untap',         category: 'action' },
  { term: 'Sacrifice',     category: 'action' },
  { term: 'Search your library', category: 'action' },
  { term: 'Gain life',     category: 'action' },
  { term: 'Lose life',     category: 'action' },
  { term: '+1/+1 counter', category: 'stat' },
  { term: '-1/-1 counter', category: 'stat' },
  { term: 'Hand',          category: 'zone' },
  { term: 'Library',       category: 'zone' },
  { term: 'Graveyard',     category: 'zone' },
  { term: 'Battlefield',   category: 'zone' },
  { term: 'Stack',         category: 'zone' },
];

const STORAGE_KEY = 'fracturedle_glossary_v1';

const CATEGORY_STYLES: Record<string, string> = {
  keyword:  'bg-blue-500/20 text-blue-300 border-blue-500/20',
  mechanic: 'bg-purple-500/20 text-purple-300 border-purple-500/20',
  action:   'bg-amber-500/20 text-amber-300 border-amber-500/20',
  stat:     'bg-green-500/20 text-green-300 border-green-500/20',
  zone:     'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
};

function loadTranslations(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export default function GlossaryEditor() {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'translated' | 'missing'>('all');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);

  // Candidate card finder
  const [findQuery, setFindQuery] = useState('');
  const [findLoading, setFindLoading] = useState(false);
  const [candidateCards, setCandidateCards] = useState<RealCard[]>([]);
  const [findError, setFindError] = useState<string | null>(null);

  useEffect(() => {
    setTranslations(loadTranslations());
  }, []);

  const setTranslation = (term: string, value: string) => {
    setTranslations(prev => ({ ...prev, [term]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(translations));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const translatedTerms = MTG_KEYWORDS.filter(k => translations[k.term]?.trim());
  const translatedCount = translatedTerms.length;

  const visible = MTG_KEYWORDS.filter(k => {
    const matchesSearch = !search ||
      k.term.toLowerCase().includes(search.toLowerCase()) ||
      (translations[k.term] ?? '').toLowerCase().includes(search.toLowerCase());
    const hasTranslation = !!translations[k.term]?.trim();
    const matchesFilter = filter === 'all' || (filter === 'translated' && hasTranslation) || (filter === 'missing' && !hasTranslation);
    return matchesSearch && matchesFilter;
  });

  // Build Scryfall query from translated keywords — uses o: oracle text search
  const buildQuery = () => {
    if (translatedTerms.length === 0) return '';
    // Search for cards that contain at least one of the translated keywords
    const terms = translatedTerms.slice(0, 6); // limit to avoid too-long queries
    return terms.map(k => `o:"${k.term.toLowerCase()}"`).join(' OR ');
  };

  const handleFindCards = async () => {
    const q = findQuery.trim() || buildQuery();
    if (!q) {
      setFindError('Translate at least one keyword first, or enter a custom Scryfall query.');
      return;
    }
    setFindLoading(true);
    setFindError(null);
    setCandidateCards([]);
    try {
      const res = await fetch(`/api/scryfall/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error('Search failed');
      setCandidateCards(data.cards ?? []);
      if ((data.cards ?? []).length === 0) setFindError('No cards found. Try different keywords.');
    } catch (e) {
      setFindError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setFindLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          Fracture Glossary
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">{translatedCount}/{MTG_KEYWORDS.length} translated</span>
          <button
            onClick={handleSave}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white',
            )}
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      <p className="text-xs text-white/40">
        Translate each MTG keyword to its "fracture" opposite. Once enough are translated,
        use <span className="text-white/70">Find Candidate Cards</span> below to discover cards that use these keywords — those cards are perfect puzzle answers since their fake version can be auto-generated.
      </p>

      {/* Filters + search */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
          {(['all','translated','missing'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-all capitalize',
                filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[160px] px-3 py-1.5 rounded-xl border border-white/10 bg-white/5">
          <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter keywords…"
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
          />
        </div>
      </div>

      {/* Keyword table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase">MTG Term</th>
              <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase">Fracture Opposite</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {visible.map(k => (
              <tr key={k.term} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-2.5 text-white font-medium text-sm">{k.term}</td>
                <td className="px-4 py-2.5 hidden sm:table-cell">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border', CATEGORY_STYLES[k.category])}>
                    {k.category}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <input
                    value={translations[k.term] ?? ''}
                    onChange={e => setTranslation(k.term, e.target.value)}
                    placeholder="Enter opposite…"
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </td>
                <td className="px-2 py-2.5 text-center">
                  {translations[k.term]?.trim() && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">No keywords match your filter.</div>
        )}
      </div>

      {/* Card Finder section */}
      <div className="border-t border-white/10 pt-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Find Candidate Cards</h3>
          <p className="text-xs text-white/40">
            Searches Scryfall for cards using your translated keywords.
            Cards found here are good puzzle candidates — their oracle text can be
            automatically fractured using your translations above.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/40 block">Custom Scryfall query (optional — leave blank to use translated keywords)</label>
          <div className="flex gap-2">
            <input
              value={findQuery}
              onChange={e => setFindQuery(e.target.value)}
              placeholder={translatedCount > 0 ? `Auto: ${buildQuery().slice(0, 60)}…` : 'e.g. o:flying o:trample'}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors"
            />
            <button
              onClick={handleFindCards}
              disabled={findLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all disabled:opacity-40"
            >
              {findLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Find Cards
            </button>
          </div>
        </div>

        {findError && <p className="text-xs text-red-400">{findError}</p>}

        {candidateCards.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/40">{candidateCards.length} candidates found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {candidateCards.map(card => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  {card.imageUrl && (
                    <img src={card.imageUrl} alt={card.name} className="w-8 h-11 rounded object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{card.name}</div>
                    <div className="text-white/40 text-xs truncate">{card.type}</div>
                    <div className="text-white/30 text-xs">{card.manaCost} · {card.rarity}</div>
                  </div>
                  <a
                    href={`https://scryfall.com/card/${card.setCode}/${card.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-white/20 hover:text-white/60 transition-colors shrink-0"
                    title="Open on Scryfall"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-white/20 text-center">
        Translations are saved in your browser. {translatedCount} of {MTG_KEYWORDS.length} keywords translated.
      </p>
    </div>
  );
}
