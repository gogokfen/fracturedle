import { HelpCircle, Lightbulb, BarChart2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'How to Play — Fracturedle',
};

const STEPS = [
  {
    icon: '🃏',
    title: 'A Fractured Card Is Shown',
    desc: 'Each day you see a fake Magic: The Gathering card. It looks real, but every mechanic has been inverted — what the real card creates, the fake destroys; what drains life, it gains instead.',
  },
  {
    icon: '🔍',
    title: 'Guess the Real Card',
    desc: 'You have 5 attempts to name the real card. Type any Magic card name — autocomplete will help. The answer is always a real, printed MTG card.',
  },
  {
    icon: '💡',
    title: 'Hints Are Revealed',
    desc: 'After each wrong guess, a new hint is unlocked. Hints start broad (color, type) and get more specific. Use them wisely!',
  },
  {
    icon: '📊',
    title: 'Watch the Fracture Meter',
    desc: 'The Fracture Meter shows how close your guess is to the real card. It evaluates color identity, mana cost, card type, and keywords. Green dots = exact match, yellow = close.',
  },
  {
    icon: '🪞',
    title: 'Compare Cards',
    desc: 'When the game ends, see the real card side by side with the fake. Highlighted differences show you exactly what was inverted.',
  },
  {
    icon: '📢',
    title: 'Share Your Result',
    desc: 'Share your result with friends using the emoji grid — just like Wordle! No spoilers included.',
  },
];

const OPPOSITES = [
  ['Draw 2 cards', 'Discard 2 cards'],
  ['Gain 3 life', 'Lose 3 life'],
  ['Destroy target creature', 'Create a 1/1 token'],
  ['Flying', 'Cannot block flyers'],
  ['Counter target spell', 'Copy target spell'],
  ['Haste', 'Does not untap'],
  ['Search your library', 'Shuffle your hand in'],
  ['Exile', 'Return from exile'],
];

export default function HowToPlayPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs uppercase tracking-widest mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          How to Play
        </div>
        <h1 className="text-3xl font-black text-white">Fracturedle</h1>
        <p className="text-white/50">The daily Magic: The Gathering guessing game</p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors"
          >
            <div className="text-3xl shrink-0 mt-0.5">{step.icon}</div>
            <div>
              <h3 className="font-bold text-white mb-1">{step.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fracture Meter explanation */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-400" />
          Understanding the Fracture Meter
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { level: 'Intact', score: '0–24', color: '#6b7280', desc: 'No match' },
            { level: 'Chipped', score: '25–49', color: '#3b82f6', desc: 'Barely related' },
            { level: 'Cracked', score: '50–69', color: '#eab308', desc: 'Some similarities' },
            { level: 'Fractured', score: '70–89', color: '#f97316', desc: 'Very close' },
            { level: 'Shattered', score: '90–100', color: '#ef4444', desc: 'Almost identical' },
          ].map(item => (
            <div key={item.level} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <div className="font-semibold text-white">{item.level}</div>
                <div className="text-white/40 text-xs">{item.score} · {item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40">
          The four attribute dots show Color (🟢), CMC (🟡), Type (🔵), Keywords (🟠) match quality.
        </p>
      </div>

      {/* Opposites guide */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          The Fracture Logic
        </h2>
        <p className="text-white/50 text-sm">Every fake card follows consistent inversion rules. Here are some examples:</p>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left px-4 py-3 text-green-400 font-semibold">Real Card Effect</th>
                <th className="text-left px-4 py-3 text-white/30">→</th>
                <th className="text-left px-4 py-3 text-red-400 font-semibold">Fractured Effect</th>
              </tr>
            </thead>
            <tbody>
              {OPPOSITES.map(([real, fake], i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="px-4 py-2.5 text-white/70">{real}</td>
                  <td className="px-4 py-2.5 text-white/20">→</td>
                  <td className="px-4 py-2.5 text-white/50 italic">{fake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
        >
          Play Today&apos;s Puzzle
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
