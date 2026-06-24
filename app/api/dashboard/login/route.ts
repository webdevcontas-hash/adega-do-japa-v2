import { NextResponse } from "next/server";
import { createDashboardSession } from "@/lib/dashboard-auth";

export async function POST(request: Request) {
  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (typeof password !== "string" || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  await createDashboardSession();
  return NextResponse.json({ ok: true });
}
