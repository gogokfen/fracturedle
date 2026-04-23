export type MTGColor = 'W' | 'U' | 'B' | 'R' | 'G';
export type MTGColorless = 'C';
export type CardColor = MTGColor | MTGColorless;

export type CardType =
  | 'Creature'
  | 'Instant'
  | 'Sorcery'
  | 'Enchantment'
  | 'Artifact'
  | 'Planeswalker'
  | 'Land'
  | 'Battle'
  | 'Tribal';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic';

export type DifficultyMode = 'easy' | 'hard';

export type PuzzleState = 'draft' | 'scheduled' | 'published';

export interface ManaCost {
  symbols: string[]; // e.g. ['2', 'U', 'U'] for 2UU
  cmc: number;
}

export interface FakeCard {
  id: string;
  name: string;
  manaCost: string; // e.g. "{2}{U}{U}"
  cmc: number;
  colors: CardColor[];
  colorIdentity: CardColor[];
  type: string;       // e.g. "Legendary Creature — Human Wizard"
  supertype?: string;
  subtype?: string;
  oracleText: string;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  rarity: Rarity;
  artworkUrl?: string;  // AI-generated or placeholder
  artworkPrompt?: string;
  frameColor: CardColor[];
}

export interface RealCard {
  id: string;
  name: string;
  manaCost: string;
  cmc: number;
  colors: CardColor[];
  colorIdentity: CardColor[];
  type: string;
  oracleText: string;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  rarity: Rarity;
  setCode: string;
  setName: string;
  imageUrl: string;     // Scryfall image
  scryfallId: string;
  year: number;
}

export interface Puzzle {
  id: string;
  number: number;      // Puzzle #42
  date: string;        // ISO date "2026-04-23"
  fakeCard: FakeCard;
  realCardName: string;
  realCardScryfallId: string;
  difficulty: DifficultyMode;
  state: PuzzleState;
  hints: string[];     // Ordered hints revealed per wrong guess
  tags?: string[];
  curatorNotes?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface GuessResult {
  guessName: string;
  isCorrect: boolean;
  hintRevealed: string;
  fractureScore: number;       // 0–100 closeness
  colorMatch: 'exact' | 'partial' | 'none';
  cmcMatch: 'exact' | 'close' | 'far';
  typeMatch: 'exact' | 'partial' | 'none';
  keywordMatch: 'exact' | 'partial' | 'none';
  rarityMatch: boolean;
}

export interface GameState {
  puzzleId: string;
  puzzleNumber: number;
  date: string;
  fakeCard: FakeCard;
  realCardName: string;
  guesses: GuessResult[];
  maxGuesses: number;
  isComplete: boolean;
  isWon: boolean;
  startTime: number;
  endTime?: number;
  difficulty: DifficultyMode;
}

export interface PlayerStats {
  totalPlayed: number;
  totalWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<string, number>; // "1"–"5" + "X"
  lastPlayedDate?: string;
  lastPuzzleId?: string;
  averageGuesses: number;
}

export interface GlossaryEntry {
  id: string;
  original: string;
  opposite: string;
  category: 'keyword' | 'mechanic' | 'action' | 'stat' | 'zone';
  examples?: string[];
}

export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  colors?: string[];
  color_identity: string[];
  type_line: string;
  oracle_text?: string;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  rarity: string;
  set: string;
  set_name: string;
  released_at: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line: string;
    oracle_text?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      art_crop: string;
      border_crop: string;
    };
  }>;
}

export type Theme = 'dark' | 'white' | 'blue' | 'black' | 'red' | 'green';

export interface AppSettings {
  theme: Theme;
  difficulty: DifficultyMode;
  reducedMotion: boolean;
}
