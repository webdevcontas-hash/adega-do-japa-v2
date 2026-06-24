export const CATEGORIES = ["Cervejas", "Destilados", "Tabacaria", "Combos/Gelo"] as const;

export type Category = (typeof CATEGORIES)[number];

export type OrderStatus = "PENDING" | "PAID" | "DELIVERED";

export type DeliveryStatus = "WAITING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";

export type KitItem = { productId: string; quantity: number; name: string; price: number };

export type Kit = {
  id: number;
  name: string;
  description: string | null;
  emoji: string;
  items: KitItem[];
  total: number;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

/** Perfil leve do cliente, salvo no próprio dispositivo (localStorage). */
export type CustomerProfile = {
  name: string;
  phone: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
};

/** Identidade vinda do login com Google (sessão no servidor). */
export type CustomerSessionUser = {
  email: string;
  name: string;
  picture?: string;
};
