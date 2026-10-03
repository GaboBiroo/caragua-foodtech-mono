import React, { ReactNode } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';

// Interoperabilidade do NativeWind v4 para componentes de terceiros
// Permite que o BlurView aceite classes do Tailwind diretamente através da prop className
cssInterop(BlurView, { className: 'style' });

export interface GlassCardProps extends ViewProps {
  /**
   * Conteúdo interno do cartão. Renderizado em uma camada superior
   * isolada do desfoque para garantir legibilidade tipográfica máxima.
   */
  children: ReactNode;
  /**
   * Intensidade do desfoque (blur). Valores entre 1 e 100.
   * O padrão de 50 fornece o equilíbrio ideal entre translucidez e legibilidade.
   */
  intensity?: number;
  /**
   * Tonalidade óptica da refração. Adapta-se ao tema global do sistema
   * ou força uma matiz específica.
   */
  tint?: 'light' | 'dark' | 'default' | 'transparent';
  /**
   * Classes utilitárias opcionais passadas via NativeWind.
   */
  className?: string;
}

/**
 * Componente GlassCard
 *
 * Implementação atômica do design system "Liquid Glass".
 * Emprega uma view base com transbordamento oculto, bordas arredondadas severas
 * (rounded-3xl) e um filete de borda para simular luz refratada.
 * A view de conteúdo é elevada (z-index) para não ser contaminada pelo algoritmo de
 * desfoque.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 50,
  tint = 'light',
  className = '',
  ...props
}) => {
  // A borda ultra-fina (0.5px ou 1px) e a opacidade em 20% mimetizam a refração do vidro.
  const glassContainerClasses = `overflow-hidden rounded-3xl border border-white/20 shadow-lg ${className}`;

  return (
    <View className={glassContainerClasses} {...props}>
      <BlurView
        intensity={intensity}
        tint={tint}
        // Background levemente pigmentado auxilia o contraste em imagens muito claras
        className="absolute inset-0 bg-white/10"
        style={StyleSheet.absoluteFill}
      />
      {/* Contêiner de isolamento. Mantém a tipografia nítida (Inter/San Francisco) */}
      <View className="relative z-10 flex-1 p-5">
        {children}
      </View>
    </View>
  );
};

export default GlassCard;
