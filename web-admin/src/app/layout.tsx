import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata = {
  title: 'Caraguá FoodTech - Painel de Administração',
  description: 'Web Admin para Moderação do Agregador Gastronômico com RAG e PostGIS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
