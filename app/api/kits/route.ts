import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const kits = await prisma.kit.findMany({ where: { active: true } });

  const allProductIds = kits.flatMap((kit) => {
    const items = JSON.parse(kit.items) as { productId: string; quantity: number }[];
    return items.map((i) => i.productId);
  });

  const products = await prisma.product.findMany({
    where: { id: { in: allProductIds }, isAvailable: true },
    select: { id: true, name: true, price: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const expandedKits = kits.map((kit) => {
    const rawItems = JSON.parse(kit.items) as { productId: string; quantity: number }[];
    const items = rawItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return { productId: item.productId, quantity: item.quantity, name: product.name, price: product.price };
      })
      .filter(Boolean);

    const total = items.reduce((sum, item) => sum + item!.price * item!.quantity, 0);

    return { id: kit.id, name: kit.name, description: kit.description, emoji: kit.emoji, items, total };
  });

  return NextResponse.json(expandedKits);
}
