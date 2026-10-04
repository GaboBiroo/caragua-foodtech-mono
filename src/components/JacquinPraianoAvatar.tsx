import React from 'react';

interface JacquinAvatarProps {
  className?: string;
  size?: number;
}

export const JacquinPraianoAvatar: React.FC<JacquinAvatarProps> = ({
  className = '',
  size = 64,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(42,157,143,0.35)]"
      >
        <defs>
          {/* Gradiente de Fundo Oval Verde-Água Praiano */}
          <linearGradient id="bgGrad" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E3A34" />
            <stop offset="50%" stopColor="#132E29" />
            <stop offset="100%" stopColor="#0B1A17" />
          </linearGradient>

          {/* Gradiente Borda Verde-Água #2A9D8F */}
          <linearGradient id="borderGrad" x1="30" y1="10" x2="170" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="45%" stopColor="#2A9D8F" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Gradiente Chapéu de Chef */}
          <linearGradient id="hatGrad" x1="100" y1="20" x2="100" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Gradiente Camisa Havaiana Esmeralda */}
          <linearGradient id="shirtGrad" x1="100" y1="140" x2="100" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        {/* 1. MOLDURA OVAL PRINCIPAL (Verde-Água #2A9D8F com borda dupla) */}
        <ellipse cx="100" cy="100" rx="90" ry="90" fill="url(#bgGrad)" />
        <ellipse cx="100" cy="100" rx="90" ry="90" stroke="url(#borderGrad)" strokeWidth="5.5" />
        <ellipse cx="100" cy="100" rx="83" ry="83" stroke="#6EE7B7" strokeWidth="1.2" strokeDasharray="5 3" opacity="0.6" />

        {/* 2. CAMISA HAVAIANA VERDE-ESMERALDA COM ESTAMPAS TROPICAIS */}
        <g id="shirt">
          <path
            d="M 46 150 Q 100 138 154 150 Q 166 182 168 190 Q 100 200 32 190 Q 34 182 46 150 Z"
            fill="url(#shirtGrad)"
          />
          {/* Gola da Camisa */}
          <path d="M 78 143 L 100 162 L 72 166 Z" fill="#047857" />
          <path d="M 122 143 L 100 162 L 128 166 Z" fill="#047857" />
          {/* Estampas de Flores Tropicais e Folhas Brancas */}
          <path d="M 58 160 Q 64 154 70 160 Q 64 166 58 160 Z" fill="#FFFFFF" opacity="0.75" />
          <circle cx="64" cy="160" r="2.5" fill="#FEF08A" />
          <path d="M 132 162 Q 138 156 144 162 Q 138 168 132 162 Z" fill="#FFFFFF" opacity="0.75" />
          <circle cx="138" cy="162" r="2.5" fill="#FEF08A" />
          <path d="M 88 178 Q 94 172 100 178 Q 94 184 88 178 Z" fill="#FFFFFF" opacity="0.7" />
          <circle cx="94" cy="178" r="2" fill="#FEF08A" />
          {/* Folhas de Palmeira Brancas */}
          <path d="M 44 174 Q 52 168 58 176" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
          <path d="M 148 175 Q 140 170 134 178" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
          {/* Botões Centrais */}
          <circle cx="100" cy="174" r="2" fill="#F8FAFC" />
          <circle cx="100" cy="186" r="2" fill="#F8FAFC" />
        </g>

        {/* 3. ROSTO & PESCOÇO CAIÇARA */}
        <g id="head">
          {/* Pescoço */}
          <rect x="88" y="132" width="24" height="20" rx="6" fill="#F5D0A9" />
          {/* Cabeça */}
          <ellipse cx="100" cy="116" rx="34" ry="30" fill="#F5D0A9" />
          {/* Orelhas */}
          <ellipse cx="65" cy="116" rx="5" ry="8" fill="#E8B888" />
          <ellipse cx="135" cy="116" rx="5" ry="8" fill="#E8B888" />
          {/* Boca Sorrindo Sutil */}
          <path d="M 92 134 Q 100 139 108 134" stroke="#8D5B4C" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* 4. CHAPÉU DE CHEF FRANCÊS (TOQUE BLANCHE VOLUMOSO COM VINCos) */}
        <g id="chef-hat">
          {/* Faixa Base do Chapéu */}
          <rect x="74" y="86" width="52" height="13" rx="4" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
          {/* Cúpula Alta com Dobras e Pregas */}
          <path
            d="M 73 87 C 62 80 56 60 70 48 C 76 42 86 42 90 46 C 94 36 106 36 110 46 C 114 42 124 42 130 48 C 144 60 138 80 127 87 Z"
            fill="url(#hatGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Vincos de Volume no Tecido */}
          <path d="M 86 52 Q 88 74 88 86" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 100 44 Q 100 70 100 86" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 114 52 Q 112 74 112 86" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        </g>

        {/* 5. ÓCULOS ESCUROS QUADRADOS PRETOS COM REFLEXO DIAGONAL */}
        <g id="sunglasses">
          {/* Ponte Central */}
          <rect x="96" y="107" width="8" height="3.5" rx="1" fill="#18181B" />
          {/* Lente e Armação Esquerda */}
          <rect x="73" y="101" width="24" height="18" rx="4" fill="#09090B" stroke="#18181B" strokeWidth="2.5" />
          {/* Reflexo Branco Diagonal Lente Esquerda */}
          <path d="M 85 103 L 94 103 L 89 116 L 80 116 Z" fill="#FFFFFF" opacity="0.45" />
          <path d="M 76 107 L 79 107 L 76 114 L 73 114 Z" fill="#FFFFFF" opacity="0.3" />

          {/* Lente e Armação Direita */}
          <rect x="103" y="101" width="24" height="18" rx="4" fill="#09090B" stroke="#18181B" strokeWidth="2.5" />
          {/* Reflexo Branco Diagonal Lente Direita */}
          <path d="M 115 103 L 124 103 L 119 116 L 110 116 Z" fill="#FFFFFF" opacity="0.45" />
          <path d="M 106 107 L 109 107 L 106 114 L 103 114 Z" fill="#FFFFFF" opacity="0.3" />
        </g>

        {/* 6. BIGODE CASTANHO ESCURO ESPESSO & CURVADO (ESTILO JACQUIN) */}
        <g id="mustache">
          <path
            d="M 100 123
               C 92 120 74 121 72 131
               C 74 135 84 133 93 129
               C 98 127 100 125 100 125
               C 100 125 102 127 107 129
               C 116 133 126 135 128 131
               C 126 121 108 120 100 123 Z"
            fill="#3E2723"
            stroke="#271612"
            strokeWidth="1.2"
          />
          {/* Pontas Curvadas Para Cima */}
          <path d="M 72 131 Q 68 127 69 123" stroke="#3E2723" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 128 131 Q 132 127 131 123" stroke="#3E2723" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* 7. MÃO COM SINAL DE POSITIVO ("JOINHA") NA LATERAL DIREITA */}
        <g id="thumbs-up">
          {/* Polegar Para Cima */}
          <path
            d="M 152 148 C 152 140 156 134 160 134 C 163 134 165 138 165 146 L 165 155 Z"
            fill="#F5D0A9"
            stroke="#E8B888"
            strokeWidth="1.2"
          />
          {/* Punho Fechado */}
          <rect x="146" y="152" width="20" height="18" rx="6" fill="#F5D0A9" stroke="#E8B888" strokeWidth="1.2" />
          {/* Dobras dos Dedos */}
          <path d="M 150 157 L 162 157" stroke="#D79E72" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 150 162 L 162 162" stroke="#D79E72" strokeWidth="1.2" strokeLinecap="round" />
          {/* Unha do Polegar */}
          <ellipse cx="161" cy="138" rx="2" ry="2.5" fill="#FFE8D6" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
};
