'use client';

import React, { useState, useEffect } from 'react';

interface JacquinAvatarProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export const JacquinPraianoAvatar: React.FC<JacquinAvatarProps> = ({
  className = '',
  size = 64,
  interactive = true,
}) => {
  const [mouseOffset, setMouseOffset] = useState({ dx: 0, dy: 0 });

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xRatio = (e.clientX / innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / innerHeight - 0.5) * 2;
      setMouseOffset({
        dx: Math.max(-5, Math.min(5, xRatio * 5)),
        dy: Math.max(-4, Math.min(4, yRatio * 4)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  const drawFlower = (x: number, y: number, r: number) =>
    [0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<ellipse cx="${x}" cy="${y - r * 0.7}" rx="${r * 0.46}" ry="${r * 0.78}" transform="rotate(${a} ${x} ${y})"/>`
      )
      .join('') + `<circle cx="${x}" cy="${y}" r="${r * 0.24}" fill="#1F8A7D"/>`;

  const drawLeaf = (x: number, y: number, rot: number, l: number) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})" stroke="#FFFFFF" fill="none" stroke-linecap="round"><path d="M0 0V${-l}" stroke-width="2"/>${[
      0.25, 0.45, 0.65, 0.85,
    ]
      .map(
        (t) =>
          `<path d="M0 ${-l * t}q11 -3 17 ${-l * 0.1}M0 ${-l * t}q-11 -3 -17 ${-l * 0.1}" stroke-width="4"/>`
      )
      .join('')}</g>`;

  return (
    <div
      style={{ width: size, height: Math.round(size * 1.136) }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none group transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <svg
        width={size}
        height={Math.round(size * 1.136)}
        viewBox="0 0 220 250"
        role="img"
        aria-label="Chef Jacquin Praiano"
        className="overflow-visible drop-shadow-md"
      >
        <defs>
          <clipPath id={`avatar-clip-${size}`}>
            <ellipse cx="110" cy="125" rx="88" ry="104" />
          </clipPath>
        </defs>

        {/* Moldura Adesivo Oval: Contorno Preto, Borda Branca, Fundo Verde-Água #38A398 */}
        <ellipse cx="110" cy="125" rx="98" ry="114" fill="#18181B" />
        <ellipse cx="110" cy="125" rx="94" ry="110" fill="#FFFFFF" />
        <ellipse
          cx="110"
          cy="125"
          rx="88"
          ry="104"
          fill="#38A398"
          stroke="#18181B"
          strokeWidth="3"
        />

        {/* Camisa Havaiana e Corpo dentro do ClipPath */}
        <g clipPath={`url(#avatar-clip-${size})`}>
          <path
            d="M18 252C22 192 58 160 110 156C162 160 198 192 202 252Z"
            fill="#1F8A7D"
            stroke="#18181B"
            strokeWidth="3"
          />
          <g
            fill="#FFFFFF"
            dangerouslySetInnerHTML={{
              __html:
                drawFlower(52, 182, 14) +
                drawFlower(165, 205, 16) +
                drawFlower(135, 240, 13) +
                drawFlower(178, 168, 11) +
                drawFlower(34, 222, 12) +
                drawLeaf(150, 180, 38, 42) +
                drawLeaf(78, 238, -28, 34) +
                drawLeaf(184, 236, 24, 30),
            }}
          />
          {/* Gola V e Botões */}
          <path
            d="M98 152L84 170L110 238L136 170L122 152L110 196Z"
            fill="#197267"
            stroke="#18181B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M98 152L110 196L122 152Z"
            fill="#DFC19B"
            stroke="#18181B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M110 196V252" stroke="#18181B" strokeWidth="2.5" />
          <g fill="#18181B">
            <circle cx="110" cy="206" r="3.5" />
            <circle cx="110" cy="222" r="3.5" />
            <circle cx="110" cy="238" r="3.5" />
          </g>

          {/* Mão Fazendo Sinal Anatômico de Joinha (Thumbs-Up) */}
          <g
            className="transition-transform duration-300 origin-bottom group-hover:rotate-12"
            fill="#EAD2AC"
            stroke="#18181B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          >
            <rect x="62" y="198" width="36" height="9" rx="4.5" />
            <rect x="62" y="189" width="36" height="9" rx="4.5" />
            <rect x="62" y="180" width="36" height="9" rx="4.5" />
            <rect x="62" y="171" width="24" height="9" rx="4.5" />
            <rect x="63" y="148" width="12" height="28" rx="6" />
          </g>
        </g>

        {/* Rosto com Física de Parallax */}
        <g
          style={{
            transform: `translate(${mouseOffset.dx}px, ${mouseOffset.dy * 0.8}px)`,
            transition: 'transform 0.08s linear',
          }}
        >
          <rect
            x="100"
            y="138"
            width="20"
            height="20"
            fill="#DFC19B"
            stroke="#18181B"
            strokeWidth="2.5"
          />
          <ellipse cx="70" cy="112" rx="7" ry="11" fill="#EAD2AC" stroke="#18181B" strokeWidth="2.5" />
          <ellipse cx="150" cy="112" rx="7" ry="11" fill="#EAD2AC" stroke="#18181B" strokeWidth="2.5" />
          <ellipse cx="110" cy="112" rx="40" ry="34" fill="#EAD2AC" stroke="#18181B" strokeWidth="3" />
        </g>

        {/* Chapéu de Chef Francês Alto e Volumoso */}
        <g
          style={{
            transform: `translate(${mouseOffset.dx * 0.4}px, ${mouseOffset.dy * 0.3}px)`,
            transition: 'transform 0.08s linear',
          }}
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="3"
          strokeLinejoin="round"
        >
          <path d="M74 70C54 66 54 38 78 38C80 22 108 20 112 32C124 20 152 26 146 40C168 40 168 66 146 70Z" />
          <rect x="72" y="68" width="76" height="22" rx="3" />
          <path d="M80 68C78 60 84 60 83 68M137 68C136 60 142 60 140 68" fill="none" strokeWidth="2.5" />
        </g>

        {/* Óculos de Sol Quadrados com Dois Traços Brancos Diagonais de Reflexo */}
        <g
          style={{
            transform: `translate(${mouseOffset.dx * 1.5}px, ${mouseOffset.dy * 1.2}px)`,
            transition: 'transform 0.08s linear',
          }}
        >
          <rect
            x="78"
            y="93"
            width="28"
            height="22"
            rx="3"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="4.5"
            transform="rotate(-3 92 104)"
          />
          <rect
            x="114"
            y="93"
            width="28"
            height="22"
            rx="3"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="4.5"
            transform="rotate(3 128 104)"
          />
          <rect x="103" y="96" width="14" height="5" fill="#18181B" />
          {/* Traços de reflexo solar */}
          <path
            d="M84 100l7-3M88 105l7-3M120 97l7 3M124 102l7 3"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Bigode Castanho Volumoso Curvado nas Pontas */}
        <g
          style={{
            transform: `translate(${mouseOffset.dx}px, ${mouseOffset.dy * 0.8}px)`,
            transition: 'transform 0.08s linear',
          }}
        >
          <path
            d="M110 118C102 112 82 114 66 126C74 138 98 136 110 124C122 136 146 138 154 126C138 114 118 112 110 118Z"
            fill="#4A3728"
            stroke="#18181B"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};
