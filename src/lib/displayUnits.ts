/**
 * Display helpers — convert internal stored values into the app's
 * default display units: g, mL, cm, m², °C, MAD, Wh.
 *
 * Existing data in the DB is stored in oz / USD. These helpers normalize
 * to base units at render time without requiring a schema migration.
 */
import { convert, formatMAD, fromBase } from "./units";

/** Internal currency assumption for legacy stored values. */
const STORED_CURRENCY = "USD";

/** Format a stored USD amount as MAD. */
export function money(usd: number | null | undefined, decimals = 2): string {
  const v = Number(usd ?? 0);
  const mad = convert(v, STORED_CURRENCY, "MAD"); // uses CURRENCY_TO_MAD
  return formatMAD(mad, decimals);
}

/** Format a stored "$ per ounce" rate as "MAD per gram". */
export function moneyPerGram(usdPerOz: number | null | undefined, decimals = 3): string {
  const perOz = Number(usdPerOz ?? 0);
  // (USD/oz) * (MAD/USD) / (g/oz)  →  MAD/g
  const madPerG = convert(perOz, STORED_CURRENCY, "MAD") / convert(1, "oz", "g");
  return `${madPerG.toFixed(decimals)} MAD/g`;
}

/** Convert ounces → grams for display. */
export function ozToGrams(oz: number | null | undefined, decimals = 0): string {
  const g = convert(Number(oz ?? 0), "oz", "g");
  return `${g.toFixed(decimals)} g`;
}

/** Raw numeric grams from ounces (for charts / math). */
export function ozToGramsNum(oz: number | null | undefined): number {
  return convert(Number(oz ?? 0), "oz", "g");
}

/** Raw numeric MAD from USD (for charts / math). */
export function usdToMadNum(usd: number | null | undefined): number {
  return convert(Number(usd ?? 0), STORED_CURRENCY, "MAD");
}
