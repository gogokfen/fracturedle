import type { FakeCard, RealCard, GuessResult, CardColor } from '@/types';
import { cmcDiff } from './utils';

function colorOverlap(a: CardColor[], b: CardColor[]): number {
  const safeA = a ?? [];
  const safeB = b ?? [];
  const setA = new Set(safeA);
  const intersection = safeB.filter(c => setA.has(c)).length;
  const union = new Set([...safeA, ...safeB]).size;
  return union === 0 ? 1 : intersection / union;
}

function typeOverlap(realType: string, guessType: string): number {
  const extract = (t: string) => (t ?? '').split(/[\s—–-]+/).map(s => s.toLowerCase().trim());
  const a = new Set(extract(realType));
  const b = new Set(extract(guessType));
  const intersection = [...b].filter(w => a.has(w)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

function keywordOverlap(realText: string, guessText: string): number {
  const mtgKeywords = [
    'flying', 'trample', 'haste', 'vigilance', 'lifelink', 'deathtouch',
    'first strike', 'double strike', 'reach', 'hexproof', 'indestructible',
    'flash', 'menace', 'prowess', 'ward', 'protection', 'landwalk',
    'islandwalk', 'swampwalk', 'mountainwalk', 'forestwalk', 'shroud',
    'defender', 'unblockable', 'infect', 'wither', 'persist', 'undying',
    'cascade', 'convoke', 'delve', 'escape', 'foretell', 'kicker',
    'flashback', 'cycling', 'madness', 'morph', 'dash', 'crew',
    'equip', 'enchant', 'attach', 'sacrifice', 'exile', 'destroy',
    'draw', 'discard', 'counter', 'target', 'search', 'shuffle',
  ];
  const extract = (text: string) => new Set(
    mtgKeywords.filter(kw => text.toLowerCase().includes(kw))
  );
  const a = extract(realText ?? '');
  const b = extract(guessText ?? '');
  if (a.size === 0 && b.size === 0) return 0.5;
  const intersection = [...b].filter(kw => a.has(kw)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0.5 : intersection / union;
}

export function computeFractureScore(
  fakeCard: FakeCard,
  realCard: RealCard,
  guessedCard: RealCard,
): number {
  // Compare guessedCard against realCard
  const colorScore = colorOverlap(
    (realCard.colorIdentity ?? []) as CardColor[],
    (guessedCard.colorIdentity ?? []) as CardColor[],
  ) * 25;
  const cmcScore = (() => {
    if (realCard.cmc == null) return 0;
    const diff = cmcDiff(realCard.cmc, guessedCard.cmc);
    if (diff === 'exact') return 25;
    if (diff === 'close') return 12;
    return 0;
  })();
  const typeScore = typeOverlap(realCard.type ?? '', guessedCard.type ?? '') * 25;
  const keywordScore = keywordOverlap(realCard.oracleText ?? '', guessedCard.oracleText ?? '') * 25;
  return Math.round(colorScore + cmcScore + typeScore + keywordScore);
}

export function buildGuessResult(
  guessName: string,
  isCorrect: boolean,
  hint: string,
  fakeCard: FakeCard,
  realCard: RealCard,
  guessedCard: RealCard,
): GuessResult {
  const colorOverlapVal = colorOverlap(
    (realCard.colorIdentity ?? []) as CardColor[],
    (guessedCard.colorIdentity ?? []) as CardColor[],
  );
  const cmcMatchVal = realCard.cmc != null ? cmcDiff(realCard.cmc, guessedCard.cmc) : 'far';
  const typeOverlapVal = typeOverlap(realCard.type ?? '', guessedCard.type ?? '');
  const kwOverlapVal = keywordOverlap(realCard.oracleText ?? '', guessedCard.oracleText ?? '');

  return {
    guessName,
    isCorrect,
    hintRevealed: hint,
    fractureScore: computeFractureScore(fakeCard, realCard, guessedCard),
    colorMatch: colorOverlapVal === 1 ? 'exact' : colorOverlapVal > 0 ? 'partial' : 'none',
    cmcMatch: cmcMatchVal,
    typeMatch: typeOverlapVal >= 0.8 ? 'exact' : typeOverlapVal > 0 ? 'partial' : 'none',
    keywordMatch: kwOverlapVal >= 0.8 ? 'exact' : kwOverlapVal > 0.2 ? 'partial' : 'none',
    rarityMatch: realCard.rarity === guessedCard.rarity,
  };
}

export function getFractureLevel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 90) return { label: 'Shattered', color: '#ef4444', description: 'Almost identical!' };
  if (score >= 70) return { label: 'Fractured', color: '#f97316', description: 'Very close match' };
  if (score >= 50) return { label: 'Cracked', color: '#eab308', description: 'Some similarities' };
  if (score >= 25) return { label: 'Chipped', color: '#3b82f6', description: 'Barely related' };
  return { label: 'Intact', color: '#6b7280', description: 'No match' };
}
