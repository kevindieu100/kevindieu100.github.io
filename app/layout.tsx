import type { Metadata } from 'next';
import { Libre_Baskerville, Source_Sans_3 } from 'next/font/google';
import { Nav } from '@/components/Nav';
import './globals.css';

const serif = Libre_Baskerville({
  weight: ['400', '700'],
  variable: '--font-serif',
  subsets: ['latin'],
});

const sans = Source_Sans_3({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kevin Dieu',
  description:
    'Product leader building AI and agentic experiences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-white">
        <div className="mx-auto max-w-content px-6 pt-12 pb-24">
          <header className="mb-16">
            <Nav />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
