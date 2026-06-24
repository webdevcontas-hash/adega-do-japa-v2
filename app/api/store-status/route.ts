import { NextResponse } from "next/server";
import { getClosingHour, getOpeningHour, isStoreOpen } from "@/lib/business-hours";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: "deliveryTime" } });
  return NextResponse.json({
    open: isStoreOpen(),
    openingHour: getOpeningHour(),
    closingHour: getClosingHour(),
    deliveryTime: setting?.value ?? "",
  });
}
