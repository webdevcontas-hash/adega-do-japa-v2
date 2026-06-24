export const CATEGORIES = ["Cervejas", "Destilados", "Tabacaria", "Combos/Gelo"] as const;

export type Category = (typeof CATEGORIES)[number];

export type OrderStatus = "PENDING" | "PAID" | "DELIVERED";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};
