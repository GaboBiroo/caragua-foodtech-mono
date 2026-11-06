'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Compass,
  Info,
  Mail,
  Trophy,
  GraduationCap,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { AcademicPortalModal } from './AcademicPortalModal';

interface NavbarProps {
  onOpenAcademicModal?: () => void;
  onOpenAIChat?: () => void;
}

export const CaraguaWaveEmblem: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} animate-tide-wave shrink-0`}
    aria-label="Símbolo de Onda e Maré de Caraguatatuba"
  >
    <circle cx="29" cy="14" r="7.5" fill="#FFB703" />
    <circle cx="29" cy="14" r="10.5" stroke="#FFB703" strokeOpacity="0.35" strokeWidth="1.8" strokeDasharray="3 3" />
    <path
      d="M3 26.5C8.5 20.5 15.5 20.5 21.5 25.5C27.5 30.5 34.5 29.5 41 23.5"
      stroke="#38BDF8"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M3 33.5C9.5 27.5 16.5 27.5 22.5 32.5C28.5 37.5 35.5 36.5 41 30.5"
      stroke="#FFB703"
      strokeWidth="3.8"
      strokeLinecap="round"
    />
    <path
      d="M6 38.5C11.5 34.5 17.5 34.5 23.5 38C29.5 41.5 35 40.5 39.5 36.5"
      stroke="#FFFFFF"
      strokeOpacity="0.85"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ onOpenAcademicModal, onOpenAIChat }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalAcademicOpen, setInternalAcademicOpen] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 8;
      const ny = (e.clientY / window.innerHeight - 0.5) * 6;
      setMouseOffset({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAcademicClick = () => {
    if (onOpenAcademicModal) {
      onOpenAcademicModal();
    } else {
      setInternalAcademicOpen(true);
    }
  };

  const navLinks = [
    { name: 'Início', href: '/', icon: Compass, label: 'Onde Comer Hoje' },
    { name: 'Rankings', href: '/rankings', icon: Trophy, label: 'Os Mais Queridos' },
    { name: 'Sobre Nós', href: '/sobre', icon: Info, label: 'Nossa História' },
    { name: 'Contato', href: '/contato', icon: Mail, label: 'Credenciar Local' },
    { name: 'Curadoria', href: '/moderation', icon: ShieldCheck, label: 'Painel da Equipe' },
  ];

  return (
    <>
      <nav
        aria-label="Navegação Principal CaráFood"
        className="sticky top-0 z-40 w-full bg-[#135136]/95 backdrop-blur-md border-b-2 border-[#FFB703]/85 text-white shadow-[0_8px_25px_-6px_rgba(19,81,54,0.45)] transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
          <Link
            href="/"
            onClick={() => {
              setIsJumping(true);
              setTimeout(() => setIsJumping(false), 650);
            }}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#FFB703] rounded-2xl px-2 py-1 transition-transform hover:scale-[1.02]"
          >
            <motion.div
              animate={{
                x: mouseOffset.x,
                y: mouseOffset.y,
                rotate: mouseOffset.x * 0.7,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className={`relative w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-20 shrink-0 -my-2 drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] animate-coucou-wave ${
                isJumping ? 'animate-coucou-jump' : ''
              }`}
            >
              <img
                src="/jacquin-praiano.png"
                alt="Chef Jacquin Praiano - Curadoria CaráFood"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(255,183,3,0.45)]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FFB703] border-2 border-[#135136] rounded-full shadow-sm animate-pulse" />
            </motion.div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white leading-none group-hover:text-amber-200 transition-colors">
                  Cará<span className="text-[#FFB703]">Food</span>
                </span>
                <CaraguaWaveEmblem className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-amber-200 font-extrabold tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                  53 Bairros de Caraguá
                </span>
                <span className="hidden xl:inline text-[10px] text-emerald-200 font-semibold">
                  • Cardápios & Preços Reais
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 bg-white/10 p-1.5 rounded-full border border-white/15">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/' || pathname?.startsWith('/restaurants/')
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFB703] text-stone-900 shadow-sm scale-105'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-900' : 'text-[#FFB703]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {onOpenAIChat && (
              <button
                type="button"
                onClick={onOpenAIChat}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFB703] hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-md transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                <span className="hidden sm:inline">Chef CaráFood</span>
                <span className="sm:hidden">Chef</span>
              </button>
            )}

            <Link
              href={pathname === '/moderation' ? '/' : '/moderation'}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-white transition-all"
            >
              {pathname === '/moderation' ? (
                <>
                  <Compass className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>Cardápios</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>Painel da Equipe</span>
                </>
              )}
            </Link>

            <button
              type="button"
              onClick={handleAcademicClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/85 hover:bg-emerald-900 border border-[#FFB703]/60 text-xs font-bold text-amber-200 hover:text-white shadow-sm transition-all"
              title="Portal Acadêmico TCC"
            >
              <GraduationCap className="w-4 h-4 text-[#FFB703]" />
              <span className="hidden xl:inline">Portal TCC</span>
            </button>

            <Link
              href="/login"
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                pathname === '/login'
                  ? 'bg-white text-stone-900 border-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/25'
              }`}
              title="Acesso de Avaliador, Gestor ou Curador"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>Entrar</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
              aria-label="Abrir Menu de Navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F402B] border-t border-white/10 px-4 py-4 space-y-2 shadow-2xl">
            <div className="text-[11px] font-bold text-[#FFB703] uppercase tracking-wider px-2 pb-1 flex items-center justify-between">
              <span>Navegação CaráFood</span>
              <span className="text-[10px] text-emerald-200 font-normal">53 Bairros Oficiais</span>
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

            <div className="pt-2 border-t border-white/10 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-4 h-4 text-[#FFB703]" />
                  <span>Entrar na Plataforma</span>
                </div>
                <span className="text-[11px] font-normal text-emerald-200">Avaliador • Gestor</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAcademicClick();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#FFB703]/20 hover:bg-[#FFB703]/30 text-amber-200 border border-[#FFB703]/40"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-[#FFB703]" />
                  <span>Portal Acadêmico TCC</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#FFB703]" />
              </button>
            </div>
          </div>
        )}
      </nav>

      <AcademicPortalModal
        isOpen={internalAcademicOpen}
        onClose={() => setInternalAcademicOpen(false)}
      />
    </>
  );
};
