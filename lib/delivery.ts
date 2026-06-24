const NEIGHBORHOOD_FEES: Record<string, number> = {
  centro: 5,
  "jardim europa": 7,
  "vila nova": 8,
  "boa vista": 10,
};

const DEFAULT_FEE = 12;

export function getDeliveryFee(neighborhood?: string | null): number {
  if (!neighborhood) return DEFAULT_FEE;
  const key = neighborhood.trim().toLowerCase();
  return NEIGHBORHOOD_FEES[key] ?? DEFAULT_FEE;
}
