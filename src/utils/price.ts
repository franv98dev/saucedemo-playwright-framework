/** SauceDemo applies a flat 8% sales tax on the item total. */
export const TAX_RATE = 0.08;

/** Extracts the numeric value from strings like "$29.99" or "Item total: $29.99". */
export function parsePrice(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d{1,2})?)/);
  if (!match) throw new Error(`Could not parse a price from "${text}"`);
  return Number(match[1]);
}

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface OrderSummary {
  itemTotal: number;
  tax: number;
  total: number;
}

/** Independent calculation of the order summary, used as the oracle for checkout totals. */
export function calculateOrderSummary(prices: readonly number[]): OrderSummary {
  const itemTotal = roundToCents(prices.reduce((sum, price) => sum + price, 0));
  const tax = roundToCents(itemTotal * TAX_RATE);
  return { itemTotal, tax, total: roundToCents(itemTotal + tax) };
}
