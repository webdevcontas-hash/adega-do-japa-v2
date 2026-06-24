import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "dashboard_session";

/**
 * Token de sessão = HMAC-SHA256 da senha com um segredo do servidor.
 * Assim a senha real NUNCA é gravada no cookie/navegador (ver SESSION_SECRET no .env).
 */
function sessionToken(): string | null {
  const password = process.env.DASHBOARD_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) return null;
  return createHmac("sha256", secret).update(password).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function isAuthenticated(): Promise<boolean> {
  const expected = sessionToken();
  if (!expected) return false;
  const got = (await cookies()).get(COOKIE_NAME)?.value;
  return !!got && safeEqual(got, expected);
}

export async function createDashboardSession(): Promise<void> {
  const token = sessionToken();
  if (!token) {
    throw new Error("DASHBOARD_PASSWORD ou SESSION_SECRET não configurados no .env");
  }
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
}
