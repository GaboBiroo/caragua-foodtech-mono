/**
 * CaráFood Web - Cliente da Bridge Nativa Móvel (React Native WebView)
 *
 * Permite que componentes React e páginas do Next.js (como /prato/[id])
 * acionem Intents Externas nativas (Google Maps, Waze, WhatsApp via Linking.openURL),
 * sincronizem o histórico com o BackHandler do Android e respeitem a SafeAreaView (#0F382C).
 */

declare global {
  interface Window {
    isNativeApp?: boolean;
    isCarFoodApp?: boolean;
    CARAFOOD_NATIVE_VERSION?: string;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    CaraFoodNative?: {
      isAvailable: boolean;
      version: string;
      hapticSuccess: () => void;
      hapticError: () => void;
      hapticWarning: () => void;
      hapticSelection: () => void;
      hapticImpact: (style?: 'light' | 'medium' | 'heavy') => void;
      share: (data: { title?: string; message: string; url?: string }) => void;
      openExternal: (url: string) => void;
      postMessage: (type: string, payload?: unknown, callbackId?: string) => void;
    };
  }
}

const EXTERNAL_INTENT_PATTERNS = [
  'maps.google.com',
  'google.com/maps',
  'maps.app.goo.gl',
  'goo.gl/maps',
  'waze.com',
  'wa.me',
  'api.whatsapp.com',
  'whatsapp://',
  'geo:',
  'tel:',
  'mailto:',
  'intent://',
];

/**
 * Verifica se a aplicação web está sendo executada dentro da casca nativa móvel (React Native WebView).
 */
export function isRunningInNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.isNativeApp ||
      window.isCarFoodApp ||
      window.CaraFoodNative?.isAvailable ||
      window.ReactNativeWebView
  );
}

/**
 * Verifica se uma URL corresponde a uma Intent Externa (Google Maps, Waze, WhatsApp, Telefone, etc.).
 */
export function isExternalIntentLink(url: string): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (EXTERNAL_INTENT_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(url, window.location.origin);
      if (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        parsed.hostname !== window.location.hostname &&
        !parsed.hostname.endsWith('.vercel.app') &&
        parsed.hostname !== 'localhost'
      ) {
        return true;
      }
    } catch {
      return true;
    }
  }
  return false;
}

/**
 * Abre links externos (ex.: "Traçar Rota no Maps" e "Chamar no WhatsApp" em /prato/[id])
 * garantindo que, dentro da Casca Nativa React Native, o link dispare o app nativo
 * (via onShouldStartLoadWithRequest / Linking.openURL) em vez de ficar preso em target="_blank".
 */
export function openExternalIntent(
  url: string,
  event?: { preventDefault?: () => void; stopPropagation?: () => void }
): void {
  if (!url || typeof window === 'undefined') return;

  triggerHapticSelection();

  // 1. Se a bridge CaraFoodNative estiver injetada, usa openExternal diretamente
  if (window.CaraFoodNative?.openExternal) {
    event?.preventDefault?.();
    window.CaraFoodNative.openExternal(url);
    return;
  }

  // 2. Se estiver em uma ReactNativeWebView padrão:
  // remove o comportamento de popup (target="_blank") e navega no frame principal
  // para que o onShouldStartLoadWithRequest intercepte e chame Linking.openURL(url),
  // além de notificar via postMessage caso a casca escute onMessage.
  if (window.ReactNativeWebView) {
    event?.preventDefault?.();
    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'OPEN_EXTERNAL_URL', url })
      );
    } catch {
      // Continua para o fallback de navegação
    }
    window.location.href = url;
    return;
  }
}

export function triggerHapticSuccess(): void {
  if (typeof window !== 'undefined' && window.CaraFoodNative) {
    window.CaraFoodNative.hapticSuccess();
  }
}

export function triggerHapticError(): void {
  if (typeof window !== 'undefined' && window.CaraFoodNative) {
    window.CaraFoodNative.hapticError();
  }
}

export function triggerHapticSelection(): void {
  if (typeof window !== 'undefined' && window.CaraFoodNative) {
    window.CaraFoodNative.hapticSelection();
  }
}

export function triggerHapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium'): void {
  if (typeof window !== 'undefined' && window.CaraFoodNative) {
    window.CaraFoodNative.hapticImpact(style);
  }
}

export function shareViaNativeSheet(data: { title?: string; message: string; url?: string }): void {
  if (typeof window !== 'undefined' && window.CaraFoodNative) {
    window.CaraFoodNative.share(data);
  } else if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share(data).catch(() => {});
  }
}
