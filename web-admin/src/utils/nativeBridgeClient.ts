/**
 * CaráFood Web - Cliente da Bridge Nativa Móvel
 * 
 * Permite que componentes React e páginas do Next.js se comuniquem perfeitamente
 * com a casca nativa do aplicativo móvel quando executados dentro do CaráFood Mobile.
 */

declare global {
  interface Window {
    isNativeApp?: boolean;
    isCarFoodApp?: boolean;
    CARAFOOD_NATIVE_VERSION?: string;
    CaraFoodNative?: {
      isAvailable: boolean;
      version: string;
      hapticSuccess: () => void;
      hapticError: () => void;
      hapticWarning: () => void;
      hapticSelection: () => void;
      hapticImpact: (style?: "light" | "medium" | "heavy") => void;
      share: (data: { title?: string; message: string; url?: string }) => void;
      openExternal: (url: string) => void;
      postMessage: (type: string, payload?: any, callbackId?: string) => void;
    };
  }
}

/**
 * Verifica se a aplicação web está sendo executada dentro da casca nativa móvel.
 */
export function isRunningInNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.isNativeApp || window.isCarFoodApp || window.CaraFoodNative?.isAvailable);
}

/**
 * Dispara vibração tátil de sucesso ao adicionar item ao carrinho ou confirmar ação.
 */
export function triggerHapticSuccess(): void {
  if (typeof window !== "undefined" && window.CaraFoodNative) {
    window.CaraFoodNative.hapticSuccess();
  }
}

/**
 * Dispara vibração tátil de erro ao falhar pagamento ou validação de formulário.
 */
export function triggerHapticError(): void {
  if (typeof window !== "undefined" && window.CaraFoodNative) {
    window.CaraFoodNative.hapticError();
  }
}

/**
 * Dispara vibração tátil de seleção em tabs, switches ou seleções de prato.
 */
export function triggerHapticSelection(): void {
  if (typeof window !== "undefined" && window.CaraFoodNative) {
    window.CaraFoodNative.hapticSelection();
  }
}

/**
 * Dispara vibração tátil com intensidade customizada.
 */
export function triggerHapticImpact(style: "light" | "medium" | "heavy" = "medium"): void {
  if (typeof window !== "undefined" && window.CaraFoodNative) {
    window.CaraFoodNative.hapticImpact(style);
  }
}

/**
 * Abre a folha de compartilhamento nativa do sistema operacional (WhatsApp, Instagram, etc.).
 */
export function shareViaNativeSheet(data: { title?: string; message: string; url?: string }): void {
  if (typeof window !== "undefined" && window.CaraFoodNative) {
    window.CaraFoodNative.share(data);
  } else if (typeof navigator !== "undefined" && navigator.share) {
    // Fallback para Web Share API padrão do navegador
    navigator.share(data).catch(() => {});
  }
}
