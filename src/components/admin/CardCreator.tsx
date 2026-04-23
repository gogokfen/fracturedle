'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Save, Eye, Loader2, Wand2, Calendar, ImageIcon, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MTGCard from '@/components/card/MTGCard';
import { ManaCostDisplay } from '@/components/card/ManaSymbol';
import type { FakeCard, RealCard, CardColor, Rarity, Puzzle, DifficultyMode } from '@/types';

const EMPTY_FAKE: FakeCard = {
  id: 'preview',
  name: '',
  manaCost: '',
  cmc: 0,
  colors: [],
  colorIdentity: [],
  type: 'Instant',
  oracleText: '',
  flavorText: '',
  rarity: 'common',
  frameColor: [],
};

function parseManaColors(cost: string): CardColor[] {
  const map: Record<string, CardColor> = { W: 'W', U: 'U', B: 'B', R: 'R', G: 'G' };
  const matches = cost.match(/\{([WUBRG])\}/g) ?? [];
  return [...new Set(matches.map(m => map[m.slice(1, -1)]))] as CardColor[];
}

function computeCmc(cost: string): number {
  const matches = cost.match(/\{([^}]+)\}/g) ?? [];
  return matches.reduce((sum, m) => {
    const s = m.slice(1, -1);
    const n = parseInt(s);
    if (!isNaN(n)) return sum + n;
    if (s === 'X') return sum;
    return sum + 1;
  }, 0);
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 outline-none focus:border-blue-500/50 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function CardCreator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [realCard, setRealCard] = useState<RealCard | null>(null);
  const [fake, setFake] = useState<FakeCard>({ ...EMPTY_FAKE });
  const [hints, setHints] = useState<string[]>(['', '', '', '', '']);
  const [scheduleDate, setScheduleDate] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyMode>('easy');
  const [artworkPrompt, setArtworkPrompt] = useState('');
  const [savedPuzzleId, setSavedPuzzleId] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [artStatus, setArtStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const searchRealCard = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/scryfall/autocomplete?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results ?? []);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => searchRealCard(searchQuery), 200);
    return () => clearTimeout(id);
  }, [searchQuery, searchRealCard]);

  const loadRealCard = async (name: string) => {
    setSearchQuery(name);
    setSearchResults([]);
    const res = await fetch(`/api/scryfall/card?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    if (data.card) {
      const card = data.card as RealCard;
      setRealCard(card);
      setFake(prev => ({
        ...prev,
        type: card.type,
        rarity: card.rarity,
        frameColor: card.colorIdentity as CardColor[],
        colors: card.colorIdentity as CardColor[],
        colorIdentity: card.colorIdentity as CardColor[],
        cmc: card.cmc,
        manaCost: card.manaCost,
      }));
      setArtworkPrompt(`A Magic card artwork showing ${name.toLowerCase()}'s opposite — ${card.oracleText.slice(0, 80)}`);
    }
  };

  const updateFake = (field: keyof FakeCard, value: unknown) => {
    setFake(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'manaCost') {
        const cost = value as string;
        updated.colors = parseManaColors(cost);
        updated.colorIdentity = parseManaColors(cost);
        updated.frameColor = parseManaColors(cost);
        updated.cmc = computeCmc(cost);
      }
      return updated;
    });
  };

  const autoSuggestOpposite = () => {
    if (!realCard) return;
    let text = realCard.oracleText ?? '';
    const replacements: [RegExp, string][] = [
      [/draw (\d+) cards?/gi, 'discard $1 cards'],
      [/draw a card/gi, 'discard a card'],
      [/gain (\d+) life/gi, 'lose $1 life'],
      [/destroy target/gi, 'create a copy of target'],
      [/exile target/gi, 'return target permanent from exile to its owner\'s hand'],
      [/counter target/gi, 'copy target'],
      [/search your library/gi, 'shuffle your hand into your library'],
      [/\+1\/\+1 counter/gi, '-1/-1 counter'],
      [/\btap\b/gi, 'untap'],
      [/\bFlying\b/gi, 'Cannot block creatures with flying'],
      [/\bHaste\b/gi, 'This creature does not untap during your untap step'],
      [/\bLifelink\b/gi, 'Whenever this creature deals damage, you lose that much life'],
    ];
    for (const [rx, rep] of replacements) text = text.replace(rx, rep);
    updateFake('oracleText', text);
    if (!fake.name) updateFake('name', `Un${realCard.name.split(' ')[0]}`);
    setArtworkPrompt(`Fantasy magic card art: the opposite of ${realCard.name} — ${text.slice(0, 100)}`);
  };

  const handleSave = async (state: 'draft' | 'scheduled') => {
    if (!realCard) { setStatusMsg('Select a real card first.'); return; }
    if (!fake.name) { setStatusMsg('Enter a fake card name.'); return; }

    setSaveStatus('saving');
    setStatusMsg('');

    const puzzleId = savedPuzzleId ?? `puzzle_${Date.now()}`;
    const puzzle: Puzzle = {
      id: puzzleId,
      number: Date.now() % 100000, // curator can fix via scheduler
      date: scheduleDate || new Date().toISOString().split('T')[0],
      fakeCard: { ...fake, id: puzzleId + '_fake', artworkPrompt },
      realCardName: realCard.name,
      realCardScryfallId: realCard.scryfallId,
      difficulty,
      state,
      hints: hints.filter(Boolean),
      createdAt: new Date().toISOString(),
      publishedAt: undefined,
    };

    try {
      const res = await fetch('/api/admin/puzzles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(puzzle),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      setSavedPuzzleId(puzzleId);
      setSaveStatus('saved');
      setStatusMsg(state === 'draft' ? 'Saved to draft vault.' : 'Puzzle scheduled!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleGenerateArt = async () => {
    if (!artworkPrompt) { setStatusMsg('Add an artwork prompt first.'); return; }
    if (!savedPuzzleId) { setStatusMsg('Save the puzzle as a draft first, then generate art.'); return; }

    setArtStatus('generating');
    setStatusMsg('');
    try {
      const res = await fetch('/api/artwork/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzleId: savedPuzzleId, prompt: artworkPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      updateFake('artworkUrl', data.artworkUrl);
      setArtStatus('done');
      setStatusMsg('Artwork generated and saved!');
    } catch (err) {
      setArtStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Art generation failed');
    }
  };

  const preview: FakeCard = {
    ...fake,
    name: fake.name || 'Card Name',
    oracleText: fake.oracleText || 'Oracle text goes here.',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Left: Form ── */}
      <div className="space-y-5">
        <h2 className="text-base font-bold text-white">Real Card Source</h2>

        {/* Real card search */}
        <div className="relative">
          <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Search Real Card</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Counterspell, Lightning Bolt…"
              className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
            />
            {isSearching && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
          </div>
          {searchResults.length > 0 && (
            <ul className="absolute z-20 top-full mt-1 w-full rounded-xl border border-white/10 bg-gray-900/95 shadow-xl overflow-hidden">
              {searchResults.map(name => (
                <li key={name}>
                  <button
                    onMouseDown={() => loadRealCard(name)}
                    className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Real card strip */}
        {realCard && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            {realCard.imageUrl && (
              <img src={realCard.imageUrl} alt={realCard.name} className="w-10 h-14 rounded object-cover" />
            )}
            <div>
              <div className="text-white font-semibold text-sm">{realCard.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ManaCostDisplay manaCost={realCard.manaCost} size="sm" />
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/40 text-xs truncate max-w-[160px]">{realCard.type}</span>
              </div>
            </div>
          </div>
        )}

        {/* Fake card fields */}
        <div className="border-t border-white/10 pt-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-white">Fake Card Fields</h2>
            {realCard && (
              <button onClick={autoSuggestOpposite} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                <Wand2 className="w-3.5 h-3.5" />
                Auto-suggest
              </button>
            )}
          </div>

          <Field label="Fake Name">
            <input value={fake.name} onChange={e => updateFake('name', e.target.value)} placeholder="Echospell" className={inputCls} />
          </Field>

          <Field label="Mana Cost (e.g. {2}{U}{U})">
            <input value={fake.manaCost} onChange={e => updateFake('manaCost', e.target.value)} placeholder="{2}{U}{U}" className={inputCls} />
          </Field>

          <Field label="Type Line">
            <input value={fake.type} onChange={e => updateFake('type', e.target.value)} placeholder="Instant" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Rarity">
              <select value={fake.rarity} onChange={e => updateFake('rarity', e.target.value as Rarity)} className={inputCls}>
                {(['common', 'uncommon', 'rare', 'mythic'] as Rarity[]).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Difficulty">
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as DifficultyMode)} className={inputCls}>
                <option value="easy">Easy</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
          </div>

          <Field label="Oracle Text">
            <textarea value={fake.oracleText} onChange={e => updateFake('oracleText', e.target.value)} rows={4} placeholder="Copy target spell…" className={cn(inputCls, 'resize-none')} />
          </Field>

          <Field label="Flavor Text (optional)">
            <textarea value={fake.flavorText ?? ''} onChange={e => updateFake('flavorText', e.target.value)} rows={2} placeholder="Italic flavor text…" className={cn(inputCls, 'resize-none italic')} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Power">
              <input value={fake.power ?? ''} onChange={e => updateFake('power', e.target.value)} placeholder="—" className={inputCls} />
            </Field>
            <Field label="Toughness">
              <input value={fake.toughness ?? ''} onChange={e => updateFake('toughness', e.target.value)} placeholder="—" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Hints */}
        <div className="border-t border-white/10 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Hints</h3>
            <span className="text-xs text-white/30">Revealed one per wrong guess</span>
          </div>
          {hints.map((hint, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-white/30 w-4 shrink-0">{i + 1}</span>
              <input
                value={hint}
                onChange={e => { const h = [...hints]; h[i] = e.target.value; setHints(h); }}
                placeholder={`Hint ${i + 1}…`}
                className={cn(inputCls, 'flex-1')}
              />
            </div>
          ))}
        </div>

        {/* Schedule + artwork */}
        <div className="border-t border-white/10 pt-5 space-y-3">
          <Field label="Schedule Date">
            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className={inputCls} />
          </Field>

          <Field label="Artwork Prompt (for DALL-E)">
            <textarea value={artworkPrompt} onChange={e => setArtworkPrompt(e.target.value)} rows={3} placeholder="A red-robed mage copying a spell…" className={cn(inputCls, 'resize-none')} />
          </Field>

          <button
            onClick={handleGenerateArt}
            disabled={artStatus === 'generating' || !artworkPrompt || !savedPuzzleId}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {artStatus === 'generating' ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Generating with DALL-E…</>
            ) : artStatus === 'done' ? (
              <><Check className="w-4 h-4 text-green-400" />Art Generated</>
            ) : (
              <><ImageIcon className="w-4 h-4" />Generate Artwork</>
            )}
          </button>
          {!savedPuzzleId && artworkPrompt && (
            <p className="text-xs text-white/30 text-center">Save as draft first to enable art generation</p>
          )}
        </div>

        {/* Status message */}
        {statusMsg && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
            saveStatus === 'error' || artStatus === 'error'
              ? 'bg-red-500/10 text-red-300 border border-red-500/20'
              : 'bg-green-500/10 text-green-300 border border-green-500/20',
          )}>
            {saveStatus === 'error' || artStatus === 'error'
              ? <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              : <Check className="w-3.5 h-3.5 shrink-0" />}
            {statusMsg}
          </div>
        )}

        {/* Save buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saveStatus === 'saving'}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all disabled:opacity-40"
          >
            {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave('scheduled')}
            disabled={saveStatus === 'saving' || !realCard || !scheduleDate}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium transition-all"
            title={!scheduleDate ? 'Set a schedule date first' : ''}
          >
            {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            {saveStatus === 'saved' ? 'Scheduled!' : 'Schedule'}
          </button>
        </div>
      </div>

      {/* ── Right: Live preview ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Live Preview</h2>
          <button onClick={() => setShowPreview(s => !s)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            <Eye className="w-3.5 h-3.5" />
            {showPreview ? 'Hide' : 'Show'}
          </button>
        </div>

        {showPreview && (
          <div className="flex justify-center">
            <MTGCard card={preview} size="lg" />
          </div>
        )}

        {fake.manaCost && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">CMC</span>
              <span className="text-white font-mono">{fake.cmc}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40">Colors</span>
              <ManaCostDisplay manaCost={fake.manaCost} size="sm" />
            </div>
            {savedPuzzleId && (
              <div className="flex justify-between items-center pt-1 border-t border-white/10">
                <span className="text-white/40">Puzzle ID</span>
                <span className="text-white/60 font-mono text-xs truncate max-w-[160px]">{savedPuzzleId}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
