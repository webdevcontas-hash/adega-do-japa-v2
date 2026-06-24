import { NextResponse } from "next/server";
import { createDashboardSession } from "@/lib/dashboard-auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  await createDashboardSession();
  return NextResponse.json({ ok: true });
}
