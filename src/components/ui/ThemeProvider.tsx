'use client';
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, loadPersistedGame } = useGameStore();

  useEffect(() => {
    loadPersistedGame();
  }, [loadPersistedGame]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  return <>{children}</>;
}
