/**
 * Normalize decimal numbers by removing trailing zeros
 * Examples: 12.00 => 12, 12.50 => 12.5, 12.25 => 12.25
 * @param value - The number, string, or Decimal value to normalize
 * @param decimalPlaces - Number of decimal places to round to (default: 2)
 * @returns Normalized number without trailing zeros
 */
export function normalizeDecimal(
  value: number | string | { toString: () => string },
  decimalPlaces: number = 2
): number {
  const num = Number(value);
  return Number.parseFloat(num.toFixed(decimalPlaces));
}

/**
 * Generate a slug from a string
 * @param name - The string to generate a slug from
 * @returns The generated slug
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[^\da-z]/g, '-')
    .replaceAll(/-+/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
}

export function stringOrNA(value: string | null | undefined): string {
  return value ?? 'N/A';
}
