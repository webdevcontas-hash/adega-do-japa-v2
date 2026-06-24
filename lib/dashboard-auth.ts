import { cookies } from "next/headers";

const COOKIE_NAME = "dashboard_session";

export async function isAuthenticated(): Promise<boolean> {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return false;
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === password;
}

export async function createDashboardSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, process.env.DASHBOARD_PASSWORD ?? "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
}
