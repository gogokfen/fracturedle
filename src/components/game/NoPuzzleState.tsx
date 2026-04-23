'use client';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function NoPuzzleState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      <div className="text-6xl">🃏</div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">No Puzzle Today</h2>
        <p className="text-white/50 max-w-sm">
          There&apos;s no puzzle scheduled for today. Check back tomorrow, or explore the archive.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/archive"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all"
        >
          <Calendar className="w-4 h-4" />
          View Archive
        </Link>
      </div>
    </div>
  );
}
