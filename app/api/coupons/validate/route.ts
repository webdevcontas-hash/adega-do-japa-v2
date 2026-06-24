import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { code, orderTotal } = body as { code?: string; orderTotal?: number };
  if (!code || typeof orderTotal !== "number") {
    return NextResponse.json({ error: "code e orderTotal são obrigatórios." }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, message: "Cupom inválido ou expirado." });
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, message: "Cupom esgotado." });
  }
  if (orderTotal < coupon.minOrder) {
    return NextResponse.json({
      valid: false,
      message: `Pedido mínimo de R$ ${coupon.minOrder.toFixed(2).replace(".", ",")} para este cupom.`,
    });
  }

  const discount =
    coupon.type === "percent"
      ? Math.round(orderTotal * (coupon.value / 100) * 100) / 100
      : Math.min(coupon.value, orderTotal);

  return NextResponse.json({ valid: true, discount, couponId: coupon.id, message: "Cupom aplicado!" });
}
