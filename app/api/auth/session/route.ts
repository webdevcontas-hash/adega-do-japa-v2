import { NextResponse } from "next/server";
import { getCustomerSession, isGoogleConfigured } from "@/lib/customer-auth";

export async function GET() {
  const session = await getCustomerSession();
  return NextResponse.json({
    googleEnabled: isGoogleConfigured(),
    user: session ? { email: session.email, name: session.name, picture: session.picture } : null,
  });
}
