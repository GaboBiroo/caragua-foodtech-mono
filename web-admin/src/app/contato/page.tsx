'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, 
  HelpCircle, Sparkles, Building, Utensils, ShieldCheck, 
  Clock, ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'credenciamento',
    bairro: 'Martin de Sá',
    mensagem: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const protocolNumber = `CG-FT-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedProtocol(protocolNumber);
    }, 900);
  };

  const handleReset = () => {
    setSubmittedProtocol(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      tipo: 'credenciamento',
      bairro: 'Martin de Sá',
      mensagem: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      {/* NAVBAR GLOBAL INTEGRADA */}
      <Navbar />

      {/* HEADER DA PÁGINA */}
      <header className="relative bg-[#135136] text-white pt-16 pb-16 px-6 overflow-hidden border-b-4 border-[#FFB703]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB703_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Entrega S05 • Análise e Projeto de Sistemas II</span>
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white leading-tight">
            Entre em Contato & <span className="text-[#FFB703]">Credenciamento</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl leading-relaxed">
            Deseja credenciar seu quiosque ou restaurante no CaráFood, sugerir um prato caiçara tradicional ou tirar dúvidas sobre o projeto acadêmico? Envie sua mensagem!
          </p>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM FORMULÁRIO E INFOS */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO INTERATIVO */}
          <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-sm">
            {submittedProtocol ? (
              /* FEEDBACK VISUAL DE SUCESSO (ESTADO ENVIADO) */
              <div className="py-8 text-center space-y-5 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#135136] flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-black text-2xl text-stone-900">
                    Mensagem Recebida com Sucesso!
                  </h3>
                  <p className="text-sm text-stone-600 max-w-md mx-auto">
                    Obrigado por fortalecer a gastronomia caiçara de Caraguatatuba. Nossa equipe técnica entrará em contato em até 24 horas úteis.
                  </p>
                </div>

                <div className="inline-block p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Protocolo de Atendimento
                  </div>
                  <div className="font-mono font-black text-lg text-[#135136]">
                    {submittedProtocol}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Solicitante: <strong>{formData.nome}</strong> • {formData.email}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs transition-colors"
                  >
                    Enviar Outra Mensagem
                  </button>
                </div>
              </div>
            ) : (
              /* FORMULÁRIO DE CAPTURA COM VALIDAÇÃO */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="font-heading font-black text-2xl text-stone-900">
                    Formulário de Atendimento
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Preencha os campos abaixo. Entraremos em contato via WhatsApp ou e-mail.
                  </p>
                </div>

                {/* Tipo de Solicitação */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Tipo de Solicitação:
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                  >
                    <option value="credenciamento">🏪 Credenciar Restaurante ou Quiosque (0% Taxa)</option>
                    <option value="prato">🍲 Sugerir Prato Típico ou Patrimônio Caiçara</option>
                    <option value="amapec">🦪 Parceria Produtor Local (AMAPEC / Colônia Z-8)</option>
                    <option value="academico">🎓 Dúvida Acadêmica TCC / Prof. Cristiano Negrão</option>
                    <option value="suporte">🛠️ Suporte Técnico / Reportar Inconsistência</option>
                  </select>
                </div>

                {/* Nome Completo */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Nome Completo: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Caiçara"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                  />
                </div>

                {/* Grid E-mail e Telefone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                      E-mail: *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="joao@restaurante.com.br"
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

                {/* Bairro do Estabelecimento */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Bairro de Caraguatatuba:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Martim de Sá, Cocanha, Tinga, Indaiá, Massaguaçu..."
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                  />
                </div>

                {/* Mensagem / Proposta */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Mensagem ou Descrição do Negócio: *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Conte um pouco sobre seu prato típico, especialidade ou proposta de parceria..."
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136] resize-none"
                  />
                </div>

                {/* Botão de Submissão */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#135136] hover:bg-[#0D3825] disabled:opacity-50 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Registrando solicitação...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#FFB703]" />
                      <span>Enviar Mensagem & Solicitar Credenciamento</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* COLUNA DIREITA: CANAIS REAIS E FAQ */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Box Institucional / Endereço */}
            <div className="bg-white rounded-[28px] p-6 border border-stone-200/90 shadow-sm space-y-4">
              <h3 className="font-heading font-black text-lg text-stone-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#135136]" />
                <span>Canais Oficiais do Projeto</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-stone-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">Sede Acadêmica de Pesquisa:</strong>
                    <span>Centro Universitário Módulo (Campus Martim de Sá / Centro)</span>
                    <span className="block text-stone-500 text-xs">Caraguatatuba - SP, CEP 11660-000</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">E-mail Acadêmico:</strong>
                    <span className="text-[#135136] font-medium">Gabrielhrodrigues8@gmail.com</span>
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

            {/* Box FAQ de Credenciamento */}
            <div className="bg-emerald-50/70 rounded-[28px] p-6 border border-emerald-200/90 space-y-3">
              <h4 className="font-heading font-black text-sm text-[#135136] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#135136]" />
                <span>Perguntas Frequentes (FAQ)</span>
              </h4>

              <div className="space-y-3 text-xs text-stone-700">
                <div>
                  <strong className="text-stone-900 block">O credenciamento é gratuito?</strong>
                  <p className="text-stone-600">
                    Sim! O CaráFood é um projeto acadêmico de TCC sem fins lucrativos, com taxa zero para os quiosques e pequenos negócios da cidade.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-900 block">Como meu prato ganha o selo Caraguá a Gosto?</strong>
                  <p className="text-stone-600">
                    Estabelecimentos que competem nas edições oficiais do festival recebem o badge auditado após verificação da ficha técnica e dos insumos locais.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-900 block">Restaurantes fora da orla podem participar?</strong>
                  <p className="text-stone-600">
                    Com certeza! O objetivo primordial do sistema é contemplar todos os 53 bairros de Caraguatatuba, dando voz aos negócios de bairros periféricos e do interior.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 bg-[#135136] text-white py-8 px-4 text-center border-t-2 border-[#FFB703]/80">
        <p className="text-xs text-emerald-200">
          CaráFood • Canal Oficial de Atendimento e Credenciamento Comunitário.
        </p>
      </footer>
    </div>
  );
}
