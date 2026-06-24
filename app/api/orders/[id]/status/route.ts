import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";

const VALID_STATUSES = ["WAITING", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { deliveryStatus } = body as { deliveryStatus?: string };
  if (!deliveryStatus || !VALID_STATUSES.includes(deliveryStatus as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: "deliveryStatus inválido." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { deliveryStatus },
    select: { id: true, deliveryStatus: true },
  });

  return NextResponse.json(updated);
}
