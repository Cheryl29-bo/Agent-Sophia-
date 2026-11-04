import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title:'SOPHIA — Career intelligence', description:'Explainable job recommendations and career insights.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
