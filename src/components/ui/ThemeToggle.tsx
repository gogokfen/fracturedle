'use client';
import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import type { Theme } from '@/types';

const THEMES: { value: Theme; label: string; color: string; dot: string }[] = [
  { value: 'dark',  label: 'Dark',  color: '#1a1a2e', dot: 'bg-gray-700' },
  { value: 'white', label: 'White', color: '#f5f0e8', dot: 'bg-amber-100 border border-amber-300' },
  { value: 'blue',  label: 'Blue',  color: '#0a1628', dot: 'bg-blue-600' },
  { value: 'black', label: 'Black', color: '#0d0d0d', dot: 'bg-gray-900 border border-gray-600' },
  { value: 'red',   label: 'Red',   color: '#1a0505', dot: 'bg-red-700' },
  { value: 'green', label: 'Green', color: '#061a06', dot: 'bg-green-700' },
];

export default function ThemeToggle() {
  const { settings, setTheme } = useGameStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
          {THEMES.map(t => (
            <button
              key={t.value}
              onClick={() => { setTheme(t.value); setOpen(false); }}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
                settings.theme === t.value
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
              )}
            >
              <span className={cn('w-3.5 h-3.5 rounded-full shrink-0', t.dot)} />
              {t.label}
              {settings.theme === t.value && <span className="ml-auto text-blue-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
