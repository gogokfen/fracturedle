'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Archive, HelpCircle, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Play', icon: Zap },
  { href: '/archive', label: 'Archive', icon: Archive },
  { href: '/how-to-play', label: 'How to Play', icon: HelpCircle },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🃏</span>
          <span className="font-black text-lg tracking-tight text-white">
            Fracture<span className="text-blue-400">dle</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                pathname === href
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/admin"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            <Shield className="w-3 h-3" />
            Curator
          </Link>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-xl flex z-50">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] transition-colors',
              pathname === href ? 'text-blue-400' : 'text-white/40',
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}
