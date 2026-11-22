import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

// ==============================================================================
// Casca Nativa Híbrida (React Native WebView Shell) — CaráFood
// 1. Interceptação de Intents Externas (onShouldStartLoadWithRequest -> Linking.openURL):
//    Em /prato/[id], os botões "Traçar Rota no Maps" e "Chamar no WhatsApp"
//    disparam links para maps.google.com, waze.com, wa.me, api.whatsapp.com,
//    tel:, mailto:, geo: e cardápios externos. A WebView intercepta esses esquemas
//    e aciona os aplicativos nativos de GPS e WhatsApp do celular.
// 2. Botão Voltar Físico (Android BackHandler) & Safe Area (#0F382C):
//    Conecta o BackHandler ao histórico interno da WebView (canGoBack / goBack)
//    e aplica SafeAreaView com topo verde escuro (#0F382C) para nunca sobrepor
//    o relógio, o notch ou o indicador de bateria do aparelho.
// ==============================================================================

const PRODUCTION_WEB_URL =
  process.env.EXPO_PUBLIC_WEB_URL || 'https://foddtech.vercel.app';

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

function isExternalIntentUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  const lower = rawUrl.trim().toLowerCase();

  // Ignora URLs internas do navegador/WebView
  if (lower.startsWith('about:') || lower.startsWith('javascript:') || lower.startsWith('data:')) {
    return false;
  }

  // 1. Esquemas nativos diretos (whatsapp://, geo:, tel:, mailto:, waze://, intent://)
  if (EXTERNAL_INTENT_SCHEMES.some((scheme) => lower.startsWith(scheme))) {
    return true;
  }

  // 2. Domínios de GPS (Google Maps / Waze), WhatsApp (wa.me) ou links fora da aplicação CaráFood
  if (EXTERNAL_INTENT_HOSTS.some((host) => lower.includes(host))) {
    return true;
  }

  // 3. Qualquer link HTTP/HTTPS externo ao domínio principal da aplicação (ex.: cardápio original Anota AI / Goomer / Instagram)
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

  // Botão Voltar Físico (Android): navega no histórico interno da WebView antes de fechar o app
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBackPress = (): boolean => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Evento consumido pela WebView
      }
      return false; // Comportamento padrão do SO na tela raiz
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress
    );

    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(Boolean(navState.canGoBack));
  }, []);

  // Interceptação de Intents Externas (Maps, Waze, WhatsApp, Telefone, Cardápio Original)
  const handleShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      const { url } = request;
      if (!url) return false;

      if (isExternalIntentUrl(url)) {
        Linking.openURL(url).catch((err) => {
          console.warn('[CaráFood Casca Nativa] Falha ao abrir intent externa:', url, err);
        });
        return false; // Impede a WebView de carregar o link externo internamente
      }

      return true;
    },
    []
  );

  return (
    <SafeAreaProvider>
      {/* Safe Area Superior no verde oficial (#0F382C) protegendo relógio, notch e bateria */}
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
              onNavigationStateChange={handleNavigationStateChange}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
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
