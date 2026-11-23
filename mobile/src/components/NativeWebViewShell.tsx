import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Share,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewOpenWindowEvent,
} from 'react-native-webview/lib/WebViewTypes';

// ==============================================================================
// Casca Nativa Híbrida (React Native WebView Shell) — CaráFood
// 1. Interceptação de Intents Externas (onShouldStartLoadWithRequest -> Linking.openURL):
//    Em /prato/[id], os botões "Traçar Rota no Maps" e "Chamar no WhatsApp"
//    disparam links externos (maps.google.com, waze.com, wa.me). O método
//    onShouldStartLoadWithRequest (aliado ao bridge CaraFoodNative e onOpenWindow)
//    abre esses esquemas fora do app via Linking.openURL para acionar o GPS e o
//    WhatsApp nativos do celular.
// 2. Botão Voltar Físico (Android BackHandler) & Safe Area (#0F382C):
//    Conecta o BackHandler ao histórico interno da WebView (incluindo rotas SPA
//    do Next.js) e respeita o SafeAreaView no topo verde (#0F382C) para não
//    sobrepor o relógio e a bateria do aparelho.
// ==============================================================================

const PRODUCTION_WEB_URL =
  process.env.EXPO_PUBLIC_WEB_URL || 'https://carafood.vercel.app';

const HEADER_GREEN = '#0F382C';
const SURFACE_CREAM = '#FAF7F2';

const EXTERNAL_INTENT_SCHEMES = [
  'tel:',
  'mailto:',
  'sms:',
  'geo:',
  'whatsapp:',
  'waze:',
  'comgooglemaps:',
  'intent:',
  'market:',
];

const EXTERNAL_INTENT_HOSTS = [
  'maps.google.com',
  'www.google.com/maps',
  'google.com/maps',
  'maps.app.goo.gl',
  'goo.gl/maps',
  'waze.com',
  'www.waze.com',
  'ul.waze.com',
  'wa.me',
  'api.whatsapp.com',
  'web.whatsapp.com',
  'chat.whatsapp.com',
];

export function isExternalIntentUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  const lower = rawUrl.trim().toLowerCase();

  if (
    lower.startsWith('about:') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('blob:')
  ) {
    return false;
  }

  if (EXTERNAL_INTENT_SCHEMES.some((scheme) => lower.startsWith(scheme))) {
    return true;
  }

  if (EXTERNAL_INTENT_HOSTS.some((host) => lower.includes(host))) {
    return true;
  }

  try {
    const parsed = new URL(rawUrl);
    const appHost = new URL(PRODUCTION_WEB_URL).hostname.toLowerCase();
    const targetHost = parsed.hostname.toLowerCase();
    if (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      targetHost !== appHost &&
      targetHost !== 'localhost' &&
      targetHost !== '127.0.0.1' &&
      !targetHost.endsWith('.vercel.app')
    ) {
      return true;
    }
  } catch {
    return true;
  }

  return false;
}

const INJECTED_NATIVE_BRIDGE_JS = `
(function() {
  window.isNativeApp = true;
  window.isCarFoodApp = true;
  window.CARAFOOD_NATIVE_VERSION = '2.4.0';

  function postToNative(type, payload) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
    }
  }

  window.CaraFoodNative = {
    isAvailable: true,
    version: '2.4.0',
    hapticSuccess: function() { postToNative('HAPTIC', { kind: 'success' }); },
    hapticError: function() { postToNative('HAPTIC', { kind: 'error' }); },
    hapticWarning: function() { postToNative('HAPTIC', { kind: 'warning' }); },
    hapticSelection: function() { postToNative('HAPTIC', { kind: 'selection' }); },
    hapticImpact: function(style) { postToNative('HAPTIC', { kind: 'impact', style: style || 'medium' }); },
    share: function(data) { postToNative('SHARE', data || {}); },
    openExternal: function(url) { postToNative('OPEN_EXTERNAL_URL', { url: url }); },
    postMessage: postToNative
  };

  function notifyHistoryState() {
    var canGoBack = window.history.length > 1 || (window.location.pathname && window.location.pathname !== '/');
    postToNative('NAV_STATE', {
      canGoBack: Boolean(canGoBack),
      pathname: window.location.pathname,
      href: window.location.href
    });
  }

  var origPushState = history.pushState;
  history.pushState = function() {
    var ret = origPushState.apply(this, arguments);
    notifyHistoryState();
    return ret;
  };

  var origReplaceState = history.replaceState;
  history.replaceState = function() {
    var ret = origReplaceState.apply(this, arguments);
    notifyHistoryState();
    return ret;
  };

  window.addEventListener('popstate', notifyHistoryState);
  window.addEventListener('DOMContentLoaded', notifyHistoryState);
  setTimeout(notifyHistoryState, 300);
})();
true;
`;

