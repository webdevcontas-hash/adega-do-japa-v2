"use client";

import { useState } from "react";
import type { ProductModel } from "@/app/generated/prisma/models";
import type { CartItem } from "@/lib/types";

export type CheckoutResult = {
  orderId: string;
  total: number;
  qrCode: string;
  qrCodeBase64: string;
};

/**
 * Estado e regras do carrinho, compartilhados entre as versões visuais da loja
 * (Storefront bege e StorefrontV1 vermelho). A lógica de checkout/Pix continua
 * no CartDrawer; aqui ficam apenas os itens e a manipulação de quantidade.
 */
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product: ProductModel, quantity = 1) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { productId: product.id, name: product.name, price: product.price, quantity }];
    });
  }

  function changeQuantity(productId: string, quantity: number) {
    setCart((current) => {
      if (quantity <= 0) return current.filter((item) => item.productId !== productId);
      return current.map((item) => (item.productId === productId ? { ...item, quantity } : item));
    });
  }

  function clear() {
    setCart([]);
  }

  /** Repõe itens de um pedido anterior (preço atual do catálogo), somando ao carrinho. */
  function reorder(items: CartItem[]) {
    setCart((current) => {
      const merged = [...current];
      for (const item of items) {
        const existing = merged.find((entry) => entry.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          merged.push({ ...item });
        }
      }
      return merged;
    });
  }

  return { cart, itemCount, subtotal, addToCart, changeQuantity, clear, reorder };
}
