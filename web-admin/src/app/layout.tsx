import './globals.css';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Caraguá FoodTech — O Guia Gastronômico da Costa Caiçara',
  description: 'Descubra os melhores quiosques, frutos do mar frescos e pratos de Caraguatatuba com a curadoria do Chef Jacquin Praiano.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caraguá FoodTech',
  },
};

export const viewport: Viewport = {
  themeColor: '#E63946',
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
        <link rel="icon" href="/jacquin-praiano.png" type="image/png" />
        <link rel="apple-touch-icon" href="/jacquin-praiano.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-[#1F1914] antialiased selection:bg-[#E63946]/20 selection:text-[#E63946]">
        {children}
      </body>
    </html>
  );
}
