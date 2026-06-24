import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export async function GET(request: NextRequest) {
  const session = await getCustomerSession();
  const phone = request.nextUrl.searchParams.get("phone")?.trim();
  const email = session?.email;

  // Precisa de pelo menos uma identidade (e-mail logado ou telefone do dispositivo).
  const conditions: Array<{ phone?: string; email?: string }> = [];
  if (email) conditions.push({ email });
  if (phone) conditions.push({ phone });

  if (conditions.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  const orders = await prisma.order.findMany({
    where: { OR: conditions },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          price: true,
          product: { select: { id: true, name: true, price: true, isAvailable: true } },
        },
      },
    },
  });

  return NextResponse.json({ orders });
}
