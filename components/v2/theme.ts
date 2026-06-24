// Configuração visual do tema V2 por categoria real do catálogo.
// Mantém a identidade de cores/emoji da referência "delivery-japa",
// adaptada às categorias reais (Cervejas, Destilados, Tabacaria, Combos/Gelo).

export type CategoryTheme = {
  text: string;
  badge: string;
  btn: string;
  emoji: string;
};

export const CATEGORY_THEME: Record<string, CategoryTheme> = {
  Cervejas: { text: "text-amber-600", badge: "bg-amber-50 text-amber-700", btn: "bg-amber-500 hover:bg-amber-600", emoji: "🍺" },
  Destilados: { text: "text-purple-800", badge: "bg-purple-50 text-purple-800", btn: "bg-purple-800 hover:bg-purple-900", emoji: "🥃" },
  Tabacaria: { text: "text-slate-800", badge: "bg-slate-100 text-slate-800", btn: "bg-slate-800 hover:bg-slate-900", emoji: "💨" },
  "Combos/Gelo": { text: "text-red-600", badge: "bg-red-50 text-red-600", btn: "bg-red-600 hover:bg-red-700", emoji: "🧊" },
};

export const DEFAULT_THEME: CategoryTheme = {
  text: "text-orange-600",
  badge: "bg-orange-50 text-orange-600",
  btn: "bg-orange-500 hover:bg-orange-600",
  emoji: "🍾",
};

export function themeFor(category: string): CategoryTheme {
  return CATEGORY_THEME[category] ?? DEFAULT_THEME;
}
