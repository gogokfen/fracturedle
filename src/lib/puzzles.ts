import type { Puzzle } from '@/types';
import fallback from '@/data/puzzles.json';
import { isSupabaseConfigured, createClient, dbToPuzzle, puzzleToDb, type DbPuzzle } from './db';
import { getTodayString } from './utils';

function fromFallback(): Puzzle[] {
  return fallback as Puzzle[];
}

export async function getAllPuzzles(): Promise<Puzzle[]> {
  if (!isSupabaseConfigured()) return fromFallback();
  const { data, error } = await createClient()
    .from('puzzles')
    .select('*')
    .order('number', { ascending: true });
  if (error || !data) return fromFallback();
  return data.map(row => dbToPuzzle(row as DbPuzzle));
}

export async function getPublishedPuzzles(): Promise<Puzzle[]> {
  if (!isSupabaseConfigured()) {
    return fromFallback().filter(p => p.state === 'published' || p.state === 'scheduled');
  }
  const { data, error } = await createClient()
    .from('puzzles')
    .select('*')
    .in('state', ['published', 'scheduled'])
    .order('number', { ascending: false });
  if (error || !data) return fromFallback().filter(p => p.state === 'published' || p.state === 'scheduled');
  return data.map(row => dbToPuzzle(row as DbPuzzle));
}

export async function getDailyPuzzle(dateStr?: string): Promise<Puzzle | null> {
  const target = dateStr ?? getTodayString();
  if (!isSupabaseConfigured()) {
    return fromFallback().find(p => p.date === target && (p.state === 'published' || p.state === 'scheduled')) ?? null;
  }
  const { data, error } = await createClient()
    .from('puzzles')
    .select('*')
    .eq('date', target)
    .in('state', ['published', 'scheduled'])
    .single();
  if (error || !data) {
    return fromFallback().find(p => p.date === target) ?? null;
  }
  return dbToPuzzle(data as DbPuzzle);
}

export async function getPuzzleByNumber(num: number): Promise<Puzzle | null> {
  if (!isSupabaseConfigured()) {
    return fromFallback().find(p => p.number === num) ?? null;
  }
  const { data, error } = await createClient()
    .from('puzzles')
    .select('*')
    .eq('number', num)
    .single();
  if (error || !data) return fromFallback().find(p => p.number === num) ?? null;
  return dbToPuzzle(data as DbPuzzle);
}

export async function getPuzzleById(id: string): Promise<Puzzle | null> {
  if (!isSupabaseConfigured()) {
    return fromFallback().find(p => p.id === id) ?? null;
  }
  const { data, error } = await createClient()
    .from('puzzles')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return dbToPuzzle(data as DbPuzzle);
}

// Admin operations — use service role key
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role key not set');
  const { createClient: create } = require('@supabase/supabase-js');
  return create(url, key);
}

export async function upsertPuzzle(puzzle: Puzzle): Promise<Puzzle> {
  const row = puzzleToDb(puzzle);
  const { data, error } = await adminClient()
    .from('puzzles')
    .upsert(row)
    .select()
    .single();
  if (error) throw new Error((error as { message?: string })?.message ?? JSON.stringify(error));
  return dbToPuzzle(data as DbPuzzle);
}

export async function deletePuzzle(id: string): Promise<void> {
  const { error } = await adminClient()
    .from('puzzles')
    .delete()
    .eq('id', id);
  if (error) throw new Error((error as { message?: string })?.message ?? JSON.stringify(error));
}

export async function updatePuzzleArtwork(id: string, artworkUrl: string): Promise<void> {
  const client = adminClient();
  const { data, error: fetchError } = await client
    .from('puzzles').select('fake_card').eq('id', id).single();
  if (fetchError) throw new Error((fetchError as { message?: string })?.message ?? 'Fetch failed');
  const fakeCard = { ...(data.fake_card as Record<string, unknown>), artworkUrl };
  const { error } = await client.from('puzzles').update({ fake_card: fakeCard }).eq('id', id);
  if (error) throw new Error((error as { message?: string })?.message ?? JSON.stringify(error));
}
