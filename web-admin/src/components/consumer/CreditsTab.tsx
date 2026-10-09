'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Zap, Award, Sparkles, Megaphone, 
  CheckCircle2, Flame, ArrowUpRight, ShieldCheck, Tag 
} from 'lucide-react';
import { INITIAL_RESTAURANTS } from '../../data/caraguaData';

interface CreditsTabProps {
  userCredits: number;
  onSpendCredits: (amount: number, reason: string) => boolean;
}

export const CreditsTab: React.FC<CreditsTabProps> = ({
  userCredits,
  onSpendCredits,
}) => {
  const [activeTab, setActiveTab] = useState<'carteira' | 'anunciantes'>('carteira');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('15% OFF');
  const [promoSuccess, setPromoSuccess] = useState(false);

  const perks = [
    {
      id: 'highlight',
      cost: 100,
      title: 'Destacar Minha Avaliação no Topo',
      desc: 'Sua crítica ganha selo dourado especial e fica em destaque no Feed por 7 dias.',
      badge: 'Popular na Comunidade'
    },
    {
      id: 'local_badge',
      cost: 150,
      title: 'Selo Morador Local Verificado',
      desc: 'Concede peso 1.5x na equação de decaimento temporal para suas próximas avaliações com selo oficial.',
      badge: 'Multiplicador 1.5x'
    },
    {
      id: 'owner_reply',
      cost: 200,
      title: 'Resposta Oficial de Proprietário',
      desc: 'Permite que donos de quiosques e restaurantes respondam a comentários com crachá verificado da empresa.',
      badge: 'B2B & Negócios'
    }
  ];

  const handleLaunchPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;

    const success = onSpendCredits(150, `Impulsionamento: ${promoTitle}`);
    if (success) {
      setPromoSuccess(true);
      setPromoTitle('');
      setPromoDesc('');
      setTimeout(() => setPromoSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Card da Carteira de Créditos em Verde-Oceano Âncora */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0B2B26] text-[#F6F2EB] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#9DB8B1] font-mono uppercase tracking-wider">Carteira de Recompensas</p>
              <h2 className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">
                {userCredits} <span className="text-amber-300 text-lg">CR</span>
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-[#7FD1C6] border border-white/15">
            Nível: Caiçara Gourmet
          </span>
        </div>

        <p className="text-xs text-[#B7CFC9] leading-relaxed max-w-xl">
          Você acumula créditos avaliando estabelecimentos (+50 CR), detectando inconsistências no RAG e participando ativamente da comunidade gastronômica de Caraguatatuba.
        </p>

        {/* Barra de Progresso do Nível */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] font-mono text-[#9DB8B1]">
            <span>Progresso até Nível Crítico Caiçara:</span>
            <span>{userCredits} / 500 CR</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (userCredits / 500) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Seletor de Modo: Carteira Pessoal vs Gestão B2B */}
      <div className="flex gap-2 border-b border-[#E2D9CC] pb-3">
        <button
          onClick={() => setActiveTab('carteira')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'carteira'
              ? 'bg-[#0B2B26] text-[#F6F2EB]'
              : 'text-[#52525B] hover:text-[#18181B]'
          }`}
        >
          Resgatar Vantagens (Consumidor)
        </button>
        <button
          onClick={() => setActiveTab('anunciantes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'anunciantes'
              ? 'bg-[#0B2B26] text-[#F6F2EB]'
              : 'text-[#52525B] hover:text-[#18181B]'
          }`}
        >
          Painel B2B / Quiosques (Anunciantes)
        </button>
      </div>

      {activeTab === 'carteira' ? (
        <div className="space-y-4">
          <h3 className="font-bold text-[#18181B] text-base">Benefícios Disponíveis para Resgate</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {perks.map((perk) => (
              <div key={perk.id} className="coucou-card p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#99F6E4]">
                    {perk.badge}
                  </span>
                  <h4 className="font-bold text-sm text-[#18181B] mt-2">
                    {perk.title}
                  </h4>
                  <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
                <button
                  disabled={userCredits < perk.cost}
                  onClick={() => onSpendCredits(perk.cost, perk.title)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs font-mono transition-all ${
                    userCredits >= perk.cost
                      ? 'bg-[#0B2B26] text-white hover:bg-[#134E4A]'
                      : 'bg-[#EDE6DC] text-[#71717A] cursor-not-allowed'
                  }`}
                >
                  Resgatar por {perk.cost} CR
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="coucou-card p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#18181B] text-base flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#0D9488]" />
              <span>Simulador de Impulsionamento Ético B2B</span>
            </h3>
            <p className="text-xs text-[#52525B] mt-1">
              Restaurantes e quiosques parceiros podem impulsionar promoções reais sem violar a integridade das notas.
            </p>
          </div>

          <form onSubmit={handleLaunchPromo} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-[#18181B] uppercase mb-1.5">
                Título do Prato / Destaque:
              </label>
              <input
                type="text"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="Ex: Festival da Tainha na Brasa"
                className="w-full p-3 rounded-xl bg-[#EDE6DC]/70 border border-[#E2D9CC] text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] uppercase mb-1.5">
                Desconto / Condição Especial:
              </label>
              <input
                type="text"
                value={promoDiscount}
                onChange={(e) => setPromoDiscount(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#EDE6DC]/70 border border-[#E2D9CC] text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={userCredits < 150}
              className={`px-5 py-3 rounded-xl font-bold text-xs ${
                userCredits >= 150
                  ? 'bg-[#0B2B26] text-white hover:bg-[#134E4A]'
                  : 'bg-[#EDE6DC] text-[#71717A] cursor-not-allowed'
              }`}
            >
              Publicar Destaque (Custa 150 CR)
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
