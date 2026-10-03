import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

export function JacquinPraianoAvatar({ size = 56, className = "" }: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-lg ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="ovalAquaGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="70%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#115e59" />
          </radialGradient>
          <linearGradient id="hatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>

        {/* Moldura Oval Verde-Agua Praiano */}
        <rect width="120" height="120" rx="60" fill="url(#ovalAquaGrad)" />
        <circle cx="60" cy="60" r="57" stroke="#5eead4" strokeWidth="2.5" opacity="0.8" />

        {/* Camisa Havaiana Verde com Estampa Floral Caicara */}
        <path d="M22 120 C 22 92, 40 85, 60 85 C 80 85, 98 92, 98 120 Z" fill="url(#shirtGrad)" />
        <path d="M48 88 L 60 102 L 72 88 Z" fill="url(#skinGrad)" />
        <circle cx="36" cy="100" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="84" cy="100" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="60" cy="112" r="3.5" fill="#ffffff" opacity="0.8" />
        <path d="M34 104 Q 38 108 42 104" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.8" />
        <path d="M78 104 Q 82 108 86 104" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.8" />

        {/* Rosto Carismatico do Chef */}
        <circle cx="60" cy="62" r="22" fill="url(#skinGrad)" />

        {/* Bigode Castanho Curvado Volumoso */}
        <path
          d="M44 68 C 50 63, 56 68, 60 66 C 64 68, 70 63, 76 68 C 80 72, 74 76, 60 72 C 46 76, 40 72, 44 68 Z"
          fill="#5c3826"
        />

        {/* Oculos Escuros Quadrados Pretos */}
        <rect x="41" y="52" width="16" height="11" rx="2.5" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <rect x="63" y="52" width="16" height="11" rx="2.5" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <line x1="57" y1="56" x2="63" y2="56" stroke="#0f172a" strokeWidth="2" />
        <line x1="43" y1="54" x2="49" y2="60" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="65" y1="54" x2="71" y2="60" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

        {/* Chapeu de Chef Branco Alto */}
        <path
          d="M38 46 C 30 38, 36 22, 48 20 C 52 14, 68 14, 72 20 C 84 22, 90 38, 82 46 Z"
          fill="url(#hatGrad)"
        />
        <rect x="42" y="44" width="36" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        <line x1="48" y1="48" x2="72" y2="48" stroke="#0d9488" strokeWidth="1" strokeLinecap="round" />

        {/* Mao Fazendo Sinal de Positivo Joinha */}
        <g transform="translate(82, 76)">
          <circle cx="10" cy="12" r="9" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="0.5" />
          <rect x="7" y="0" width="6" height="10" rx="3" fill="url(#skinGrad)" />
          <circle cx="10" cy="2" r="3" fill="url(#skinGrad)" />
          <line x1="8" y1="8" x2="13" y2="8" stroke="#c2410c" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}
