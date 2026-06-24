const TIMEZONE = "America/Sao_Paulo";

export function getOpeningHour(): number {
  return Number(process.env.BUSINESS_HOURS_OPEN ?? 18);
}

export function getClosingHour(): number {
  return Number(process.env.BUSINESS_HOURS_CLOSE ?? 3);
}

export function getStoreHour(date: Date = new Date()): number {
  const hourString = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(date);
  return Number(hourString) % 24;
}

export function isStoreOpen(date: Date = new Date()): boolean {
  const hour = getStoreHour(date);
  const open = getOpeningHour();
  const close = getClosingHour();
  if (open === close) return true;
  if (open < close) return hour >= open && hour < close;
  return hour >= open || hour < close;
}
