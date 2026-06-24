import {
  Beer,
  Wine,
  GlassWater,
  Cigarette,
  Flame,
  Wind,
  Snowflake,
  Package,
  Gift,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IconProps = { className?: string };

// Mapeia nome do produto para o ícone mais relevante.
// Verifica keywords em ordem de especificidade (mais específico primeiro).
const RULES: { keywords: string[]; Icon: LucideIcon }[] = [
  { keywords: ["narguilé", "essência", "hookah"], Icon: Wind },
  { keywords: ["carvão"], Icon: Flame },
  { keywords: ["isqueiro"], Icon: Flame },
  { keywords: ["piteira", "cigarro", "charuto", "tabaco", "seda"], Icon: Cigarette },
  { keywords: ["gelo", "saco de gelo", "balde de gelo"], Icon: Snowflake },
  { keywords: ["combo", "kit"], Icon: Gift },
  { keywords: ["pilsen", "ipa", "weiss", "stout", "red ale", "lager", "cerveja", "long neck", "six pack", "lata", "brisa"], Icon: Beer },
  { keywords: ["whisky", "bourbon", "single malt", "blended"], Icon: GlassWater },
  { keywords: ["vodka", "gin", "tequila", "rum"], Icon: Wine },
  { keywords: ["cachaça", "saquê", "sakê", "sake", "licor"], Icon: GlassWater },
  { keywords: ["energético"], Icon: Zap },
];

const CATEGORY_FALLBACK: Record<string, LucideIcon> = {
  Cervejas: Beer,
  Destilados: Wine,
  Tabacaria: Cigarette,
  "Combos/Gelo": Package,
};

function iconFor(name: string, category: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.Icon;
  }
  return CATEGORY_FALLBACK[category] ?? Package;
}

export default function ProductIcon({ name, category, className = "h-14 w-14" }: IconProps & { name: string; category: string }) {
  const Icon = iconFor(name, category);
  return <Icon className={className} strokeWidth={1.5} />;
}
