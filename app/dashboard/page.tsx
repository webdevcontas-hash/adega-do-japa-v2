import { isAuthenticated } from "@/lib/dashboard-auth";
import DashboardLogin from "@/components/DashboardLogin";
import DashboardPanel from "@/components/DashboardPanel";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authed = await isAuthenticated();
  return authed ? <DashboardPanel /> : <DashboardLogin />;
}
