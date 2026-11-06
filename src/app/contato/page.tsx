'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Building,
  Clock,
  Store,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { NEIGHBORHOODS } from '../../data/caraguaData';



interface SavedLeadItem {
  id: string;
  protocol: string;
  restaurant_name: string;
  neighborhood: string;
  subject: string;
  status: string;
}

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    restaurante: '',
    nome: '',
    email: '',
    telefone: '',
    tipo: 'credenciamento',
    bairro: 'Martim de Sá',
    mensagem: '',
  });

  const [neighborhoodOptions, setNeighborhoodOptions] = useState<string[]>(
    NEIGHBORHOODS.map((n) => n.name).filter((name: string) => name !== 'Todos')
  );
  const [recentLeads, setRecentLeads] = useState<SavedLeadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [neighRes, leadsRes] = await Promise.all([
          fetch('/api/restaurants/neighborhoods/summary', { cache: 'no-store' }),
          fetch('/api/restaurants/leads?limit=5', { cache: 'no-store' }),
        ]);
        if (neighRes.ok) {
          const nData = await neighRes.json();
          if (active && Array.isArray(nData.neighborhoods) && nData.neighborhoods.length > 0) {
            setNeighborhoodOptions(
              nData.neighborhoods.map((n: { name: string }) => n.name)
            );
          }
        }
        if (leadsRes.ok) {
          const lData = await leadsRes.json();
          if (active && Array.isArray(lData)) {
            setRecentLeads(lData);
          }
        }
      } catch {
        // Mantém lista local dos 53 bairros
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let protocolNumber = `CG-FT-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch('/api/restaurants/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_name: formData.restaurante.trim() || formData.nome.trim(),
          contact_name: formData.nome.trim(),
          email: formData.email.trim(),
          phone: formData.telefone.trim(),
          neighborhood: formData.bairro,
          subject: formData.tipo,
          message: formData.mensagem.trim(),
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved.protocol) {
          protocolNumber = saved.protocol;
        }
        setRecentLeads((prev) => [
          {
            id: saved.id || protocolNumber,
            protocol: protocolNumber,
            restaurant_name: formData.restaurante.trim() || formData.nome.trim(),
            neighborhood: saved.neighborhood || formData.bairro,
            subject: formData.tipo,
            status: 'received',
          },
          ...prev.slice(0, 4),
        ]);
      }
    } catch {
      // Mantém protocolo local caso offline
    } finally {
      setIsSubmitting(false);
      setSubmittedProtocol(protocolNumber);
    }
  };

  const handleReset = () => {
    setSubmittedProtocol(null);
    setFormData({
      restaurante: '',
      nome: '',
      email: '',
      telefone: '',
      tipo: 'credenciamento',
      bairro: 'Martim de Sá',
      mensagem: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      <Navbar />

      {/* Cabeçalho */}
      <header className="relative bg-[#135136] text-white pt-14 pb-14 px-6 overflow-hidden border-b-4 border-[#FFB703]">
        <div className="max-w-4xl mx-auto relative z-10 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Credenciamento Gratuito • 53 Bairros de Caraguatatuba</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white leading-tight">
            Credencie Seu Restaurante & <span className="text-[#FFB703]">Fale Conosco</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl leading-relaxed">
            Tem um restaurante, quiosque, padaria ou pizzaria em Caraguatatuba? Cadastre seu
            cardápio sem taxas de intermediação ou envie sua sugestão para nossa curadoria.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda: Formulário com Persistência no Banco */}
          <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-xs">
            {submittedProtocol ? (
              <div className="py-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#135136] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-black text-2xl text-stone-900">
                    Solicitação Registrada com Sucesso!
                  </h3>
                  <p className="text-sm text-stone-600 max-w-md mx-auto">
                    Recebemos os dados de <strong>{formData.restaurante || formData.nome}</strong>{' '}
                    no bairro <strong>{formData.bairro}</strong>. Nossa equipe de curadoria
                    retornará em até 24 horas úteis.
                  </p>
                </div>

                <div className="inline-block p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Protocolo Salvo no Sistema
                  </div>
                  <div className="font-mono font-black text-lg text-[#135136]">
                    {submittedProtocol}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Responsável: <strong>{formData.nome}</strong> • {formData.email}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs transition-colors"
                  >
                    Enviar Nova Solicitação
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="font-heading font-black text-2xl text-stone-900">
                    Formulário de Credenciamento e Atendimento
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Preencha os dados abaixo para incluir ou atualizar seu estabelecimento no guia.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Assunto:
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                  >
                    <option value="credenciamento">
                      🏪 Credenciar Restaurante, Quiosque ou Padaria (0% Taxa)
                    </option>
                    <option value="prato">🍲 Atualizar Cardápio ou Cadastrar Prato do Dia</option>
                    <option value="amapec">
                      🦪 Parceria Produtor Local (AMAPEC Cocanha / Colônia Z-8)
                    </option>
                    <option value="suporte">🛠️ Sugestão ou Correção de Dados</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                      Nome do Estabelecimento: *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex.: Quiosque Mar Virado"
                      value={formData.restaurante}
                      onChange={(e) => setFormData({ ...formData, restaurante: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                      Bairro Oficial (53 Bairros): *
                    </label>
                    <select
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                    >
                      {neighborhoodOptions.map((bName) => (
                        <option key={bName} value={bName}>
                          {bName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Nome do Responsável: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex.: João Silva"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                      E-mail: *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contato@restaurante.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                      WhatsApp / Telefone: *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(12) 99876-5432"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Principais Pratos, Endereço e Horário de Funcionamento: *
                  </label>
                  <textarea
                    required
                    minLength={15}
                    rows={4}
                    placeholder="Informe o endereço completo, horário de atendimento e os principais pratos com preços..."
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#135136] hover:bg-[#0D3825] disabled:opacity-50 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Salvando solicitação no banco de dados...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#FFB703]" />
                      <span>Enviar & Solicitar Credenciamento</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Coluna Direita: Canais Oficiais, Últimos Credenciamentos e FAQ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[28px] p-6 border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="font-heading font-black text-lg text-stone-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#135136]" />
                <span>Canais de Atendimento em Caraguá</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-stone-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">Núcleo de Desenvolvimento:</strong>
                    <span>Centro Universitário Módulo (Campus Martim de Sá / Centro)</span>
                    <span className="block text-stone-500 text-xs">
                      Caraguatatuba - SP • CEP 11660-000
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">E-mail da Curadoria:</strong>
                    <span className="text-[#135136] font-semibold">
                      Gabrielhrodrigues8@gmail.com
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">Horário de Atendimento:</strong>
                    <span>Segunda a Sexta, das 09h às 18h</span>
                  </div>
                </div>
              </div>
            </div>

            {recentLeads.length > 0 && (
              <div className="bg-white rounded-[28px] p-6 border border-stone-200/90 shadow-xs space-y-3">
                <h4 className="font-heading font-black text-sm text-stone-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#135136]" />
                  <span>Últimas Solicitações Registradas</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {recentLeads.slice(0, 4).map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">
                          {lead.restaurant_name}
                        </div>
                        <div className="text-[11px] text-stone-500">{lead.neighborhood}</div>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 shrink-0">
                        {lead.protocol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-emerald-50/70 rounded-[28px] p-6 border border-emerald-200/90 space-y-3">
              <h4 className="font-heading font-black text-sm text-[#135136] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#135136]" />
                <span>Perguntas Frequentes</span>
              </h4>

              <div className="space-y-3 text-xs text-stone-700">
                <div>
                  <strong className="text-stone-900 block">O credenciamento tem custo?</strong>
                  <p className="text-stone-600">
                    Não. O CaráFood é 100% gratuito para restaurantes, quiosques, padarias e
                    lanchonetes de Caraguatatuba.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-900 block">
                    Restaurantes fora da orla podem participar?
                  </strong>
                  <p className="text-stone-600">
                    Sim! O guia cobre todos os 53 bairros oficiais, do Massaguaçu e Tabatinga ao
                    Tinga, Jaraguazinho e Porto Novo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 bg-[#135136] text-white py-8 px-4 text-center border-t-2 border-[#FFB703]/80">
        <p className="text-xs text-emerald-200">
          CaráFood • Canal de Credenciamento e Parcerias Locais em Caraguatatuba.
        </p>
      </footer>
    </div>
  );
}
