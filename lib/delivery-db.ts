// Server-only — importa Prisma. Nunca importar em Client Components.
import { prisma } from "./prisma";

const DEFAULT_FEE = 12;

export async function getDeliveryFeeAsync(neighborhood?: string | null): Promise<number> {
  const [zones, defaultSetting] = await Promise.all([
    prisma.deliveryZone.findMany(),
    prisma.setting.findUnique({ where: { key: "deliveryDefaultFee" } }),
  ]);
  const defaultFee = defaultSetting ? Number(defaultSetting.value) : DEFAULT_FEE;
  if (!neighborhood || zones.length === 0) return defaultFee;
  const zone = zones.find((z) => z.neighborhood.toLowerCase() === neighborhood.trim().toLowerCase());
  return zone?.fee ?? defaultFee;
}
