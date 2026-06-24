// Client-safe — sem imports de Node.js ou Prisma.
// O servidor recalcula do banco em lib/delivery-db.ts.

const DEFAULT_FEE = 12;

export function getDeliveryFee(_neighborhood?: string | null): number {
  return DEFAULT_FEE; // display estimate only; server recalculates from DB
}
