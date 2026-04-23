import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Puzzle } from '@/types';

export type Database = {
  public: {
    Tables: {
      puzzles: {
        Row: DbPuzzle;
        Insert: Omit<DbPuzzle, 'created_at'>;
        Update: Partial<Omit<DbPuzzle, 'id' | 'created_at'>>;
      };
    };
  };
};

export interface DbPuzzle {
  id: string;
  number: number;
  date: string;
  fake_card: Record<string, unknown>;
  real_card_name: string;
  real_card_scryfall_id: string;
  difficulty: string;
  state: string;
  hints: string[];
  tags: string[] | null;
  curator_notes: string | null;
  created_at: string;
  published_at: string | null;
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createSupabaseClient<Database>(url, key);
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function dbToPuzzle(row: DbPuzzle): Puzzle {
  return {
    id: row.id,
    number: row.number,
    date: row.date,
    fakeCard: row.fake_card as unknown as Puzzle['fakeCard'],
    realCardName: row.real_card_name,
    realCardScryfallId: row.real_card_scryfall_id,
    difficulty: row.difficulty as Puzzle['difficulty'],
    state: row.state as Puzzle['state'],
    hints: row.hints,
    tags: row.tags ?? undefined,
    curatorNotes: row.curator_notes ?? undefined,
    createdAt: row.created_at,
    publishedAt: row.published_at ?? undefined,
  };
}

export function puzzleToDb(p: Puzzle): Omit<DbPuzzle, 'created_at'> {
  return {
    id: p.id,
    number: p.number,
    date: p.date,
    fake_card: p.fakeCard as unknown as Record<string, unknown>,
    real_card_name: p.realCardName,
    real_card_scryfall_id: p.realCardScryfallId,
    difficulty: p.difficulty,
    state: p.state,
    hints: p.hints,
    tags: p.tags ?? null,
    curator_notes: p.curatorNotes ?? null,
    published_at: p.publishedAt ?? null,
  };
}
