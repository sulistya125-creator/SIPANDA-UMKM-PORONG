import React from 'react';
import { UMKMProfile } from '../types/umkm';

interface ProductArtworkProps {
  variant: UMKMProfile['artworkVariant'];
  title: string;
  className?: string;
}

const ARTWORK_PALETTE: Record<
  UMKMProfile['artworkVariant'],
  { bgFrom: string; bgTo: string; accent: string; secondary: string; label: string }
> = {
  bandeng: {
    bgFrom: '#EFF6FF',
    bgTo: '#DBEAFE',
    accent: '#1E3A8A',
    secondary: '#F59E0B',
    label: 'Olahan Tambak Porong',
  },
  petis: {
    bgFrom: '#FEF3C7',
    bgTo: '#FDE68A',
    accent: '#92400E',
    secondary: '#1E3A8A',
    label: 'Sari Udang Pilihan',
  },
  krupuk: {
    bgFrom: '#FFFBEB',
    bgTo: '#FEF3C7',
    accent: '#B45309',
    secondary: '#10B981',
    label: 'Camilan Gurih Renyah',
  },
  sambal: {
    bgFrom: '#FEF2F2',
    bgTo: '#FECACA',
    accent: '#991B1B',
    secondary: '#F59E0B',
    label: 'Bumbu & Sambal Rumahan',
  },
  jamu: {
    bgFrom: '#ECFDF5',
    bgTo: '#D1FAE5',
    accent: '#065F46',
    secondary: '#F59E0B',
    label: 'Jamu Rimpang Alami',
  },
  sinom: {
    bgFrom: '#F0FDF4',
    bgTo: '#DCFCE7',
    accent: '#166534',
    secondary: '#D97706',
    label: 'Minuman Segar Tradisional',
  },
  wedang: {
    bgFrom: '#FFF7ED',
    bgTo: '#FFEDD5',
    accent: '#9A3412',
    secondary: '#059669',
    label: 'Rempah Seduh Nusantara',
  },
  kue: {
    bgFrom: '#FEFCE8',
    bgTo: '#FEF08A',
    accent: '#854D0E',
    secondary: '#1E3A8A',
    label: 'Kue & Hantaran',
  },
  lumpur: {
    bgFrom: '#FFFBEB',
    bgTo: '#FDE68A',
    accent: '#78350F',
    secondary: '#10B981',
    label: 'Kuliner Khas Sidoarjo',
  },
  batik: {
    bgFrom: '#EFF6FF',
    bgTo: '#E0E7FF',
    accent: '#1E3A8A',
    secondary: '#D97706',
    label: 'Wastra & Batik Porong',
  },
  kulit: {
    bgFrom: '#F5F5F4',
    bgTo: '#E7E5E4',
    accent: '#44403C',
    secondary: '#B45309',
    label: 'Kriya Kulit Asli',
  },
  anyaman: {
    bgFrom: '#F0FDF4',
    bgTo: '#E2E8F0',
    accent: '#1E3A8A',
    secondary: '#059669',
    label: 'Kerajinan Tangan Desa',
  },
};

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  variant,
  title,
  className = '',
}) => {
  const palette = ARTWORK_PALETTE[variant] || ARTWORK_PALETTE.bandeng;

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        background: `linear-gradient(135deg, ${palette.bgFrom} 0%, ${palette.bgTo} 100%)`,
      }}
      role="img"
      aria-label={`Ilustrasi produk ${title}`}
    >
      <svg
        viewBox="0 0 400 260"
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle studio grid / architectural motif */}
        <defs>
          <pattern id={`grid-${variant}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={palette.accent}
              strokeOpacity="0.06"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="400" height="260" fill={`url(#grid-${variant})`} />

        {/* Studio podium base */}
        <ellipse cx="200" cy="206" rx="112" ry="18" fill={palette.accent} fillOpacity="0.1" />
        <ellipse cx="200" cy="202" rx="92" ry="12" fill="#FFFFFF" fillOpacity="0.65" />

        {/* Domain-specific crisp artwork */}
        {(variant === 'bandeng') && (
          <g>
            {/* Bamboo tray */}
            <rect x="108" y="136" width="184" height="58" rx="14" fill="#FFFFFF" stroke={palette.accent} strokeWidth="2.5" />
            <rect x="116" y="144" width="168" height="42" rx="9" fill="#FEF3C7" stroke={palette.secondary} strokeWidth="1.5" />
            {/* Stylized Bandeng fish */}
            <path
              d="M142 165 C168 144, 218 144, 246 165 C218 186, 168 186, 142 165 Z"
              fill={palette.accent}
              fillOpacity="0.88"
            />
            <polygon points="244,165 266,152 262,165 266,178" fill={palette.accent} />
            <circle cx="158" cy="162" r="3" fill="#FFFFFF" />
            <path d="M174 156 L178 174 M190 154 L194 176 M206 155 L210 175" stroke="#FDE68A" strokeWidth="1.8" strokeLinecap="round" />
            {/* Seal stamp */}
            <rect x="155" y="84" width="90" height="40" rx="6" fill="#FFFFFF" stroke={palette.accent} strokeWidth="2" />
            <line x1="168" y1="98" x2="232" y2="98" stroke={palette.accent} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="176" y1="110" x2="224" y2="110" stroke={palette.secondary} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {(variant === 'petis' || variant === 'sambal') && (
          <g>
            {/* Glass jar */}
            <rect x="156" y="76" width="88" height="18" rx="4" fill={palette.secondary} stroke={palette.accent} strokeWidth="2.5" />
            <rect x="150" y="94" width="100" height="104" rx="16" fill="#FFFFFF" stroke={palette.accent} strokeWidth="2.5" />
            <rect x="158" y="108" width="84" height="78" rx="10" fill={palette.accent} fillOpacity="0.85" />
            {/* Jar label */}
            <rect x="166" y="122" width="68" height="46" rx="4" fill="#FFFFFF" />
            <line x1="176" y1="136" x2="224" y2="136" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" />
            <line x1="182" y1="148" x2="218" y2="148" stroke={palette.secondary} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="200" cy="158" r="3" fill={palette.accent} />
          </g>
        )}

        {(variant === 'jamu' || variant === 'sinom' || variant === 'wedang') && (
          <g>
            {/* Two herbal bottles / pouch */}
            <rect x="136" y="72" width="24" height="14" rx="3" fill={palette.secondary} stroke={palette.accent} strokeWidth="2" />
            <path d="M132 86 L164 86 L172 114 L172 194 C172 198 168 200 164 200 L132 200 C128 200 124 198 124 194 L124 114 Z" fill="#FFFFFF" stroke={palette.accent} strokeWidth="2.5" />
            <rect x="130" y="120" width="36" height="72" rx="4" fill={palette.secondary} fillOpacity="0.85" />
            <rect x="134" y="136" width="28" height="34" rx="3" fill="#FFFFFF" />

            <rect x="218" y="64" width="26" height="14" rx="3" fill={palette.accent} />
            <path d="M214 78 L248 78 L258 108 L258 194 C258 198 254 200 248 200 L214 200 C208 200 204 198 204 194 L204 108 Z" fill="#FFFFFF" stroke={palette.accent} strokeWidth="2.5" />
            <rect x="210" y="112" width="42" height="80" rx="4" fill={palette.accent} fillOpacity="0.85" />
            <rect x="214" y="132" width="34" height="38" rx="3" fill="#FFFFFF" />
            <path d="M224 150 Q231 140 238 150 Q231 160 224 150 Z" fill={palette.secondary} />
          </g>
        )}

        {(variant === 'krupuk' || variant === 'kue' || variant === 'lumpur') && (
          <g>
            {/* Standing pouch or pastry box */}
            <path
              d="M142 74 L258 74 L268 192 C268 198 262 202 254 202 L146 202 C138 202 132 198 132 192 Z"
              fill="#FFFFFF"
              stroke={palette.accent}
              strokeWidth="2.5"
            />
            <line x1="144" y1="90" x2="256" y2="90" stroke={palette.secondary} strokeWidth="2.5" strokeDasharray="5 4" />
            <circle cx="200" cy="144" r="34" fill={palette.secondary} fillOpacity="0.22" stroke={palette.secondary} strokeWidth="2" />
            <circle cx="192" cy="140" r="14" fill={palette.accent} fillOpacity="0.82" />
            <circle cx="212" cy="148" r="12" fill={palette.secondary} fillOpacity="0.9" />
            <rect x="166" y="104" width="68" height="10" rx="3" fill={palette.accent} />
          </g>
        )}

        {variant === 'batik' && (
          <g>
            {/* Folded Batik fabric with Sidoarjo motif */}
            <rect x="116" y="80" width="168" height="114" rx="10" fill={palette.accent} />
            <rect x="128" y="92" width="144" height="90" rx="6" fill="#FFFFFF" fillOpacity="0.14" stroke={palette.secondary} strokeWidth="2" />
            {/* Batik geometric diamond & floral motifs */}
            <polygon points="164,137 184,114 204,137 184,160" fill="none" stroke={palette.secondary} strokeWidth="2.5" />
            <polygon points="204,137 224,114 244,137 224,160" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="184" cy="137" r="6" fill={palette.secondary} />
            <circle cx="224" cy="137" r="6" fill="#FFFFFF" />
            {/* Paper ribbon */}
            <rect x="182" y="78" width="36" height="118" fill="#FFFFFF" fillOpacity="0.92" />
            <line x1="190" y1="115" x2="210" y2="115" stroke={palette.accent} strokeWidth="2.5" />
            <line x1="190" y1="127" x2="210" y2="127" stroke={palette.secondary} strokeWidth="2.5" />
          </g>
        )}

        {(variant === 'kulit' || variant === 'anyaman') && (
          <g>
            {/* Handcrafted leather bag / woven basket */}
            <path d="M168 96 C168 68, 232 68, 232 96" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
            <rect x="130" y="96" width="140" height="100" rx="12" fill={palette.accent} />
            <path d="M130 120 Q200 144 270 120 L270 96 L130 96 Z" fill={palette.secondary} fillOpacity="0.9" />
            <rect x="188" y="126" width="24" height="18" rx="4" fill="#FFFFFF" stroke={palette.accent} strokeWidth="2" />
            <line x1="142" y1="176" x2="258" y2="176" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="6 4" />
          </g>
        )}

        {/* Crisp bottom caption */}
        <text
          x="200"
          y="238"
          textAnchor="middle"
          fill={palette.accent}
          fontSize="11"
          fontWeight="600"
          fontFamily="Plus Jakarta Sans, sans-serif"
          opacity="0.82"
        >
          {palette.label}
        </text>
      </svg>
    </div>
  );
};
