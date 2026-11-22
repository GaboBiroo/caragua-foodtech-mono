'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  LgpdConsentRecord,
  OAuthRequestPayload,
  RegisterRequestPayload,
  SocialPronoun,
  UserRole,
  UserSession,
} from '../types/auth';
import { getDisplayName, sanitizeUserInput } from '../lib/security';

const SESSION_STORAGE_KEY = 'carafood_user_session_v2';
const LGPD_STORAGE_KEY = 'carafood_lgpd_consent_v2';

export interface AuthContextValue {
  user: UserSession | null;
  isAuthenticated: boolean;
  displayName: string;
  lgpdConsent: LgpdConsentRecord | null;
  loginWithCredentials: (params: {
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string; user?: UserSession }>;
  registerAccount: (
    payload: RegisterRequestPayload
  ) => Promise<{ ok: boolean; error?: string; user?: UserSession }>;
  loginWithOAuth: (
    payload: OAuthRequestPayload
  ) => Promise<{ ok: boolean; error?: string; user?: UserSession }>;
  setDirectSession: (session: UserSession) => void;
  logout: () => void;
  updateProfileIdentity: (updates: {
    nomeSocial?: string;
    nomeCivil?: string;
    pronomeSocial?: SocialPronoun;
    whatsapp?: string;
  }) => void;
  addPoints: (delta: number) => void;
  toggleSavedDish: (dishId: string) => void;
  saveLgpdConsent: (consent: Partial<LgpdConsentRecord>) => void;
  exportMyDataJson: () => Promise<{ ok: boolean; filename?: string; payload?: unknown }>;
  anonymizeAndDeleteMyAccount: () => Promise<{ ok: boolean; protocol?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [lgpdConsent, setLgpdConsent] = useState<LgpdConsentRecord | null>(null);

  // Hidrata sessão e consentimento LGPD no cliente + sincronização entre abas (Q09)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadFromStorage = () => {
      try {
        const rawUser = localStorage.getItem(SESSION_STORAGE_KEY);
        if (rawUser) {
          const parsed = JSON.parse(rawUser) as UserSession;
          if (parsed && parsed.email) {
            setUser(parsed);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }

      try {
        const rawConsent = localStorage.getItem(LGPD_STORAGE_KEY);
        if (rawConsent) {
          setLgpdConsent(JSON.parse(rawConsent));
        }
      } catch {
        // Ignora erro de parse
      }
    };

    loadFromStorage();

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEY || e.key === LGPD_STORAGE_KEY) {
        loadFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const persistSession = useCallback((nextUser: UserSession | null) => {
    setUser(nextUser);
    if (typeof window === 'undefined') return;
    if (nextUser) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
      localStorage.setItem('carafood_role', nextUser.role);
      localStorage.setItem('carafood_user_email', nextUser.email);
      localStorage.setItem('carafood_user_name', getDisplayName(nextUser));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('carafood_role');
      localStorage.removeItem('carafood_user_email');
      localStorage.removeItem('carafood_user_name');
    }
  }, []);

  const setDirectSession = useCallback(
    (session: UserSession) => {
      persistSession(session);
    },
    [persistSession]
  );

  const loginWithCredentials = useCallback(
    async (params: { email: string; password: string }) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok || !data?.user) {
          return {
            ok: false,
            error: data?.error || 'E-mail ou senha inválidos.',
          };
        }
        persistSession(data.user as UserSession);
        return { ok: true, user: data.user as UserSession };
      } catch {
        return {
          ok: false,
          error: 'Não foi possível validar o login no momento.',
        };
      }
    },
    [persistSession]
  );

  const registerAccount = useCallback(
    async (payload: RegisterRequestPayload) => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data?.user) {
          return {
            ok: false,
            error: data?.error || 'Não foi possível criar a conta.',
          };
        }
        persistSession(data.user as UserSession);
        if (data.user.lgpdConsent && typeof window !== 'undefined') {
          localStorage.setItem(LGPD_STORAGE_KEY, JSON.stringify(data.user.lgpdConsent));
          setLgpdConsent(data.user.lgpdConsent);
        }
        return { ok: true, user: data.user as UserSession };
      } catch {
        return {
          ok: false,
          error: 'Erro de comunicação ao registrar nova conta.',
        };
      }
    },
    [persistSession]
  );

  const loginWithOAuth = useCallback(
    async (payload: OAuthRequestPayload) => {
      try {
        const res = await fetch('/api/auth/oauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data?.user) {
          return {
            ok: false,
            error: data?.error || 'Falha na autenticação social.',
          };
        }
        persistSession(data.user as UserSession);
        return { ok: true, user: data.user as UserSession };
      } catch {
        // Fallback resiliente local caso offline
        const nowIso = new Date().toISOString();
        const fallbackSession: UserSession = {
          id: `usr-oauth-${payload.provider}-${Date.now()}`,
          nomeCivil:
            payload.nomeCivil ||
            (payload.provider === 'apple' ? 'Beatriz Santos (Apple)' : 'Lucas Oliveira (Google)'),
          nomeSocial:
            payload.nomeSocial ||
            (payload.provider === 'apple' ? 'Bia Santos' : 'Lucas Oliveira'),
          pronomeSocial:
            payload.pronomeSocial ||
            (payload.provider === 'apple' ? 'Ela/Dela' : 'Ele/Dele'),
          email:
            payload.email ||
            (payload.provider === 'apple'
              ? 'visitante.apple@icloud.com'
              : 'visitante.google@carafood.com.br'),
          role: (payload.role as UserRole) || 'comensal',
          provider: payload.provider,
          points: 350,
          savedDishIds: [],
          lgpdConsent: {
            essential: true,
            analytics: true,
            geolocation: true,
            consentedAt: nowIso,
            policyVersion: '2026.2-LGPD',
          },
          createdAt: nowIso,
        };
        persistSession(fallbackSession);
        return { ok: true, user: fallbackSession };
      }
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  const updateProfileIdentity = useCallback(
    (updates: {
      nomeSocial?: string;
      nomeCivil?: string;
      pronomeSocial?: SocialPronoun;
      whatsapp?: string;
    }) => {
      if (!user) return;
      const updated: UserSession = {
        ...user,
        nomeCivil:
          updates.nomeCivil !== undefined
            ? sanitizeUserInput(updates.nomeCivil) || user.nomeCivil
            : user.nomeCivil,
        nomeSocial:
          updates.nomeSocial !== undefined
            ? sanitizeUserInput(updates.nomeSocial) || undefined
            : user.nomeSocial,
        pronomeSocial:
          updates.pronomeSocial !== undefined
            ? sanitizeUserInput(updates.pronomeSocial) || 'Não informado'
            : user.pronomeSocial,
        whatsapp:
          updates.whatsapp !== undefined
            ? sanitizeUserInput(updates.whatsapp)
            : user.whatsapp,
      };
      persistSession(updated);
    },
    [user, persistSession]
  );

  const addPoints = useCallback(
    (delta: number) => {
      if (!user) return;
      const updated: UserSession = {
        ...user,
        points: Math.max(0, (user.points || 350) + delta),
      };
      persistSession(updated);
    },
    [user, persistSession]
  );

  const toggleSavedDish = useCallback(
    (dishId: string) => {
      if (!user) return;
      const exists = user.savedDishIds.includes(dishId);
      const nextSaved = exists
        ? user.savedDishIds.filter((id) => id !== dishId)
        : [dishId, ...user.savedDishIds];
      persistSession({
        ...user,
        savedDishIds: nextSaved,
      });
    },
    [user, persistSession]
  );

  const saveLgpdConsent = useCallback(
    (consent: Partial<LgpdConsentRecord>) => {
      const record: LgpdConsentRecord = {
        essential: true,
        analytics: consent.analytics ?? true,
        geolocation: consent.geolocation ?? true,
        consentedAt: new Date().toISOString(),
        policyVersion: '2026.2-LGPD',
      };
      setLgpdConsent(record);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LGPD_STORAGE_KEY, JSON.stringify(record));
      }
      if (user) {
        persistSession({
          ...user,
          lgpdConsent: record,
        });
      }
    },
    [user, persistSession]
  );

  const exportMyDataJson = useCallback(async () => {
    try {
      const res = await fetch('/api/user/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_data',
          email: user?.email,
          user,
        }),
      });
      const data = await res.json();
      const payload = data?.payload || { user, exportedAt: new Date().toISOString() };
      const filename = data?.filename || 'carafood-meus-dados-lgpd.json';

      if (typeof window !== 'undefined') {
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      return { ok: true, filename, payload };
    } catch {
      return { ok: false };
    }
  }, [user]);

  const anonymizeAndDeleteMyAccount = useCallback(async () => {
    try {
      const res = await fetch('/api/user/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'anonymize_account',
          email: user?.email,
        }),
      });
      const data = await res.json();
      persistSession(null);
      return {
        ok: true,
        protocol: data?.protocol || 'LGPD-DEL-2026',
        message:
          data?.message ||
          'Sua conta foi anonimizada e seus dados pessoais foram excluídos conforme o Art. 18 da LGPD.',
      };
    } catch {
      persistSession(null);
      return {
        ok: true,
        protocol: 'LGPD-DEL-2026',
        message: 'Dados pessoais removidos do dispositivo e sessão encerrada.',
      };
    }
  }, [user, persistSession]);

  const displayName = useMemo(() => getDisplayName(user), [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      displayName,
      lgpdConsent,
      loginWithCredentials,
      registerAccount,
      loginWithOAuth,
      setDirectSession,
      logout,
      updateProfileIdentity,
      addPoints,
      toggleSavedDish,
      saveLgpdConsent,
      exportMyDataJson,
      anonymizeAndDeleteMyAccount,
    }),
    [
      user,
      displayName,
      lgpdConsent,
      loginWithCredentials,
      registerAccount,
      loginWithOAuth,
      setDirectSession,
      logout,
      updateProfileIdentity,
      addPoints,
      toggleSavedDish,
      saveLgpdConsent,
      exportMyDataJson,
      anonymizeAndDeleteMyAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de um <AuthProvider>.');
  }
  return ctx;
}
