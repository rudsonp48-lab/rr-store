'use client';

import React from 'react';

export type BrandLogoKey =
  | 'todos'
  | 'apple'
  | 'xiaomi'
  | 'poco'
  | 'realme'
  | 'samsung'
  | 'gamer'
  | 'jbl-audio'
  | 'smartwatches'
  | 'amazfit'
  | 'haylou'
  | 'ssd'
  | 'sandisk'
  | 'kingston';

interface BrandLogoProps {
  brand: BrandLogoKey;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Logos vetoriais oficiais de cada marca comercializada na RR Store.
 * Renderizados em alta definição (4K SVG) com as cores oficiais de cada fabricante.
 */
export default function BrandLogo({ brand, size = 'md', className = '' }: BrandLogoProps) {
  const boxClass =
    size === 'sm'
      ? 'w-4 h-4 rounded-[5px] shrink-0 inline-flex items-center justify-center overflow-hidden'
      : 'w-5 h-5 rounded-[6px] shrink-0 inline-flex items-center justify-center overflow-hidden shadow-xs';

  switch (brand) {
    case 'apple':
      return (
        <span
          className={`${boxClass} bg-white text-[#0A0A0A] border border-white/80 ${className}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.79-.96 2.84 1.04.08 2.08-.52 2.72-1.3Z" />
          </svg>
        </span>
      );

    case 'xiaomi':
      return (
        <span className={`${boxClass} bg-[#FF6900] text-white ${className}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M4.2 7.5h7.6c2.1 0 3.4 1.3 3.4 3.4v5.6h-2.6v-5.2c0-.8-.4-1.2-1.2-1.2H6.8v6.4H4.2V7.5zm4.5 3.2h2.5v5.8H8.7v-5.8zm8.5-3.2h2.6v9h-2.6v-9z" />
          </svg>
        </span>
      );

    case 'poco':
      return (
        <span
          className={`${boxClass} bg-[#FFD400] text-[#0A0A0A] font-black ${className}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <text
              x="12"
              y="15.2"
              textAnchor="middle"
              fill="#0A0A0A"
              fontSize="7.4"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.4"
            >
              POCO
            </text>
          </svg>
        </span>
      );

    case 'realme':
      return (
        <span className={`${boxClass} bg-[#FFC915] text-[#111115] ${className}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M6.5 5.5h6.2c2.9 0 4.8 1.6 4.8 4.1 0 1.8-1 3.2-2.6 3.8l3.1 5.1h-3.2l-2.7-4.6H9.3v4.6H6.5V5.5zm2.8 2.4v3.6h3.1c1.3 0 2.1-.7 2.1-1.8 0-1.1-.8-1.8-2.1-1.8H9.3z" />
          </svg>
        </span>
      );

    case 'samsung':
      return (
        <span className={`${boxClass} bg-[#1428A0] text-white ${className}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <ellipse
              cx="12"
              cy="12"
              rx="10"
              ry="5.2"
              transform="rotate(-14 12 12)"
              fill="none"
              stroke="white"
              strokeWidth="1.6"
            />
            <text
              x="12"
              y="14.5"
              textAnchor="middle"
              fill="white"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.3"
            >
              S
            </text>
          </svg>
        </span>
      );

    case 'gamer':
      return (
        <span className={`${boxClass} bg-[#00439C] text-white ${className}`} aria-hidden="true">
          {/* Logo Oficial PlayStation (PS) */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M9.5 4.2v14.9l3.3 1.1V7.6c0-.7.3-1.1.8-.9.6.2.7.7.7 1.4v5.2c2.2 1.1 4-.1 4-3.2 0-3-1.4-4.3-4.3-5.3-1.3-.4-3-.8-4.5-.6zm-1.1 11.4L4.2 17c-1.5.5-2.6 1.2-2.4 2.1.2 1 1.7 1.4 3.7 1l2.9-.8v-2.1l-2.1.6c-.8.2-1.5.1-1.6-.2-.1-.3.4-.6 1.2-.9l2.5-.9v-1.2zm11.8 1.2c-1.4-.5-3.1-.6-4.7-.1l-2.1.7v2.1l3.2-1c.8-.2 1.5-.1 1.6.2.1.3-.4.7-1.2.9l-3.6 1.2v2.1l4.8-1.5c1.7-.6 2.8-1.3 2.7-2.4-.1-1-.9-1.7-2.7-2.2z" />
          </svg>
        </span>
      );

    case 'jbl-audio':
      return (
        <span className={`${boxClass} bg-[#FF3300] text-white ${className}`} aria-hidden="true">
          {/* Logo Oficial JBL com ponto de exclamação superior */}
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <polygon points="5.2,3.2 8.4,3.2 6.8,6.2" fill="white" />
            <circle cx="6.8" cy="7.4" r="0.85" fill="white" />
            <text
              x="12"
              y="17.8"
              textAnchor="middle"
              fill="white"
              fontSize="8.8"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.5"
            >
              JBL
            </text>
          </svg>
        </span>
      );

    case 'smartwatches':
      return (
        <span
          className={`${boxClass} bg-[#18181B] text-white border border-white/25 ${className}`}
          aria-hidden="true"
        >
          {/* Apple Watch / Smartwatch Oficial Silhouette */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M8.5 2h7l.7 3.2c1.6.6 2.8 2.1 2.8 4v5.6c0 1.9-1.2 3.4-2.8 4L15.5 22h-7l-.7-3.2C6.2 18.2 5 16.7 5 14.8V9.2c0-1.9 1.2-3.4 2.8-4L8.5 2zm-1 7.2v5.6c0 1.2 1 2.2 2.2 2.2h4.6c1.2 0 2.2-1 2.2-2.2V9.2c0-1.2-1-2.2-2.2-2.2H9.7c-1.2 0-2.2 1-2.2 2.2zm12.2.3h1.1v2.6h-1.1V9.5z" />
          </svg>
        </span>
      );

    case 'amazfit':
      return (
        <span className={`${boxClass} bg-[#FF5500] text-white ${className}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M12 4L4.5 19h3.4l1.6-3.4h5l1.6 3.4h3.4L12 4zm0 5.4l1.5 3.4h-3L12 9.4z" />
          </svg>
        </span>
      );

    case 'haylou':
      return (
        <span className={`${boxClass} bg-[#00C853] text-[#0A0A0A] ${className}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M6 5h3.2v5.4h5.6V5H18v14h-3.2v-5.6H9.2V19H6V5z" />
          </svg>
        </span>
      );

    case 'ssd':
    case 'sandisk':
      return (
        <span className={`${boxClass} bg-[#E11D48] text-white ${className}`} aria-hidden="true">
          {/* Logo SanDisk / SSD */}
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <text
              x="12"
              y="15.5"
              textAnchor="middle"
              fill="white"
              fontSize="8.2"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.4"
            >
              SD
            </text>
          </svg>
        </span>
      );

    case 'kingston':
      return (
        <span
          className={`${boxClass} bg-[#111115] text-[#EF4444] border border-[#EF4444]/60 ${className}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M6 4.5h3.2v6.2l5.4-6.2h3.8l-6 6.8 6.4 8.2h-3.9l-4.7-6.2-1 1.1v5.1H6V4.5z" />
          </svg>
        </span>
      );

    case 'todos':
    default:
      return (
        <span
          className={`${boxClass} bg-[#0A0A0A] text-[#34D399] border border-[#34D399]/60 ${className}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <text
              x="12"
              y="15.5"
              textAnchor="middle"
              fill="#34D399"
              fontSize="8.2"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.5"
            >
              RR
            </text>
          </svg>
        </span>
      );
  }
}
