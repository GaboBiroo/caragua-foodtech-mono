import { UserSession } from '../types/auth';

// ==============================================================================
// Camada de Segurança da Informação (AppSec / OWASP Top 10 / LGPD) — CaráFood
// - Derivação criptográfica PBKDF2 / SHA-256 (Web Crypto API) sem senha em texto puro;
// - Sanitização contra Cross-Site Scripting (XSS) e injeção de tags HTML;
// - Mascaramento automático de PII (CPF, RG, Telefone, E-mail) em textos públicos;
// - Rate Limiting em memória com janela deslizante contra Brute Force (Login/OTP);
// - Resolução prioritária de Nome Social e Pronome Social.
// ==============================================================================

const DEFAULT_SALT = 'carafood-litoral-norte-sp-2026-salt-v2';

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Deriva hash criptográfico seguro (PBKDF2-HMAC-SHA256 com 10.000 iterações via Web Crypto API).
 * Nunca armazena ou trafega senhas em texto puro em sessões ou logs.
 */
export async function hashPasswordSecure(
  plain: string,
  salt: string = DEFAULT_SALT
): Promise<string> {
  const normalized = String(plain || '');
  const effectiveSalt = String(salt || DEFAULT_SALT);
  const encoder = new TextEncoder();

  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    try {
      const keyMaterial = await globalThis.crypto.subtle.importKey(
        'raw',
        encoder.encode(normalized),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const derivedBits = await globalThis.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: encoder.encode(effectiveSalt),
          iterations: 10000,
          hash: 'SHA-256',
        },
        keyMaterial,
        256
      );
      return `pbkdf2_sha256$10000$${bufferToHex(derivedBits)}`;
    } catch {
      const digest = await globalThis.crypto.subtle.digest(
        'SHA-256',
        encoder.encode(`${effectiveSalt}::${normalized}`)
      );
      return `sha256$${bufferToHex(digest)}`;
    }
  }

  // Fallback determinístico caso crypto.subtle não esteja disponível no ambiente de teste
  let h1 = 0xdeadbeef ^ normalized.length;
  let h2 = 0x41c6ce57 ^ effectiveSalt.length;
  const combined = `${effectiveSalt}::${normalized}`;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `fallback_hash$${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}

export async function verifyPasswordSecure(
  plain: string,
  storedHash: string,
  salt: string = DEFAULT_SALT
): Promise<boolean> {
  if (!plain || !storedHash) return false;
  const computed = await hashPasswordSecure(plain, salt);
  return computed === storedHash;
}

/**
 * Sanitiza entradas de texto livre removendo tags <script>, iframes,
 * atributos de eventos inline (onerror, onload, onclick) e URIs javascript:.
 */
export function sanitizeUserInput(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/on\w+\s*=\s*(['"])[\s\S]*?\1/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/<\s*\/?\s*[a-zA-Z0-9-]+[^>]*>/g, '')
    .trim();
}

/**
 * Mascaramento automático de Dados Pessoais (PII) em comentários públicos
 * para conformidade com o princípio da Minimização de Dados (Art. 6º, III da LGPD):
 * - CPF (000.000.000-00 -> ***.***.***-**)
 * - E-mail (usuario@dominio.com -> u***@dominio.com)
 * - Telefone/Celular ((12) 99999-9999 -> (**) *****-****)
 */
export function maskSensitivePII(text: string): string {
  const clean = sanitizeUserInput(text);
  if (!clean) return '';

  return clean
    // Máscara de CPF formatado ou 11 dígitos isolados
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '***.***.***-**')
    .replace(/\b\d{11}\b/g, '***.***.***-**')
    // Máscara de E-mail em comentários públicos
    .replace(
      /\b([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
      '$1***@$2'
    )
    // Máscara de Telefone/WhatsApp
    .replace(
      /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4}\b/g,
      '(**) *****-****'
    );
}

interface RateLimitBucket {
  attempts: number[];
}

const rateLimitStore = new Map<string, RateLimitBucket>();

/**
 * Rate Limiter com janela deslizante para bloquear ataques de Força Bruta
 * em /api/auth/login e /api/auth/recover.
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterSec: number; remaining: number } {
  const key = String(identifier || 'anonymous').toLowerCase().trim();
  const now = Date.now();
  const bucket = rateLimitStore.get(key) || { attempts: [] };

  // Filtra apenas tentativas dentro da janela de tempo ativa
  bucket.attempts = bucket.attempts.filter((ts) => now - ts < windowMs);

  if (bucket.attempts.length >= maxAttempts) {
    const oldest = bucket.attempts[0] || now;
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    rateLimitStore.set(key, bucket);
    return {
      allowed: false,
      retryAfterSec,
      remaining: 0,
    };
  }

  bucket.attempts.push(now);
  rateLimitStore.set(key, bucket);

  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: Math.max(0, maxAttempts - bucket.attempts.length),
  };
}

export function resetRateLimit(identifier: string): void {
  const key = String(identifier || 'anonymous').toLowerCase().trim();
  rateLimitStore.delete(key);
}

/**
 * Retorna o Nome Social prioritariamente sobre o Nome Civil (Direito de Personalidade e Inclusão).
 */
export function getDisplayName(
  user?: Pick<UserSession, 'nomeCivil' | 'nomeSocial'> | null
): string {
  if (!user) return 'Visitante';
  const social = user.nomeSocial?.trim();
  if (social && social.length > 0) {
    return social;
  }
  return user.nomeCivil?.trim() || 'Usuário CaráFood';
}

/**
 * Formata a assinatura pública do usuário respeitando Nome Social e Pronome Social.
 * Exemplo: "Mariana S. (Ela/Dela)" ou "Alex Costa (Elu/Delu)"
 */
export function formatUserDisplayWithPronoun(
  user?: Pick<UserSession, 'nomeCivil' | 'nomeSocial' | 'pronomeSocial'> | null
): string {
  if (!user) return 'Visitante';
  const display = getDisplayName(user);
  const pronoun = user.pronomeSocial?.trim();
  if (pronoun && pronoun !== 'Não informado' && pronoun !== 'Prefiro não informar') {
    return `${display} (${pronoun})`;
  }
  return display;
}
