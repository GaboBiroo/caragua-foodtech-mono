import './globals.css';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Caraguá FoodTech — Agregador Gastronômico com IA & RAG Hiperlocal',
  description: 'Plataforma gastronômica hiperlocal com IA & RAG de 5 Estágios em Caraguatatuba/SP. Curadoria editorial caiçara inspirada em design táctil e alta gastronomia.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caraguá FoodTech',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B2B26',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-[#F6F2EB] text-[#18181B] antialiased selection:bg-[#0D9488]/20 selection:text-[#0B2B26]">
        {children}
      </body>
    </html>
  );
}
