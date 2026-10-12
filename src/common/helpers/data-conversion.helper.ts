import { differenceInDays } from 'date-fns';

/**
 * Safe utility to convert BigInt, Decimal, number, null, or undefined to number
 * Handles all edge cases consistently including Prisma's Decimal type
 * Useful for converting database aggregation results across all modules
 */
export const toNum = (
  v: bigint | number | { toString: () => string } | null | undefined
): number => Number(v ?? 0);

/**
 * Timezone-safe day difference calculation
 * Normalizes both dates to UTC start-of-day to avoid midnight/timezone edge cases
 * Always returns consistent results regardless of time components or timezone
 * Useful for calculating expiry days, alert thresholds, date comparisons across modules
 */
export const safeDaysDifference = (
  futureDate: Date,
  baseDate: Date = new Date()
): number => {
  // Convert to UTC date strings and create new Date objects to normalize timezone
  const futureUTC = new Date(
    `${futureDate.toISOString().split('T')[0]}T00:00:00.000Z`
  );
  const baseUTC = new Date(
    `${baseDate.toISOString().split('T')[0]}T00:00:00.000Z`
  );
  return differenceInDays(futureUTC, baseUTC);
};
