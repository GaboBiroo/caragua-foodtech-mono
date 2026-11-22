'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  UserCheck,
  Award,
  Download,
  Trash2,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatUserDisplayWithPronoun } from '../lib/security';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRONOUN_OPTIONS = [
  'Ela/Dela',
  'Ele/Dele',
  'Elu/Delu',
  'Não informado',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    user,
    updateProfileIdentity,
    exportMyDataJson,
    anonymizeAndDeleteMyAccount,
    logout,
  } = useAuth();

  const [nomeSocialInput, setNomeSocialInput] = useState('');
  const [nomeCivilInput, setNomeCivilInput] = useState('');
  const [pronomeInput, setPronomeInput] = useState('Ela/Dela');
  const [customPronounInput, setCustomPronounInput] = useState('');
  const [isCustomPronoun, setIsCustomPronoun] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNomeSocialInput(user.nomeSocial || '');
    setNomeCivilInput(user.nomeCivil || '');
    if (PRONOUN_OPTIONS.includes(user.pronomeSocial)) {
      setPronomeInput(user.pronomeSocial);
      setIsCustomPronoun(false);
    } else {
      setPronomeInput('Personalizado');
      setCustomPronounInput(user.pronomeSocial || '');
      setIsCustomPronoun(true);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPronoun = isCustomPronoun
      ? customPronounInput.trim() || 'Não informado'
      : pronomeInput;
    updateProfileIdentity({
      nomeCivil: nomeCivilInput,
      nomeSocial: nomeSocialInput,
      pronomeSocial: finalPronoun,
    });
    setFeedbackMsg(
      'Identidade, Nome Social e Pronome Social atualizados com sucesso!'
    );
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleExportLgpd = async () => {
    setBusyAction(true);
    const res = await exportMyDataJson();
    setBusyAction(false);
    if (res.ok) {
      setFeedbackMsg(
        `Arquivo de portabilidade LGPD (${res.filename || 'JSON'}) gerado e baixado!`
      );
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleAnonymizeAccount = async () => {
    setBusyAction(true);
    const res = await anonymizeAndDeleteMyAccount();
    setBusyAction(false);
    setConfirmDeleteOpen(false);
    if (res.ok) {
      onClose();
    }
  };

  const roleLabel =
    user.role === 'curador'
      ? 'Curadoria & Admin'
      : user.role === 'gestor'
      ? 'Gestor de Restaurante'
      : 'Comensal & Avaliador';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Perfil do Usuário, Nome Social e Central de Privacidade LGPD"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white w-full max-w-lg max-h-[90dvh] rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Cabeçalho do Perfil Logado */}
        <div className="bg-[#0F382C] text-white p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFB703] text-stone-950 font-heading font-black text-lg flex items-center justify-center shrink-0">
              {formatUserDisplayWithPronoun(user).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-1.5">
                <h2
                  data-testid="profile-modal-display-name"
                  className="font-heading font-black text-base sm:text-lg leading-tight"
                >
                  {formatUserDisplayWithPronoun(user)}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold">
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel do usuário"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo com Rolagem Interna */}
        <div className="p-5 overflow-y-auto space-y-5 text-stone-800">
          {feedbackMsg && (
            <div
              data-testid="profile-feedback-banner"
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Passaporte Gourmet & Salvos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Passaporte Gourmet</span>
              </div>
              <p
                data-testid="profile-modal-points"
                className="font-heading font-black text-2xl text-stone-900 mt-1"
              >
                {user.points} pts
              </p>
              <span className="text-[11px] text-stone-600 block">
                +50 pts por avaliação na Cédula
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
                <Bookmark className="w-4 h-4 text-[#135136]" />
                <span>Meu Roteiro Salvo</span>
              </div>
              <p className="font-heading font-black text-2xl text-stone-900 mt-1">
                {user.savedDishIds?.length || 0} pratos
              </p>
              <Link
                href="/"
                onClick={onClose}
                className="text-[11px] font-bold text-[#135136] hover:underline block"
              >
                Ver pratos no catálogo →
              </Link>
            </div>
          </div>

          {/* 1. Nome Social e Pronome Social */}
          <form
            onSubmit={handleSaveIdentity}
            className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#135136]" />
              <h3 className="font-heading font-black text-sm text-stone-900">
                Identidade, Nome Social &amp; Pronome Social
              </h3>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Se preenchido, seu <strong>Nome Social</strong> e seu <strong>Pronome Social</strong> serão exibidos prioritariamente na barra superior, no Passaporte Gourmet e nas avaliações da Cédula Oficial.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Nome Social (Como prefere ser chamado)
                </label>
                <input
                  type="text"
                  value={nomeSocialInput}
                  onChange={(e) => setNomeSocialInput(e.target.value)}
                  placeholder="Ex: Alex Costa"
                  data-testid="profile-input-nome-social"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:outline-none focus:border-[#135136]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Nome Completo (Registro Civil)
                </label>
                <input
                  type="text"
                  value={nomeCivilInput}
                  onChange={(e) => setNomeCivilInput(e.target.value)}
                  data-testid="profile-input-nome-civil"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:outline-none focus:border-[#135136]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Pronome Social
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[...PRONOUN_OPTIONS, 'Personalizado'].map((opt) => {
                  const active = isCustomPronoun
                    ? opt === 'Personalizado'
                    : pronomeInput === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (opt === 'Personalizado') {
                          setIsCustomPronoun(true);
                          setPronomeInput('Personalizado');
                        } else {
                          setIsCustomPronoun(false);
                          setPronomeInput(opt);
                        }
                      }}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                        active
                          ? 'bg-[#135136] text-white border-[#135136]'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isCustomPronoun && (
                <input
                  type="text"
                  value={customPronounInput}
                  onChange={(e) => setCustomPronounInput(e.target.value)}
                  placeholder="Digite seu pronome (ex: Ile/Dile)"
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                />
              )}
            </div>

            <button
              type="submit"
              data-testid="profile-save-identity-btn"
              className="w-full py-2.5 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>Salvar Nome Social e Pronome</span>
            </button>
          </form>

          {/* 2. Direitos do Titular LGPD (Art. 18 — Portabilidade e Esquecimento) */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#135136]" />
              <h3 className="font-heading font-black text-sm text-stone-900">
                Seus Direitos de Privacidade (Art. 18 da LGPD)
              </h3>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Você tem controle integral sobre seus dados pessoais. Exporte uma cópia estruturada em JSON ou solicite a anonimização e exclusão imediata da sua conta.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={busyAction}
                onClick={handleExportLgpd}
                data-testid="lgpd-export-json-btn"
                className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-[#135136] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Meus Dados (JSON)</span>
              </button>

              {!confirmDeleteOpen ? (
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => setConfirmDeleteOpen(true)}
                  data-testid="lgpd-delete-account-trigger"
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Anonimizar / Excluir Conta</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={handleAnonymizeAccount}
                  data-testid="lgpd-confirm-delete-btn"
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Exclusão LGPD</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Sair da Conta */}
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            data-testid="profile-logout-btn"
            className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sair da Conta (Encerrar Sessão)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
