import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ui/ThemeProvider';
import Navigation from '@/components/ui/Navigation';

export const metadata: Metadata = {
  title: 'Fracturedle — Daily MTG Guessing Game',
  description: 'Guess the real Magic: The Gathering card from its fractured (opposite) version. A daily word game for MTG fans.',
  keywords: ['magic the gathering', 'mtg', 'wordle', 'daily game', 'card game', 'puzzle'],
  openGraph: {
    title: 'Fracturedle',
    description: 'Can you identify the real card from its opposite?',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navigation />
          <main className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
