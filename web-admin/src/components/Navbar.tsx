'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, Info, Mail, Trophy, GraduationCap, 
  Menu, X, Sparkles, ChefHat, ExternalLink, ArrowRight
} from 'lucide-react';
import { AcademicPortalModal } from './AcademicPortalModal';

interface NavbarProps {
  onOpenAcademicModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAcademicModal }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalAcademicOpen, setInternalAcademicOpen] = useState(false);

  const handleAcademicClick = () => {
    if (onOpenAcademicModal) {
      onOpenAcademicModal();
    } else {
      setInternalAcademicOpen(true);
    }
  };

  const navLinks = [
    { name: 'Início', href: '/', icon: Compass, label: 'Feed & Bairros' },
    { name: 'Sobre Nós', href: '/sobre', icon: Info, label: 'História & TCC' },
    { name: 'Contato', href: '/contato', icon: Mail, label: 'Credenciamento' },
    { name: 'Rankings', href: '/rankings', icon: Trophy, label: 'Pódio & Métricas' },
  ];

  return (
    <>
      <nav 
        aria-label="Navegação Principal"
        className="sticky top-0 z-40 w-full bg-[#135136]/95 backdrop-blur-md border-b-2 border-[#FFB703]/80 text-white shadow-md transition-all"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* LOGO & IDENTIDADE VISUAL */}
          <Link 
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#FFB703] rounded-xl px-1.5 py-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFB703] to-amber-300 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[10px] bg-[#135136] flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5 text-[#FFB703]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg tracking-tight text-white leading-none group-hover:text-amber-200 transition-colors">
                CARAGUÁ <span className="text-[#FFB703]">FOODTECH</span>
              </span>
              <span className="text-[10px] text-emerald-200 font-semibold tracking-wider uppercase mt-0.5">
                Guia Caiçara Oficial
              </span>
            </div>
          </Link>

          {/* LINKS DE NAVEGAÇÃO DESKTOP */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/10 p-1.5 rounded-full border border-white/15">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFB703] text-stone-900 shadow-sm'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-900' : 'text-[#FFB703]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* BOTÃO ACADÊMICO & MENU MOBILE */}
          <div className="flex items-center gap-2.5">
            {/* Botão de Auditoria / Portal Acadêmico do Prof. Cristiano */}
            <button
              onClick={handleAcademicClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-[#FFB703]/50 text-xs font-bold text-amber-200 hover:text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
              title="Acesso da Banca Avaliadora • Prof. Cristiano S. Negrão"
            >
              <GraduationCap className="w-4 h-4 text-[#FFB703]" />
              <span className="hidden sm:inline">Portal Prof. Cristiano</span>
              <span className="sm:hidden">Acadêmico</span>
            </button>

            {/* Botão Toggle Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
              aria-label="Abrir Menu de Navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* DRAWER / MENU MOBILE EXPANSÍVEL */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F402B] border-t border-white/10 px-4 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="text-[11px] font-bold text-[#FFB703] uppercase tracking-wider px-2 pb-1">
              Navegação do Sistema
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFB703] text-stone-900 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-stone-900' : 'text-[#FFB703]'}`} />
                    <span>{item.name}</span>
                  </div>
                  <span className={`text-[11px] font-normal ${isActive ? 'text-stone-700' : 'text-emerald-200'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAcademicClick();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#FFB703]/20 hover:bg-[#FFB703]/30 text-amber-200 border border-[#FFB703]/40"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-[#FFB703]" />
                  <span>Portal Prof. Cristiano (TCC)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#FFB703]" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Modal Acadêmico Standalone para páginas secundárias */}
      <AcademicPortalModal
        isOpen={internalAcademicOpen}
        onClose={() => setInternalAcademicOpen(false)}
      />
    </>
  );
};
