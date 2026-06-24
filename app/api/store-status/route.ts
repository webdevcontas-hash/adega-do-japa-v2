import { NextResponse } from "next/server";
import { getClosingHour, getOpeningHour, isStoreOpen } from "@/lib/business-hours";

export async function GET() {
  return NextResponse.json({
    open: isStoreOpen(),
    openingHour: getOpeningHour(),
    closingHour: getClosingHour(),
  });
}
