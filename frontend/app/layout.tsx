import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SOPHIA — Your career companion',
  description: 'Explore sample opportunities and get transparent, explainable career recommendations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
