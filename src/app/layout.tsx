import './globals.css';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'CaráFood — O Guia Gastronômico Oficial da Costa Caiçara de Caraguatatuba',
  description: 'Descubra os melhores quiosques, mexilhões da Cocanha (AMAPEC), frutos do mar do Camaroeiro e os 53 bairros de Caraguatatuba no CaráFood com o Chef Jacquin Praiano.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CaráFood',
  },
};

export const viewport: Viewport = {
  themeColor: '#135136',
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
      <body className="min-h-screen bg-[#FAF7F2] text-[#1A202C] antialiased selection:bg-[#FFB703]/30 selection:text-[#135136]">
        {children}
      </body>
    </html>
  );
}
