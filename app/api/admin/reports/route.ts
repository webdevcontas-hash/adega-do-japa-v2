import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";

// Pedidos que contam como venda real (pagos ou já entregues)
const SOLD_STATUSES = ["PAID", "DELIVERED"];

type Range = "today" | "7d" | "30d" | "all";

function startOf(range: Range): Date | null {
  const now = new Date();
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (range === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null; // all
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as Range;
  const from = startOf(range);

  const where = {
    status: { in: SOLD_STATUSES },
    ...(from ? { createdAt: { gte: from } } : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: { items: { include: { product: true } } },
  });

  const orderCount = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

  // ── Produtos mais vendidos ──────────────────────────────────────────────
  const productAgg = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const name = it.product?.name ?? "Produto removido";
      const cur = productAgg.get(it.productId) ?? { name, quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.price * it.quantity;
      productAgg.set(it.productId, cur);
    }
  }
  const topProducts = [...productAgg.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // ── Pedidos por horário do dia (0-23) ───────────────────────────────────
  const ordersByHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0, revenue: 0 }));
  for (const o of orders) {
    const h = new Date(o.createdAt).getHours();
    ordersByHour[h].count += 1;
    ordersByHour[h].revenue += o.total;
  }

  // ── Receita por dia (para o período) — data LOCAL, igual ao agrupamento por hora ──
  const dailyAgg = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    const dt = new Date(o.createdAt);
    const day = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const cur = dailyAgg.get(day) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += o.total;
    dailyAgg.set(day, cur);
  }
  const daily = [...dailyAgg.entries()]
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    range,
    totalRevenue,
    orderCount,
    avgTicket,
    topProducts,
    ordersByHour,
    daily,
  });
}
