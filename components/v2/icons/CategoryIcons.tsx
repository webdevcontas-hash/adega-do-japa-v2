// Ícones SVG profissionais para cada categoria da Adega do Japa.
// Estilo: stroke ilustrativo, currentColor, responsivos via className.

type IconProps = { className?: string };

export function CervejasIcon({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* caneca */}
      <path d="M10 14h22l-3 26H13L10 14z" />
      {/* alça */}
      <path d="M32 20h4a4 4 0 0 1 0 8h-4" />
      {/* espuma */}
      <ellipse cx="14" cy="14" rx="2.5" ry="3" fill="currentColor" opacity=".35" />
      <ellipse cx="21" cy="12" rx="3.5" ry="3.5" fill="currentColor" opacity=".35" />
      <ellipse cx="28" cy="14" rx="2.5" ry="3" fill="currentColor" opacity=".35" />
      {/* bolhas */}
      <line x1="16" y1="30" x2="16" y2="24" strokeOpacity=".5" />
      <line x1="21" y1="34" x2="21" y2="26" strokeOpacity=".5" />
      <line x1="26" y1="30" x2="26" y2="22" strokeOpacity=".5" />
    </svg>
  );
}

export function DestiladosIcon({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* garrafa corpo */}
      <path d="M18 6h12v8l4 8v18a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V22l4-8V6z" />
      {/* rótulo */}
      <rect x="14" y="26" width="20" height="10" rx="1" strokeOpacity=".5" />
      {/* linhas rótulo */}
      <line x1="18" y1="29" x2="30" y2="29" strokeOpacity=".4" />
      <line x1="18" y1="32" x2="27" y2="32" strokeOpacity=".4" />
      {/* gargalo */}
      <line x1="18" y1="6" x2="30" y2="6" />
      {/* reflexo */}
      <line x1="20" y1="10" x2="20" y2="22" strokeOpacity=".3" />
    </svg>
  );
}

export function TabacariaIcon({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* base do narguilé */}
      <ellipse cx="24" cy="38" rx="10" ry="4" />
      {/* recipiente líquido */}
      <path d="M14 38V28a10 10 0 0 1 10-10 10 10 0 0 1 10 10v10" />
      {/* haste/tubo central */}
      <line x1="24" y1="18" x2="24" y2="10" />
      {/* cabeça (tigela) */}
      <path d="M19 10h10a2 2 0 0 1 0 4H19a2 2 0 0 1 0-4z" />
      {/* mangueira */}
      <path d="M14 32 Q4 30 6 20 Q8 10 14 12" strokeDasharray="2 2" />
      {/* brasa/fumaça */}
      <path d="M16 8 Q18 4 20 6 Q22 8 20 10" strokeOpacity=".5" />
      <path d="M20 6 Q22 2 24 4 Q26 6 24 8" strokeOpacity=".3" />
    </svg>
  );
}

export function CombosGeloIcon({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* balde */}
      <path d="M10 18h28l-4 24H14L10 18z" />
      {/* borda do balde */}
      <rect x="8" y="14" width="32" height="6" rx="3" />
      {/* alça */}
      <path d="M16 14 Q24 6 32 14" />
      {/* garrafa dentro do balde */}
      <rect x="19" y="4" width="10" height="18" rx="3" fill="none" />
      <rect x="21" y="2" width="6" height="4" rx="1" />
      {/* cubos de gelo */}
      <rect x="11" y="26" width="6" height="6" rx="1" strokeOpacity=".6" />
      <rect x="20" y="28" width="6" height="6" rx="1" strokeOpacity=".6" />
      <rect x="31" y="26" width="6" height="6" rx="1" strokeOpacity=".6" />
      {/* brilho gelo */}
      <line x1="13" y1="28" x2="15" y2="30" strokeOpacity=".4" strokeWidth="1.5" />
      <line x1="22" y1="30" x2="24" y2="32" strokeOpacity=".4" strokeWidth="1.5" />
    </svg>
  );
}
