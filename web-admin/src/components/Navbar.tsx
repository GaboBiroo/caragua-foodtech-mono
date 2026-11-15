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
  ChefHat,
} from 'lucide-react';
import { AcademicPortalModal } from './AcademicPortalModal';
import { CaraguaAIChatDrawer } from './CaraguaAIChatDrawer';
import { triggerHapticSelection } from '../utils/nativeBridgeClient';

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
  const [internalChatOpen, setInternalChatOpen] = useState(false);
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
    triggerHapticSelection();
    if (onOpenAcademicModal) {
      onOpenAcademicModal();
    } else {
      setInternalAcademicOpen(true);
    }
  };

  const handleChatClick = () => {
    triggerHapticSelection();
    if (onOpenAIChat) {
      onOpenAIChat();
    } else {
      setInternalChatOpen(true);
    }
  };

  const navLinks = [
    { name: 'Início', href: '/', icon: Compass, label: 'Onde Comer Hoje' },
    { name: 'Rankings', href: '/rankings', icon: Trophy, label: 'Os Mais Queridos' },
    { name: 'Sobre Nós', href: '/sobre', icon: Info, label: 'Nossa História' },
    { name: 'Contato', href: '/contato', icon: Mail, label: 'Credenciar Local' },
    { name: 'Curadoria', href: '/moderation', icon: ShieldCheck, label: 'Painel da Equipe' },
  ];

  const isRouteActive = (href: string) =>
    href === '/'
      ? pathname === '/' || pathname?.startsWith('/restaurants/') || pathname?.startsWith('/prato/')
      : pathname?.startsWith(href);

  return (
    <>
      <nav
        aria-label="Navegação Principal CaráFood"
        className="sticky top-0 z-40 w-full bg-[#135136]/95 backdrop-blur-md border-b-2 border-[#FFB703]/85 text-white shadow-[0_8px_25px_-6px_rgba(19,81,54,0.45)] transition-all"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-2 sm:gap-3">
          <Link
            href="/"
            onClick={() => {
              triggerHapticSelection();
              setIsJumping(true);
              setTimeout(() => setIsJumping(false), 650);
            }}
            className="flex items-center gap-2 sm:gap-3 min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703] rounded-2xl px-1 py-0.5 transition-transform hover:scale-[1.01]"
          >
            <motion.div
              animate={{
                x: mouseOffset.x,
                y: mouseOffset.y,
                rotate: mouseOffset.x * 0.7,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className={`relative w-9 h-10 sm:w-12 sm:h-14 lg:w-14 lg:h-16 shrink-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)] animate-coucou-wave ${
                isJumping ? 'animate-coucou-jump' : ''
              }`}
            >
              <img
                src="/jacquin-praiano.png"
                alt="Chef Jacquin Praiano - Curadoria CaráFood"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(255,183,3,0.45)]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#FFB703] border-2 border-[#135136] rounded-full shadow-sm animate-pulse" />
            </motion.div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-heading font-black text-xl sm:text-2xl lg:text-3xl tracking-tight text-white leading-none group-hover:text-amber-200 transition-colors truncate">
                  Cará<span className="text-[#FFB703]">Food</span>
                </span>
                <CaraguaWaveEmblem className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                <span className="text-[9px] sm:text-[10px] text-amber-200 font-extrabold tracking-wider uppercase bg-white/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[155px] sm:max-w-none">
                  53 Bairros de Caraguá
                </span>
                <span className="hidden xl:inline text-[10px] text-emerald-200 font-semibold whitespace-nowrap">
                  • Cardápios &amp; Preços Reais
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 bg-white/10 p-1.5 rounded-full border border-white/15 shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#FFB703] text-stone-900 shadow-sm scale-105'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-stone-900' : 'text-[#FFB703]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleChatClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#FFB703] hover:bg-amber-400 active:scale-95 text-stone-950 text-[11px] sm:text-xs font-extrabold shadow-md transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-950 shrink-0" />
              <span className="hidden sm:inline">Chef CaráFood</span>
              <span className="sm:hidden">Chef</span>
            </button>

            <button
              type="button"
              onClick={handleAcademicClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 active:scale-95 border border-[#FFB703]/70 text-[11px] sm:text-xs font-bold text-amber-200 hover:text-white shadow-sm transition-all whitespace-nowrap"
              title="Portal Acadêmico Prof. Cristiano & TCC"
            >
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB703] shrink-0" />
              <span className="sm:hidden">Prof.</span>
              <span className="hidden sm:inline">Portal TCC</span>
            </button>

            <Link
              href="/login"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all whitespace-nowrap ${
                pathname === '/login'
                  ? 'bg-white text-stone-900 border-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/25'
              }`}
              title="Acesso de Avaliador, Gestor ou Curador"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FFB703] shrink-0" />
              <span>Entrar</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setMobileMenuOpen((prev) => !prev);
              }}
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703]"
              aria-label="Abrir Menu de Navegação"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F402B] border-t border-white/10 px-3.5 py-3.5 space-y-2.5 shadow-2xl max-h-[80dvh] overflow-y-auto">
            {/* Bloco Destacado no Mobile: Banca Prof. Cristiano & Administração */}
            <div className="p-3 rounded-2xl bg-emerald-950/90 border border-[#FFB703]/45 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#FFB703] uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FFB703]" />
                  Área Prof. Cristiano &amp; Administração
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFB703]/20 text-amber-200">
                  Módulo ADS
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAcademicClick();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#FFB703] text-stone-950 shadow-sm active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GraduationCap className="w-4 h-4 text-stone-950 shrink-0" />
                    <span className="truncate">Portal Prof. Cristiano (Dossiê TCC)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-950 shrink-0" />
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/moderation"
                    onClick={() => {
                      triggerHapticSelection();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FFB703] shrink-0" />
                    <span className="truncate">Curadoria Admin</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => {
                      triggerHapticSelection();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#FFB703] shrink-0" />
                    <span className="truncate">Login (3 Perfis)</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-bold text-[#FFB703] uppercase tracking-wider px-2 pt-1 flex items-center justify-between">
              <span>Navegação Principal</span>
              <span className="text-[10px] text-emerald-200 font-normal">53 Bairros Oficiais</span>
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    triggerHapticSelection();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFB703] text-stone-900 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-stone-900' : 'text-[#FFB703]'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className={`text-[11px] font-normal shrink-0 ml-2 ${isActive ? 'text-stone-700' : 'text-emerald-200'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Barra Inferior Nativa Mobile (App Bottom Tab Bar) */}
      <nav
        aria-label="Barra de Navegação Inferior"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-6px_24px_rgba(19,81,54,0.09)] pb-safe-bottom"
      >
        <div className="grid grid-cols-5 h-16 items-center max-w-lg mx-auto px-1">
          <Link
            href="/"
            onClick={() => triggerHapticSelection()}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors ${
              isRouteActive('/') ? 'text-[#135136]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Compass className={`w-5 h-5 ${isRouteActive('/') ? 'stroke-[2.4]' : ''}`} />
            <span className={`text-[10px] leading-none ${isRouteActive('/') ? 'font-black' : 'font-semibold'}`}>
              Início
            </span>
          </Link>

          <Link
            href="/rankings"
            onClick={() => triggerHapticSelection()}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors ${
              isRouteActive('/rankings') ? 'text-[#135136]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Trophy className={`w-5 h-5 ${isRouteActive('/rankings') ? 'stroke-[2.4] text-amber-500' : ''}`} />
            <span className={`text-[10px] leading-none ${isRouteActive('/rankings') ? 'font-black' : 'font-semibold'}`}>
              Rankings
            </span>
          </Link>

          {/* Botão Central Destacado: Chef IA */}
          <div className="flex items-center justify-center -mt-4">
            <button
              type="button"
              onClick={handleChatClick}
              className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[#135136] text-white border-4 border-[#FAF7F2] shadow-[0_6px_18px_rgba(19,81,54,0.38)] active:scale-95 transition-transform"
              aria-label="Abrir Chef CaráFood IA"
            >
              <ChefHat className="w-5 h-5 text-[#FFB703]" />
              <span className="text-[9px] font-black tracking-tight text-amber-200 leading-none mt-0.5">
                Chef IA
              </span>
            </button>
          </div>

          <Link
            href="/contato"
            onClick={() => triggerHapticSelection()}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors ${
              isRouteActive('/contato') ? 'text-[#135136]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Mail className={`w-5 h-5 ${isRouteActive('/contato') ? 'stroke-[2.4]' : ''}`} />
            <span className={`text-[10px] leading-none ${isRouteActive('/contato') ? 'font-black' : 'font-semibold'}`}>
              Credenciar
            </span>
          </Link>

          <Link
            href="/moderation"
            onClick={() => triggerHapticSelection()}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors ${
              isRouteActive('/moderation') ? 'text-[#135136]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${isRouteActive('/moderation') ? 'stroke-[2.4]' : ''}`} />
            <span className={`text-[10px] leading-none ${isRouteActive('/moderation') ? 'font-black' : 'font-semibold'}`}>
              Equipe
            </span>
          </Link>
        </div>
      </nav>

      <AcademicPortalModal
        isOpen={internalAcademicOpen}
        onClose={() => setInternalAcademicOpen(false)}
      />

      {!onOpenAIChat && (
        <CaraguaAIChatDrawer
          isOpen={internalChatOpen}
          onClose={() => setInternalChatOpen(false)}
        />
      )}
    </>
  );
};
