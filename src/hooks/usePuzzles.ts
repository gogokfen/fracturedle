'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Puzzle } from '@/types';

export function usePuzzles() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/puzzles');
      if (!res.ok) throw new Error('Failed to load puzzles');
      const data = await res.json();
      setPuzzles(data.puzzles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { puzzles, loading, error, reload };
}