export interface NativeWebViewShellProps {
  initialPath?: string;
}

export const NativeWebViewShell: React.FC<NativeWebViewShellProps> = ({
  initialPath = '/',
}) => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const targetUri = `${PRODUCTION_WEB_URL.replace(/\/$/, '')}${
    initialPath.startsWith('/') ? initialPath : `/${initialPath}`
  }`;

  const openExternalNative = useCallback((url: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => {
      console.warn('[CaráFood Casca Nativa] Falha ao abrir intent externa:', url, err);
    });
  }, []);

  // Botão Voltar Físico (Android): conectado ao histórico interno da WebView
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBackPress = (): boolean => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress
    );

    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    let isSubRoute = false;
    try {
      const parsed = new URL(navState.url);
      isSubRoute = parsed.pathname !== '/' && parsed.pathname !== '';
    } catch {
      isSubRoute = false;
    }
    setCanGoBack(Boolean(navState.canGoBack || isSubRoute));
  }, []);

  // Interceptação de Intents Externas via onShouldStartLoadWithRequest -> Linking.openURL
  const handleShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      const { url } = request;
      if (!url) return false;

      if (isExternalIntentUrl(url)) {
        openExternalNative(url);
        return false;
      }

      return true;
    },
    [openExternalNative]
  );

  // Intercepta links com target="_blank" ou window.open na WebView
  const handleOpenWindow = useCallback(
    (syntheticEvent: WebViewOpenWindowEvent) => {
      const targetUrl = syntheticEvent.nativeEvent?.targetUrl;
      if (!targetUrl) return;
      if (isExternalIntentUrl(targetUrl)) {
        openExternalNative(targetUrl);
      } else {
        webViewRef.current?.injectJavaScript(
          `window.location.href = ${JSON.stringify(targetUrl)}; true;`
        );
      }
    },
    [openExternalNative]
  );

  // Recebe eventos da bridge injetada (OPEN_EXTERNAL_URL, NAV_STATE, SHARE)
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const raw = event.nativeEvent.data;
        if (!raw) return;
        const msg = JSON.parse(raw);
        const type = msg?.type;
        const payload = msg?.payload || msg;

        if (type === 'OPEN_EXTERNAL_URL' && payload?.url) {
          openExternalNative(String(payload.url));
        } else if (type === 'NAV_STATE') {
          setCanGoBack(Boolean(payload?.canGoBack));
        } else if (type === 'SHARE' && payload) {
          Share.share({
            title: payload.title || 'CaráFood',
            message: [payload.message, payload.url].filter(Boolean).join(' '),
            url: payload.url,
          }).catch(() => {});
        }
      } catch {
        // Ignora mensagens não-JSON
      }
    },
    [openExternalNative]
  );

  return (
    <SafeAreaProvider>
      {/* Safe Area Superior no verde (#0F382C) para não sobrepor relógio e bateria */}
      <SafeAreaView style={styles.topSafeArea} edges={['top', 'left', 'right']}>
        <RNStatusBar
          barStyle="light-content"
          backgroundColor={HEADER_GREEN}
          translucent={false}
        />

        <View style={styles.webViewContainer}>
          {hasError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Conexão Temporariamente Indisponível</Text>
              <Text style={styles.errorDescription}>
                Verifique sua conexão com a internet para carregar o catálogo real dos 53 bairros de Caraguatatuba.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                  webViewRef.current?.reload();
                }}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              source={{ uri: targetUri }}
              style={styles.webView}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              sharedCookiesEnabled
              allowsBackForwardNavigationGestures
              pullToRefreshEnabled
              setSupportMultipleWindows={false}
              injectedJavaScriptBeforeContentLoaded={INJECTED_NATIVE_BRIDGE_JS}
              onNavigationStateChange={handleNavigationStateChange}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              onOpenWindow={handleOpenWindow}
              onMessage={handleMessage}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}

          {isLoading && !hasError && (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color={HEADER_GREEN} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  topSafeArea: {
    flex: 1,
    backgroundColor: HEADER_GREEN,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: SURFACE_CREAM,
  },
  webView: {
    flex: 1,
    backgroundColor: SURFACE_CREAM,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 247, 242, 0.35)',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: SURFACE_CREAM,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#57534E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: HEADER_GREEN,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default NativeWebViewShell;
