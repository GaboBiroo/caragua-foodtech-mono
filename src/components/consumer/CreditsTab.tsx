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
      desc: 'Sua crítica ganha borda prismática Liquid Glass iridescente e fica fixada no topo do Feed de Caraguá por 7 dias.',
      badge: 'Popular na Comunidade'
    },
    {
      id: 'local_badge',
      cost: 150,
      title: 'Selo Morador Local Verificado',
      desc: 'Concede peso 1.5x na equação de decaimento temporal para suas próximas avaliações com selo azul oficial.',
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
      {/* Switcher Carteira vs Anunciantes B2B */}
      <div className="flex p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('carteira')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'carteira'
              ? 'bg-white/[0.12] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Minha Carteira Nitro</span>
        </button>

        <button
          onClick={() => setActiveTab('anunciantes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'anunciantes'
              ? 'bg-white/[0.12] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-teal-400" />
          <span>Aba de Anunciantes Locais (B2B)</span>
        </button>
      </div>

      {activeTab === 'carteira' ? (
        <div className="space-y-6">
          {/* Card Principal do Saldo Nitro */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-teal-500/10 to-indigo-500/10 backdrop-blur-2xl border border-white/[0.12] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-amber-300 uppercase tracking-widest block mb-1">
                  Saldo de Créditos Ativos
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-4xl md:text-5xl font-black text-white tracking-tight">
                    {userCredits}
                  </span>
                  <span className="text-sm font-semibold text-zinc-400 font-mono">CRÉDITOS NITRO</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Nível de Confiabilidade: <strong className="text-teal-300">Caiçara Connoisseur (Nível 4)</strong>
                </p>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.10] text-xs space-y-1">
                <span className="text-zinc-400 block font-mono">Como ganhar mais créditos:</span>
                <p className="text-zinc-200">• Avaliar restaurantes no app: <strong className="text-emerald-400">+50 CR</strong></p>
                <p className="text-zinc-200">• Reportar alteração de cardápio: <strong className="text-emerald-400">+30 CR</strong></p>
              </div>
            </div>
          </div>

          {/* Lista de Perks Estilo Discord Nitro */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Vantagens Disponíveis para Resgate
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {perks.map((perk) => (
                <div
                  key={perk.id}
                  className="p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.09] transition flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wide bg-amber-500/10 text-amber-300 border border-amber-500/20 inline-block mb-2">
                      {perk.badge}
                    </span>
                    <h4 className="font-semibold text-white text-sm mb-1.5">{perk.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">{perk.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {perk.cost} CR
                    </span>
                    <button
                      onClick={() => onSpendCredits(perk.cost, perk.title)}
                      disabled={userCredits < perk.cost}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] disabled:opacity-30 disabled:hover:bg-white/[0.08] text-white text-xs font-semibold transition"
                    >
                      {userCredits >= perk.cost ? 'Desbloquear' : 'Saldo Insuficiente'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Aba de Anunciantes Locais (B2B) */
        <div className="space-y-6">
          <AnimatePresence>
            {promoSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Promoção impulsionada com sucesso no Radar de Caraguatatuba por 48 horas!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleLaunchPromo}
            className="p-6 md:p-8 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] space-y-5"
          >
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-teal-400" />
                Impulsionar Promoção Relâmpago no Radar da Cidade
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Pequenos quiosques e restaurantes de Caraguá podem destacar ofertas especiais diretamente no Feed e no Radar da madrugada gastando créditos acumulados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Título da Oferta:</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Ex: Rodízio de Camarão com 20% OFF no Almoço"
                  className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Desconto / Tag:</label>
                <input
                  type="text"
                  value={promoDiscount}
                  onChange={(e) => setPromoDiscount(e.target.value)}
                  placeholder="Ex: 2x1 ou 15% OFF"
                  className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Descrição Detalhada e Condições:</label>
              <textarea
                rows={3}
                value={promoDesc}
                onChange={(e) => setPromoDesc(e.target.value)}
                placeholder="Ex: Válido de terça a quinta para consumo no local até as 17h. Inclui porção de farofa caiçara."
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-400/50 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-zinc-400">
                Custo de Impulsionamento (48h): <strong className="text-amber-300">150 CR</strong>
              </span>

              <button
                type="submit"
                disabled={!promoTitle.trim() || userCredits < 150}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <span>Lançar no Radar de Caraguá</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Campanhas Ativas de Exemplo */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Promoções Atualmente Impulsionadas na Cidade:
            </h4>
            {INITIAL_RESTAURANTS.filter(r => r.activePromotion).map(r => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-semibold text-white">{r.name} ({r.neighborhood})</h5>
                  <p className="text-xs text-teal-300/90 mt-0.5">{r.activePromotion}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Radar Ativo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
