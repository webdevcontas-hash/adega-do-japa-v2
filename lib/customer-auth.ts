import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "customer_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export type CustomerSession = {
  email: string;
  name: string;
  picture?: string;
  exp: number; // epoch em segundos
};

function getSecret(): string | null {
  return process.env.SESSION_SECRET ?? null;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Serializa e assina a sessão: `<payload-base64url>.<assinatura-base64url>`. */
export function serializeSession(session: CustomerSession): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payloadB64 = base64url(JSON.stringify(session));
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export function parseSession(token: string | undefined): CustomerSession | null {
  const secret = getSecret();
  if (!secret || !token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  if (!safeEqual(signature, sign(payloadB64, secret))) return null;
  try {
    const session = JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as CustomerSession;
    if (!session.exp || session.exp * 1000 < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return parseSession(token);
}

export async function createCustomerSession(data: Omit<CustomerSession, "exp">): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const token = serializeSession({ ...data, exp });
  if (!token) throw new Error("SESSION_SECRET não configurado");
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearCustomerSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/** O login com Google só aparece/funciona quando as credenciais estão configuradas. */
export function isGoogleConfigured(): boolean {
  return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET && !!process.env.SESSION_SECRET;
}
