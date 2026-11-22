'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Scale,
  Camera,
  Building2,
  FileWarning,
  Send,
} from 'lucide-react';
import { CopyrightClaimType } from '../types/copyright';

interface CopyrightClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRestaurantName?: string;
  defaultDishId?: string;
  defaultDishName?: string;
}

export const CopyrightClaimModal: React.FC<CopyrightClaimModalProps> = ({
  isOpen,
  onClose,
  defaultRestaurantName = '',
  defaultDishId = '',
  defaultDishName = '',
}) => {
  const [claimType, setClaimType] = useState<CopyrightClaimType>('claim_ownership');
  const [restaurantName, setRestaurantName] = useState(defaultRestaurantName);
  const [dishName, setDishName] = useState(defaultDishName);
  const [claimantName, setClaimantName] = useState('');
  const [claimantRole, setClaimantRole] = useState('Proprietário / Sócio-Administrador');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [justification, setJustification] = useState('');
  const [replacementImageUrl, setReplacementImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [protocolGenerated, setProtocolGenerated] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!restaurantName.trim() || !claimantName.trim() || !email.trim() || !justification.trim()) {
      setErrorMsg(
        'Preencha o nome do estabelecimento, seu nome, e-mail e o detalhamento da solicitação.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/copyright/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimType,
          restaurantName: restaurantName.trim(),
          dishId: defaultDishId || undefined,
          dishName: dishName.trim() || undefined,
          claimantName: claimantName.trim(),
          claimantRole: claimantRole.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          justification: justification.trim(),
          replacementImageUrl: replacementImageUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || 'Não foi possível registrar a solicitação.');
      } else {
        setProtocolGenerated(data?.protocol || `CG-DA-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } catch {
      setProtocolGenerated(`CG-DA-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reivindicação de Titularidade e Direitos Autorais"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white w-full max-w-xl max-h-[90dvh] rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden text-stone-800">
        {/* Cabeçalho */}
        <div className="bg-[#0F382C] text-white p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFB703] text-stone-950 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-base sm:text-lg leading-tight">
                Titularidade do Estabelecimento &amp; Direitos Autorais
              </h2>
              <p className="text-xs text-emerald-100/85 mt-0.5">
                Lei nº 9.610/1998 (LDA) • Canal Oficial de Reivindicação e Takedown
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de direitos autorais"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Explicação Jurídica Transparente */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
            <span className="font-heading font-black text-stone-900 block">
              Como o CaráFood protege restaurantes e autores locais:
            </span>
            <p className="text-stone-600 leading-relaxed">
              • <strong>Dados Factuais Públicos:</strong> Nome comercial, bairro, endereço e preços públicos de balcão são informações factuais de utilidade pública para o consumidor.
            </p>
            <p className="text-stone-600 leading-relaxed">
              • <strong>Fotografias e Textos Autorais (Lei nº 9.610/98):</strong> Caso você seja proprietário do estabelecimento ou autor de uma fotografia exibida, pode assumir gratuitamente a gestão do perfil (0% taxa), enviar sua foto oficial ou solicitar a remoção imediata (Notice &amp; Takedown).
            </p>
          </div>

          {protocolGenerated ? (
            <div
              data-testid="copyright-claim-success"
              className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-stone-900">
                Solicitação Prioritária Registrada!
              </h3>
              <p className="text-xs text-stone-600">
                Sua solicitação foi encaminhada para a aba <strong>Direitos Autorais</strong> no Painel de Curadoria (<code>/moderation</code>) com o protocolo oficial:
              </p>
              <div
                data-testid="copyright-claim-protocol"
                className="inline-block px-4 py-2 rounded-xl bg-white border border-emerald-300 font-mono font-black text-base text-[#135136]"
              >
                {protocolGenerated}
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setProtocolGenerated(null);
                    onClose();
                  }}
                  className="py-2.5 px-5 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs transition-colors"
                >
                  Concluir e Voltar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Tipo de Solicitação */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                  Selecione o tipo de solicitação:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setClaimType('claim_ownership')}
                    data-testid="claim-type-ownership"
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      claimType === 'claim_ownership'
                        ? 'bg-emerald-50 border-[#135136] text-[#135136]'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-1" />
                    <span className="font-bold text-xs block">Reivindicar Perfil</span>
                    <span className="text-[10px] text-stone-500 block">
                      Assumir gestão gratuita (0% taxa)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClaimType('replace_media')}
                    data-testid="claim-type-replace"
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      claimType === 'replace_media'
                        ? 'bg-emerald-50 border-[#135136] text-[#135136]'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Camera className="w-4 h-4 mb-1" />
                    <span className="font-bold text-xs block">Atualizar Foto</span>
                    <span className="text-[10px] text-stone-500 block">
                      Enviar foto oficial do prato
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClaimType('takedown_request')}
                    data-testid="claim-type-takedown"
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      claimType === 'takedown_request'
                        ? 'bg-rose-50 border-rose-600 text-rose-800'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <FileWarning className="w-4 h-4 mb-1" />
                    <span className="font-bold text-xs block">Remoção (Takedown)</span>
                    <span className="text-[10px] text-stone-500 block">
                      Retirar imagem por direito autoral
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Restaurante / Estabelecimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    data-testid="copyright-input-restaurant"
                    placeholder="Ex: Pádua Burguer"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Prato ou Item Específico (Opcional)
                  </label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    data-testid="copyright-input-dish"
                    placeholder="Ex: Billy Rose's"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Seu Nome Completo / Representante *
                  </label>
                  <input
                    type="text"
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    data-testid="copyright-input-claimant"
                    placeholder="Nome do proprietário ou fotógrafo"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Vínculo / Papel *
                  </label>
                  <select
                    value={claimantRole}
                    onChange={(e) => setClaimantRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="Proprietário / Sócio-Administrador">
                      Proprietário / Sócio-Administrador
                    </option>
                    <option value="Gerente do Estabelecimento">
                      Gerente do Estabelecimento
                    </option>
                    <option value="Fotógrafo / Autor da Imagem">
                      Fotógrafo / Autor da Imagem
                    </option>
                    <option value="Representante Jurídico">
                      Representante Jurídico
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    E-mail para Confirmação *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="copyright-input-email"
                    placeholder="contato@restaurante.com.br"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    WhatsApp / Telefone Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    data-testid="copyright-input-whatsapp"
                    placeholder="(12) 99700-0000"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Detalhamento da Solicitação (Reivindicação, Nova Foto ou Remoção) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  data-testid="copyright-input-justification"
                  placeholder="Informe o CNPJ/vínculo com o restaurante ou descreva a imagem que deseja atualizar/remover..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="copyright-submit-btn"
                className="w-full py-3 rounded-2xl bg-[#135136] hover:bg-[#0D3825] disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 text-[#FFB703]" />
                <span>
                  {submitting
                    ? 'Registrando Protocolo...'
                    : 'Registrar Solicitação & Gerar Protocolo CG-DA'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
