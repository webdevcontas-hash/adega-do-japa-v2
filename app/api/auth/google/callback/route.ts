import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForUser } from "@/lib/google-oauth";
import { createCustomerSession, isGoogleConfigured } from "@/lib/customer-auth";

const STATE_COOKIE = "g_oauth_state";

function homeUrl(request: NextRequest, params?: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;
  return `${base.replace(/\/$/, "")}/${params ?? ""}`;
}

export async function GET(request: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(homeUrl(request, "?login=indisponivel"));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  // Erro do consentimento ou CSRF (state divergente): volta sem logar.
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(homeUrl(request, "?login=erro"));
  }

  try {
    const user = await exchangeCodeForUser(code);
    await createCustomerSession({ email: user.email, name: user.name, picture: user.picture });
    return NextResponse.redirect(homeUrl(request, "?login=ok"));
  } catch (error) {
    console.error("[auth/google] erro no callback:", error);
    return NextResponse.redirect(homeUrl(request, "?login=erro"));
  }
}
