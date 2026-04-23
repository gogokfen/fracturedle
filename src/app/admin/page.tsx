'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Calendar, Archive, BookOpen, BarChart2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import CardCreator from '@/components/admin/CardCreator';
import PuzzleScheduler from '@/components/admin/PuzzleScheduler';
import DraftVault from '@/components/admin/DraftVault';
import GlossaryEditor from '@/components/admin/GlossaryEditor';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

type Tab = 'create' | 'schedule' | 'vault' | 'glossary' | 'analytics';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'create', label: 'Create Card', icon: <Plus className="w-4 h-4" /> },
  { id: 'schedule', label: 'Scheduler', icon: <Calendar className="w-4 h-4" /> },
  { id: 'vault', label: 'Draft Vault', icon: <Archive className="w-4 h-4" /> },
  { id: 'glossary', label: 'Glossary', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('create');
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Shield className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Curator Dashboard</h1>
          <p className="text-white/40 text-xs">Manage Fracturedle puzzles and content</p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              tab === t.id
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'create' && <CardCreator />}
        {tab === 'schedule' && <PuzzleScheduler />}
        {tab === 'vault' && <DraftVault />}
        {tab === 'glossary' && <GlossaryEditor />}
        {tab === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  );
}
