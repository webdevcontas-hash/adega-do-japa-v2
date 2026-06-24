import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { buildAuthUrl } from "@/lib/google-oauth";
import { isGoogleConfigured } from "@/lib/customer-auth";

const STATE_COOKIE = "g_oauth_state";

export async function GET() {
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      { error: "Login com Google não está configurado." },
      { status: 503 }
    );
  }

  const state = randomBytes(16).toString("hex");
  (await cookies()).set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildAuthUrl(state));
}
